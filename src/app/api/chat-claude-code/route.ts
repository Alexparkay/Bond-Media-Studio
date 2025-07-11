import { getApp } from "@/actions/get-app";
import { freestyle } from "@/lib/freestyle";
import { getAppIdFromHeaders } from "@/lib/utils";
import { MCPClient } from "@mastra/mcp";
import { deleteStream, getStream, setStream } from "@/lib/streams";
import { CoreMessage } from "@mastra/core";
import { db } from "@/lib/db";
import { messagesTable } from "@/db/schema";
import { Message } from "ai";
import { claudeCodeManager } from "@/services/claude-code";
import { ClaudeCodeStreamAdapter } from "@/services/claude-code/streaming";
import { MCPBridge } from "@/services/claude-code/mcp-bridge";

// "fix" mastra mcp bug
import { EventEmitter } from "events";
EventEmitter.defaultMaxListeners = 1000;

// Access global streams
declare const streams: Record<string, { readable: ReadableStream; prompt?: string }>;

export async function POST(req: Request) {
  console.log("[Claude Code Route] Request received - Using Claude Code for premium website generation!");
  const appId = getAppIdFromHeaders(req);

  if (!appId) {
    return new Response("Missing App Id header", { status: 400 });
  }

  const safeAppId: string = appId;

  const app = await getApp(safeAppId);
  if (!app) {
    return new Response("App not found", { status: 404 });
  }

  // Clear existing stream for new messages
  const existingStream = await getStream(safeAppId);
  if (existingStream) {
    console.log("Found existing stream, clearing it for new message");
    await deleteStream(safeAppId);
  }

  const { mcpEphemeralUrl, ephemeralUrl } = await freestyle.requestDevServer({
    repoId: app.info.gitRepo,
    baseId: app.info.baseId,
  });

  const { message }: { message: CoreMessage } = await req.json();

  // Extract content as string
  const messageContent = typeof message.content === 'string' 
    ? message.content 
    : Array.isArray(message.content) 
      ? message.content.map(part => 
          'text' in part ? part.text : ''
        ).join(' ')
      : String(message.content);

  // Save user message to database
  const userMessage: Message = {
    id: crypto.randomUUID(),
    role: "user",
    content: messageContent,
    createdAt: new Date(),
  };

  await db.insert(messagesTable).values({
    id: userMessage.id,
    appId: safeAppId,
    message: userMessage,
  });

  // Set up MCP client
  const mcp = new MCPClient({
    id: crypto.randomUUID(),
    servers: {
      dev_server: {
        url: new URL(mcpEphemeralUrl),
      },
    },
  });

  const toolsets = await mcp.getToolsets();
  const mcpBridge = new MCPBridge(mcp, toolsets);

  // Parse the user's request
  const websiteRequest = claudeCodeManager.parseUserPrompt(messageContent);
  console.log("[Claude Code Route] Website request:", {
    type: websiteRequest.type,
    style: websiteRequest.requirements.style,
    features: websiteRequest.requirements.features,
    pages: websiteRequest.requirements.pages,
  });

  // Create the root stream for response
  const rootStream = new TransformStream();
  let assistantMessage = "";
  const assistantMessageId = crypto.randomUUID();

  // Create abort controller for cancellation
  const abortController = new AbortController();

  async function generateWebsite() {
    try {
      // Generate website using Claude Code
      const claudeOptions = {
        maxTurns: 50, // Increased to ensure full website completion
        abortController,
        cwd: "/", // Use root directory
      };

      // Pass toolsets to the stream adapter so it can execute file operations
      const streamAdapter = new ClaudeCodeStreamAdapter(mcp, toolsets);
      let isFirstMessage = true;

      for await (const message of claudeCodeManager.generateWebsite(
        websiteRequest,
        claudeOptions,
        mcp,
        toolsets
      )) {
        // Convert message to stream format
        const streamMessage = {
          type: isFirstMessage ? "start" : "delta",
          textDelta: message.content || "",
          toolInvocations: message.toolInvocations,
        };
        isFirstMessage = false;

        // Capture content for database
        if (message.content) {
          assistantMessage += message.content;
        }

        // Write to stream
        const encoder = new TextEncoder();
        const chunk = encoder.encode(
          `data: ${JSON.stringify(streamMessage)}\n\n`
        );
        
        const writer = rootStream.writable.getWriter();
        await writer.write(chunk);
        writer.releaseLock();
      }

      // Save assistant message to database
      if (assistantMessage.trim()) {
        const finalAssistantMessage: Message = {
          id: assistantMessageId,
          role: "assistant",
          content: assistantMessage,
          createdAt: new Date(),
        };

        await db.insert(messagesTable).values({
          id: finalAssistantMessage.id,
          appId: safeAppId,
          message: finalAssistantMessage,
        });
      }

      // Check if the page is working
      const pageRes = await fetch(ephemeralUrl);
      if (!pageRes.ok) {
        console.log("Page returned error, may need fixes");
      }

    } catch (error) {
      console.error("Error generating website:", error);
      
      // Send error message
      const errorMessage = {
        type: "error",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
      
      const encoder = new TextEncoder();
      const chunk = encoder.encode(`data: ${JSON.stringify(errorMessage)}\n\n`);
      
      const writer = rootStream.writable.getWriter();
      await writer.write(chunk);
      writer.releaseLock();
    } finally {
      await mcp.disconnect();
      await rootStream.writable.close();
      deleteStream(safeAppId);
      console.log("Stream ended");
    }
  }

  // Start generation
  generateWebsite();

  const [stream1, stream2] = rootStream.readable.tee();
  await setStream(safeAppId, stream2, messageContent);

  return new Response(stream1, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export async function GET(req: Request) {
  const appId = getAppIdFromHeaders(req);
  if (!appId) {
    return new Response("Missing App Id header", { status: 400 });
  }

  return new Response(
    JSON.stringify({
      stream: streams[appId] && {
        prompt: streams[appId].prompt,
      },
    })
  );
} 