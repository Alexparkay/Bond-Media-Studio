import { ClaudeCodeService } from "./service";
import { MockClaudeCodeService } from "./mock";
import { ClaudeCodeStreamAdapter } from "./streaming";
import { WebsiteGenerationRequest, ClaudeCodeOptions } from "./types";

// Export all types
export * from "./types";
export * from "./prompts";

// Always use the real Claude Code service now that it's implemented with Anthropic API
const ServiceClass = ClaudeCodeService;

export class ClaudeCodeManager {
  private service: ClaudeCodeService | MockClaudeCodeService;
  private streamAdapter: ClaudeCodeStreamAdapter;

  constructor() {
    this.service = new ServiceClass();
    this.streamAdapter = new ClaudeCodeStreamAdapter();
  }

  async *generateWebsite(
    request: WebsiteGenerationRequest,
    options?: ClaudeCodeOptions,
    mcpClient?: any,
    toolsets?: any
  ) {
    // Get the raw Claude Code messages
    const messages = await this.service.generateWebsite(request, options);

    // If MCP client is provided, pass it to the stream adapter with toolsets
    if (mcpClient) {
      this.streamAdapter = new ClaudeCodeStreamAdapter(mcpClient, toolsets);
    }

    // Convert to AI SDK format and yield
    yield* this.streamAdapter.adaptToAISDKFormat(messages);
  }

  parseUserPrompt(prompt: string): WebsiteGenerationRequest {
    // Enforce professional website generation
    const enhancedPrompt = `${prompt}

CRITICAL: Create a COMPLETE, PROFESSIONAL website with:
- Full homepage with hero, features, testimonials, CTA sections
- Real, compelling content (NO placeholders or lorem ipsum)
- Premium design that looks expensive
- All requested features fully implemented
- Complete the ENTIRE website before stopping`;
    
    // Analyze the prompt to extract requirements
    const request: WebsiteGenerationRequest = {
      type: "new",
      prompt: enhancedPrompt,
      requirements: {
        style: "modern", // Default, can be extracted from prompt
        features: [],
        pages: ["home"],
      },
    };

    // Extract style preferences
    const stylePatterns = {
      modern: /modern|contemporary|sleek|clean/i,
      luxury: /luxury|premium|high-end|exclusive|elegant/i,
      minimalist: /minimal|simple|clean|sparse/i,
      bold: /bold|vibrant|colorful|dynamic/i,
      classic: /classic|traditional|timeless/i,
    };

    for (const [style, pattern] of Object.entries(stylePatterns)) {
      if (pattern.test(prompt)) {
        request.requirements.style = style as any;
        break;
      }
    }

    // Extract features
    const featurePatterns = {
      "contact form": /contact\s*(form|us)|get\s*in\s*touch/i,
      "booking system": /booking|appointment|schedule|calendar/i,
      "newsletter": /newsletter|subscribe|mailing\s*list/i,
      "testimonials": /testimonial|review|feedback|client\s*says/i,
      "portfolio": /portfolio|gallery|showcase|work\s*samples/i,
      "blog": /blog|articles|news|posts/i,
      "e-commerce": /shop|store|product|cart|payment/i,
      "team section": /team|about\s*us|staff|members/i,
      "FAQ": /faq|questions|q&a/i,
      "pricing": /pricing|plans|packages|cost/i,
    };

    for (const [feature, pattern] of Object.entries(featurePatterns)) {
      if (pattern.test(prompt)) {
        request.requirements.features.push(feature);
      }
    }

    // Extract page requirements
    if (/multi-page|multiple\s*pages/i.test(prompt)) {
      request.requirements.pages = ["home", "about", "services", "contact"];
    }

    // Extract industry/business type
    const industryPatterns = {
      "real estate": /real\s*estate|property|housing|realty/i,
      "saas": /saas|software|app|platform/i,
      "healthcare": /health|medical|clinic|doctor|wellness/i,
      "finance": /finance|banking|investment|wealth/i,
      "restaurant": /restaurant|food|dining|cafe|bistro/i,
      "fitness": /fitness|gym|training|coach|workout/i,
      "education": /education|school|course|learning|academy/i,
      "legal": /law|legal|attorney|lawyer/i,
      "consulting": /consulting|consultant|advisory/i,
      "agency": /agency|creative|design|marketing/i,
    };

    for (const [industry, pattern] of Object.entries(industryPatterns)) {
      if (pattern.test(prompt)) {
        request.requirements.industry = industry;
        break;
      }
    }

    // Check for redesign
    if (/redesign|update|refresh|modernize/i.test(prompt)) {
      request.type = "redesign";
    }

    // Check for optimization
    if (/optimize|improve|enhance|seo/i.test(prompt)) {
      request.type = "optimization";
    }

    return request;
  }
}

// Export a singleton instance
export const claudeCodeManager = new ClaudeCodeManager(); 