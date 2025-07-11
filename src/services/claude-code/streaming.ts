import { ToolInvocation } from "ai";
import { ClaudeCodeMessage, StreamableMessage } from "./types";
import { MCPClient } from "@mastra/mcp";
import { MCPBridge } from "./mcp-bridge";

export class ClaudeCodeStreamAdapter {
  private messageId = 0;
  private currentToolCalls: Map<string, ToolInvocation> = new Map();
  private mcpBridge?: MCPBridge;

  constructor(private mcpClient?: MCPClient, private toolsets?: any) {
    if (mcpClient && toolsets) {
      this.mcpBridge = new MCPBridge(mcpClient, toolsets);
    }
  }

  async *adaptToAISDKFormat(
    messages: AsyncGenerator<ClaudeCodeMessage>
  ): AsyncGenerator<StreamableMessage> {
    for await (const message of messages) {
      const streamableMessages = await this.convertMessage(message);
      for (const streamable of streamableMessages) {
        yield streamable;
      }
    }
  }

  private async convertMessage(
    message: ClaudeCodeMessage
  ): Promise<StreamableMessage[]> {
    const messages: StreamableMessage[] = [];
    const messageId = `msg_${this.messageId++}`;

    switch (message.type) {
      case "plan":
        messages.push({
          id: messageId,
          role: "assistant",
          content: message.content,
          toolInvocations: [
            {
              state: "result",
              toolCallId: `tool_${this.messageId}`,
              toolName: "update_todo_list",
              args: {
                items: message.metadata?.plan?.map((item) => ({
                  description: item,
                  completed: false,
                })) || [],
              },
              result: {},
            },
          ],
        });
        break;

      case "create":
      case "edit":
        const toolCallId = `tool_${this.messageId}`;
        const filePath = message.metadata?.file || "";
        // Ensure proper path formatting
        let fullPath = filePath;
        if (fullPath.startsWith("/template/")) {
          fullPath = fullPath.substring(10); // Remove /template/ prefix
        } else if (fullPath.startsWith("/")) {
          fullPath = fullPath.substring(1); // Remove leading slash
        }
        const content = this.extractContentFromDiff(message.metadata?.diff || "");
        
        const toolInvocation: ToolInvocation = {
          state: "call",
          toolCallId,
          toolName: message.type === "create" ? "write_file" : "edit_file",
          args: {
            path: fullPath,
            content: content,
          },
        };

        messages.push({
          id: messageId,
          role: "assistant",
          content: message.content,
          toolInvocations: [toolInvocation],
        });

        // Execute file operation via MCP Bridge
        if (this.mcpBridge && message.metadata?.file) {
          try {
            console.log(`[Stream Adapter] Executing ${message.type} for file: ${fullPath}`);
            
            const result = await this.mcpBridge.executeFileOperation({
              path: fullPath,
              content: content,
              operation: message.type === "create" ? "create" : "update",
            });
            
            console.log(`[Stream Adapter] File operation successful: ${fullPath}`);
            
            messages.push({
              id: `${messageId}_result`,
              role: "assistant",
              content: "",
              toolInvocations: [
                {
                  ...toolInvocation,
                  state: "result",
                  result: {
                    success: true,
                    message: `File ${fullPath} ${
                      message.type === "create" ? "created" : "updated"
                    } successfully`,
                    ...result,
                  },
                },
              ],
            });
          } catch (error) {
            console.error(`[Stream Adapter] File operation failed:`, error);
            messages.push({
              id: `${messageId}_error`,
              role: "assistant",
              content: `Error: ${error}`,
              toolInvocations: [
                {
                  ...toolInvocation,
                  state: "result",
                  result: {
                    isError: true,
                    error: error instanceof Error ? error.message : String(error),
                  },
                },
              ],
            });
          }
        } else {
          console.warn(`[Stream Adapter] No MCP Bridge available for file operations`);
        }
        break;

      case "explanation":
      case "complete":
        messages.push({
          id: messageId,
          role: "assistant",
          content: message.content,
        });
        break;

      case "error":
        messages.push({
          id: messageId,
          role: "assistant",
          content: `❌ Error: ${message.content}`,
        });
        break;

      default:
        messages.push({
          id: messageId,
          role: "assistant",
          content: message.content,
        });
    }

    return messages;
  }

  private extractContentFromDiff(diff: string): string {
    // Extract the actual content from diff format
    console.log(`[Stream Adapter] Extracting content from diff:`, diff.substring(0, 100) + "...");
    
    // If the diff is already just content (not in diff format), return it as-is
    if (!diff.includes("\n+") && !diff.includes("\n-")) {
      return diff;
    }
    
    // Parse diff format
    const lines = diff.split("\n");
    const contentLines = lines
      .filter((line) => line.startsWith("+"))
      .map((line) => line.substring(1));
    
    const content = contentLines.join("\n");
    console.log(`[Stream Adapter] Extracted content length: ${content.length} chars`);
    
    return content;
  }

  reset() {
    this.messageId = 0;
    this.currentToolCalls.clear();
  }
} 