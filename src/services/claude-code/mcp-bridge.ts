import { MCPClient } from "@mastra/mcp";
import { FileEdit } from "./types";

export class MCPBridge {
  constructor(private mcpClient: MCPClient, private toolsets?: any) {}

  async getToolsets() {
    if (!this.toolsets) {
      this.toolsets = await this.mcpClient.getToolsets();
    }
    return this.toolsets;
  }

  async executeFileOperation(edit: FileEdit): Promise<any> {
    const toolsets = await this.getToolsets();
    
    try {
      if (edit.operation === "create" || edit.operation === "update") {
        // Use write_file tool for both create and update
        const writeTool = toolsets.find((t: any) => t.name === "write_file");
        if (writeTool) {
          console.log(`[MCP Bridge] Writing file: ${edit.path}`);
          const result = await writeTool.execute({
            path: edit.path,
            content: edit.content,
          });
          return result;
        }
      } else if (edit.operation === "delete") {
        const deleteTool = toolsets.find((t: any) => t.name === "delete_file");
        if (deleteTool) {
          console.log(`[MCP Bridge] Deleting file: ${edit.path}`);
          const result = await deleteTool.execute({
            path: edit.path,
          });
          return result;
        }
      }
      
      throw new Error(`Tool not found for operation: ${edit.operation}`);
    } catch (error) {
      console.error(`[MCP Bridge] Error executing file operation:`, error);
      throw error;
    }
  }

  async readFile(path: string): Promise<string> {
    const toolsets = await this.getToolsets();
    const readTool = toolsets.find((t: any) => t.name === "read_file");
    
    if (readTool) {
      const result = await readTool.execute({ path });
      return result.content || "";
    }
    
    throw new Error("read_file tool not found");
  }

  async listDirectory(path: string): Promise<string[]> {
    const toolsets = await this.getToolsets();
    const listTool = toolsets.find((t: any) => t.name === "list_directory");
    
    if (listTool) {
      const result = await listTool.execute({ path });
      return result.files || [];
    }
    
    throw new Error("list_directory tool not found");
  }

  async executeCommand(command: string): Promise<string> {
    const toolsets = await this.getToolsets();
    const execTool = toolsets.find((t: any) => t.name === "exec");
    
    if (execTool) {
      const result = await execTool.execute({ command });
      return result.output || "";
    }
    
    throw new Error("exec tool not found");
  }
} 