declare module "@anthropic-ai/claude-code" {
  export interface QueryOptions {
    maxTurns?: number;
    system_prompt?: string;
    allowed_tools?: string[];
    cwd?: string;
    abortController?: AbortController;
  }

  export interface QueryParams {
    prompt: string;
    options?: QueryOptions;
  }

  export interface QueryMessage {
    type: string;
    content?: string;
    file?: string;
    diff?: string;
    plan?: string[];
    description?: string;
    message?: string;
    finished?: boolean;
  }

  export function query(params: QueryParams): AsyncGenerator<QueryMessage>;
} 