import { ClaudeCodeMessage, ClaudeCodeOptions, WebsiteGenerationRequest } from "./types";
import { generateContextualPrompt } from "./prompts";
import { ClaudeCodeDiagnostic } from "./diagnostic";

// Dynamic import to avoid Windows installation issues
let claudeCodeQuery: any;

export class ClaudeCodeService {
  private initialized = false;

  private async initialize() {
    if (!this.initialized) {
      try {
        // This will only work on Vercel/Linux environments
        const claudeCode = await import("@anthropic-ai/claude-code");
        claudeCodeQuery = claudeCode.query;
        this.initialized = true;
      } catch (error) {
        console.error("Failed to initialize Claude Code SDK:", error);
        throw new Error("Claude Code SDK is not available in this environment");
      }
    }
  }

  async *query(
    request: WebsiteGenerationRequest,
    options?: ClaudeCodeOptions
  ): AsyncGenerator<ClaudeCodeMessage> {
    await this.initialize();

    if (!claudeCodeQuery) {
      throw new Error("Claude Code SDK not properly initialized");
    }

    // Reset diagnostics for new generation
    ClaudeCodeDiagnostic.reset();
    console.log("[Claude Code] Starting new website generation...");

    // Build the prompt based on the request
    const prompt = this.buildPrompt(request);
    
    // Generate contextual system prompt
    const systemPrompt = generateContextualPrompt({
      industry: request.requirements.industry,
      style: request.requirements.style,
      features: request.requirements.features,
    });

    // Configure Claude Code options
    const claudeOptions = {
      maxTurns: options?.maxTurns || 50, // Increased turns to ensure completion
      system_prompt: systemPrompt,
      allowed_tools: options?.allowedTools || ["Read", "Write", "Bash", "RunCommand"],
      cwd: options?.cwd || "/", // Use root directory
      abortController: options?.abortController,
    };

    try {
      // Call Claude Code SDK
      for await (const message of claudeCodeQuery({
        prompt,
        options: claudeOptions,
      })) {
        // Transform Claude Code messages to our format
        yield this.transformMessage(message);
      }
      
      // Check completion after generation
      const isComplete = ClaudeCodeDiagnostic.checkCompletion();
      const summary = ClaudeCodeDiagnostic.getSummary();
      
      console.log("[Claude Code] Generation Summary:", {
        complete: isComplete,
        tasksCompleted: `${summary.completedTasks}/${summary.totalTasks}`,
        completionRate: `${summary.completionRate.toFixed(1)}%`
      });
      
      if (!isComplete) {
        yield {
          type: "error",
          content: `WARNING: Website generation incomplete! Only ${summary.completedTasks}/${summary.totalTasks} tasks completed.`,
        };
      }
    } catch (error) {
      console.error("[Claude Code] Error during generation:", error);
      yield {
        type: "error",
        content: `Claude Code error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  private buildPrompt(request: WebsiteGenerationRequest): string {
    let prompt = `Create a COMPLETE, PROFESSIONAL website. ${request.prompt}
    
IMPORTANT: 
- Build the ENTIRE website, not just a placeholder
- Complete ALL features and pages requested
- Use REAL, PROFESSIONAL content throughout
- Make it look PREMIUM and EXPENSIVE
- DO NOT stop until EVERYTHING is complete`;

    // Add context if provided
    if (request.context?.currentWebsite) {
      prompt += `\n\nCurrent website: ${request.context.currentWebsite}`;
    }

    if (request.context?.inspirationUrls?.length) {
      prompt += `\n\nInspiration websites: ${request.context.inspirationUrls.join(", ")}`;
    }

    if (request.context?.brandGuidelines) {
      const { colors, fonts, tone, logoUrl } = request.context.brandGuidelines;
      prompt += "\n\nBrand Guidelines:";
      if (colors?.length) prompt += `\n- Colors: ${colors.join(", ")}`;
      if (fonts?.length) prompt += `\n- Fonts: ${fonts.join(", ")}`;
      if (tone) prompt += `\n- Tone: ${tone}`;
      if (logoUrl) prompt += `\n- Logo: ${logoUrl}`;
    }

    // Add requirements
    prompt += `\n\nRequirements:`;
    prompt += `\n- Style: ${request.requirements.style}`;
    prompt += `\n- Features: ${request.requirements.features.join(", ")}`;
    
    if (request.requirements.pages?.length) {
      prompt += `\n- Pages: ${request.requirements.pages.join(", ")}`;
    }
    
    if (request.requirements.seoKeywords?.length) {
      prompt += `\n- SEO Keywords: ${request.requirements.seoKeywords.join(", ")}`;
    }
    
    if (request.requirements.targetAudience) {
      prompt += `\n- Target Audience: ${request.requirements.targetAudience}`;
    }

    // Add technical preferences
    if (request.technical) {
      prompt += "\n\nTechnical Preferences:";
      if (request.technical.animations !== undefined) {
        prompt += `\n- Animations: ${request.technical.animations ? "Yes" : "Minimal"}`;
      }
      if (request.technical.performance) {
        prompt += `\n- Performance: ${request.technical.performance}`;
      }
    }

    return prompt;
  }

  private transformMessage(claudeMessage: any): ClaudeCodeMessage {
    // Transform Claude Code's message format to our internal format
    // This mapping will depend on the actual Claude Code SDK response format
    
    // Log for diagnostics
    ClaudeCodeDiagnostic.logMessage(
      claudeMessage.type || "unknown",
      claudeMessage.content || claudeMessage.description || "No content",
      claudeMessage
    );
    
    // Handle different message types from Claude Code
    if (claudeMessage.type === "plan") {
      const result = {
        type: "plan" as const,
        content: claudeMessage.content || "Planning website structure...",
        metadata: {
          plan: claudeMessage.plan || [],
        },
      };
      ClaudeCodeDiagnostic.logMessage("plan", "Created plan", result.metadata);
      return result;
    }

    if (claudeMessage.type === "file_edit" || claudeMessage.type === "file_create") {
      return {
        type: claudeMessage.type === "file_create" ? "create" : "edit",
        content: claudeMessage.description || "Modifying files...",
        metadata: {
          file: claudeMessage.file,
          diff: claudeMessage.diff || claudeMessage.content,
        },
      };
    }

    if (claudeMessage.type === "explanation") {
      return {
        type: "explanation",
        content: claudeMessage.content,
      };
    }

    if (claudeMessage.type === "error") {
      return {
        type: "error",
        content: claudeMessage.content || claudeMessage.message,
      };
    }

    if (claudeMessage.type === "complete" || claudeMessage.finished) {
      return {
        type: "complete",
        content: "Website generation complete!",
      };
    }

    // Default case for unknown message types
    return {
      type: "explanation",
      content: claudeMessage.content || JSON.stringify(claudeMessage),
    };
  }

  async generateWebsite(
    request: WebsiteGenerationRequest,
    options?: ClaudeCodeOptions
  ): Promise<AsyncGenerator<ClaudeCodeMessage>> {
    return this.query(request, options);
  }
} 