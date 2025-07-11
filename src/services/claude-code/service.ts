import { ClaudeCodeMessage, ClaudeCodeOptions, WebsiteGenerationRequest } from "./types";
import { generateContextualPrompt } from "./prompts";
import { ClaudeCodeDiagnostic } from "./diagnostic";
import Anthropic from "@anthropic-ai/sdk";

export class ClaudeCodeService {
  private anthropic: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is required for Claude Code service");
    }
    this.anthropic = new Anthropic({ apiKey });
  }

  async *query(
    request: WebsiteGenerationRequest,
    options?: ClaudeCodeOptions
  ): AsyncGenerator<ClaudeCodeMessage> {
    // Reset diagnostics for new generation
    ClaudeCodeDiagnostic.reset();
    console.log("[Claude Code Service] Starting website generation using Anthropic API...");

    // Build the prompt based on the request
    const prompt = this.buildPrompt(request);
    
    // Generate contextual system prompt
    const systemPrompt = generateContextualPrompt({
      industry: request.requirements.industry,
      style: request.requirements.style,
      features: request.requirements.features,
    });

    try {
      // Create a simulated plan
      const todoItems = [
        "Set up project structure and dependencies",
        "Create responsive navigation component",
        "Build hero section with compelling messaging",
        "Implement features/services showcase",
        "Add testimonials section",
        "Create contact form with validation",
        "Implement footer with links and information",
        "Add SEO optimization and meta tags",
        "Style with premium design and animations",
        "Ensure mobile responsiveness"
      ];

      yield {
        type: "plan",
        content: "Creating a comprehensive plan for your premium website...",
        metadata: {
          plan: todoItems
        }
      };

      // Use Anthropic API to generate the website structure
      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{
          role: "user",
          content: `${prompt}

Please create a complete Next.js website with the following structure:
1. Update app/page.tsx with the complete homepage
2. Create necessary components in components/
3. Update app/globals.css with custom styles
4. Include all sections: hero, features, testimonials, contact, footer
5. Use Tailwind CSS for styling
6. Make it look premium and professional

Respond with the complete code for each file, starting with:
FILE: app/page.tsx
[complete code]

FILE: components/Navigation.tsx
[complete code]

And so on for each file needed.`
        }]
      });

      // Parse the response and create file operations
      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      const files = this.parseFilesFromResponse(content);

      // Yield file creation messages
      for (const file of files) {
        yield {
          type: "create",
          content: `Creating ${file.path}...`,
          metadata: {
            file: file.path,
            diff: file.content
          }
        };
      }

      // Complete
      yield {
        type: "complete",
        content: "Website generation complete! Your premium website is ready."
      };

    } catch (error) {
      console.error("[Claude Code Service] Error during generation:", error);
      yield {
        type: "error",
        content: `Error: ${error instanceof Error ? error.message : String(error)}`,
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

  private parseFilesFromResponse(content: string): Array<{ path: string; content: string }> {
    const files: Array<{ path: string; content: string }> = [];
    const fileRegex = /FILE:\s*(.+?)\n([\s\S]*?)(?=FILE:|$)/g;
    
    let match;
    while ((match = fileRegex.exec(content)) !== null) {
      const path = match[1].trim();
      const fileContent = match[2].trim();
      files.push({ path, content: fileContent });
    }

    // If no files were parsed, create a default homepage
    if (files.length === 0) {
      files.push({
        path: "app/page.tsx",
        content: `export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto px-6 py-16">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
          Welcome to Your Premium Website
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl">
          Transform your business with our cutting-edge solutions.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all transform hover:scale-105">
          Get Started Today
        </button>
      </div>
    </main>
  );
}`
      });
    }

    return files;
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