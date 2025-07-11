import { CoreMessage } from "@mastra/core";
import { ToolInvocation } from "ai";

export interface WebsiteGenerationRequest {
  type: "new" | "redesign" | "feature" | "optimization";
  prompt: string;
  context?: {
    currentWebsite?: string;
    inspirationUrls?: string[];
    brandGuidelines?: {
      colors?: string[];
      fonts?: string[];
      tone?: string;
      logoUrl?: string;
    };
  };
  requirements: {
    style: "modern" | "classic" | "minimalist" | "luxury" | "bold" | "elegant";
    features: string[];
    pages?: string[];
    seoKeywords?: string[];
    targetAudience?: string;
    industry?: string;
  };
  technical?: {
    framework?: "nextjs" | "vite" | "expo";
    animations?: boolean;
    performance?: "standard" | "optimized" | "ultra";
  };
}

export interface ClaudeCodeMessage {
  type: "plan" | "edit" | "create" | "explanation" | "error" | "complete";
  content: string;
  metadata?: {
    file?: string;
    diff?: string;
    plan?: string[];
    toolCalls?: any[];
  };
}

export interface ClaudeCodeResponse {
  messages: ClaudeCodeMessage[];
  filesChanged: string[];
  success: boolean;
  error?: string;
}

export interface StreamableMessage {
  id: string;
  role: "assistant" | "user" | "system";
  content: string;
  toolInvocations?: ToolInvocation[];
}

export interface ClaudeCodeOptions {
  maxTurns?: number;
  systemPrompt?: string;
  allowedTools?: string[];
  cwd?: string;
  abortController?: AbortController;
}

export interface FileEdit {
  path: string;
  content: string;
  operation: "create" | "update" | "delete";
} 