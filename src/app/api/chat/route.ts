import { getApp } from "@/actions/get-app";
import { freestyle } from "@/lib/freestyle";
import { getAppIdFromHeaders } from "@/lib/utils";
import { MCPClient } from "@mastra/mcp";
import { builderAgent } from "@/mastra/agents/builder";
import { deleteStream, getStream, setStream } from "@/lib/streams";
import { CoreMessage } from "@mastra/core";
import { db } from "@/lib/db";
import { messagesTable } from "@/db/schema";
import { Message } from "ai";

// "fix" mastra mcp bug
import { EventEmitter } from "events";

EventEmitter.defaultMaxListeners = 1000;

export async function POST(req: Request) {
  const appId = getAppIdFromHeaders(req);

  if (!appId) {
    return new Response("Missing App Id header", { status: 400 });
  }

  // At this point, appId is guaranteed to be non-null, so we can safely assert it
  const safeAppId: string = appId;

  const app = await getApp(safeAppId);
  if (!app) {
    return new Response("App not found", { status: 404 });
  }

  // Check for existing stream - for follow-up messages, we should clear it
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

  // Extract content as string for processing
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

  // Reload app data to get the latest messages including the one we just saved
  const updatedApp = await getApp(safeAppId);
  const conversationHistory = updatedApp.messages || [];
  
  console.log(`Loading conversation history: ${conversationHistory.length} messages`);
  
  // Build message context for the agent - only include recent context to avoid token limits
  const recentMessages = conversationHistory.slice(-10); // Last 10 messages to keep context manageable
  const messageContext = recentMessages.map(msg => ({
    role: msg.role as "user" | "assistant",
    content: typeof msg.content === 'string' ? msg.content : String(msg.content),
  }));

  const mcp = new MCPClient({
    id: crypto.randomUUID(),
    servers: {
      dev_server: {
        url: new URL(mcpEphemeralUrl),
      },
    },
  });

  const toolsets = await mcp.getToolsets();

  const rootStream = new TransformStream();
  let assistantMessage = "";
  let assistantMessageId = crypto.randomUUID();

  let fixCount = 0;
  async function runAgent(prompt: Parameters<typeof builderAgent.stream>[0]) {
    const stream = await builderAgent.stream(prompt, {
      threadId: safeAppId,
      resourceId: safeAppId,
      maxSteps: 100,
      maxRetries: 0,
      maxTokens: 64000,

      // experimental_continueSteps: true,
      toolsets,
      onError: async (error) => {
        await mcp.disconnect();
        console.error("Error:", error);
      },
      onFinish: async (res) => {
        deleteStream(safeAppId);
        console.log("Finished with reason:", res.finishReason);

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

        if (res.finishReason === "tool-calls" && fixCount < 10) {
          fixCount++;
          runAgent([
            {
              role: "user",
              content: "continue",
            },
          ]);

          return;
        }

        const pageRes = await fetch(ephemeralUrl);

        if (!pageRes.ok && fixCount < 10) {
          fixCount++;
          console.log("the page errored");
          runAgent([
            {
              role: "user",
              content: "The page returned 500. Please fix it.",
            },
          ]);
          return;
        }

        if (fixCount == 10) {
          console.log("reached max fix count, will not retry anymore");
        } else {
          console.log("no detected errors. ending stream");
        }

        await mcp.disconnect();
        // todo: better solution
        await rootStream.writable.abort();
        console.log("Stream ended");
      },
      toolCallStreaming: true,
    });

    const dataStream = stream.toDataStream();
    
    // Capture assistant message content for saving
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        
        // Parse the streaming data to extract text content
        const lines = text.split('\n').filter(line => line.trim());
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'text-delta' && data.textDelta) {
                assistantMessage += data.textDelta;
              }
            } catch (e) {
              // Ignore parsing errors for non-JSON data
            }
          }
        }
        
        controller.enqueue(chunk);
      }
    });

    dataStream.pipeThrough(transformStream).pipeThrough(rootStream, {
      preventClose: true,
    });
  }

  runAgent(messageContext);

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
