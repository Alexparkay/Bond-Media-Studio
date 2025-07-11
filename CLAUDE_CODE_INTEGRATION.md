# Claude Code Integration for Premium Website Generation

## Overview

This project now integrates Claude Code SDK to power exceptional website generation. Claude Code is Anthropic's agentic coding toolkit that provides far more powerful code generation capabilities than standard Claude models.

## Features

- **Agentic Code Generation**: Claude Code plans, implements, and refines websites through multiple iterations
- **Premium Website Focus**: Specialized prompts and workflows optimized for creating high-converting, professional websites
- **Automatic Feature Detection**: Parses user requests to identify style preferences, required features, and industry context
- **Streaming Integration**: Real-time updates as Claude Code generates your website
- **MCP Tool Integration**: Seamless file operations through the existing Freestyle sandbox infrastructure

## Activation

To enable Claude Code for website generation:

1. Set the environment variable in your `.env` file:
   ```
   NEXT_PUBLIC_USE_CLAUDE_CODE=true
   ```

2. Deploy to Vercel (Claude Code SDK requires a Linux environment and won't work on Windows locally)

3. Your existing `ANTHROPIC_API_KEY` will automatically work with Claude Code - no additional configuration needed

## How It Works

### 1. Request Processing
When a user submits a prompt, the system:
- Analyzes the request to extract website requirements
- Identifies style preferences (modern, luxury, minimalist, etc.)
- Detects required features (contact forms, booking systems, etc.)
- Determines industry context for specialized implementations

### 2. Claude Code Generation
Claude Code then:
- Creates a comprehensive plan for the website
- Generates files incrementally with production-ready code
- Implements responsive design, SEO optimization, and accessibility
- Adds animations and micro-interactions for premium feel
- Optimizes performance with lazy loading and code splitting

### 3. Specialized Prompts
The system uses carefully crafted prompts that emphasize:
- Professional, high-converting designs
- Modern web development best practices
- SEO and performance optimization
- Accessibility compliance (WCAG 2.1 AA)
- Industry-specific requirements

## Website Styles Supported

- **Modern**: Clean lines, bold typography, gradients, glassmorphism
- **Luxury**: Dark themes, gold accents, elegant fonts, premium imagery
- **Minimalist**: Maximum whitespace, simple typography, muted colors
- **Bold**: Bright colors, large type, strong contrasts, dynamic layouts
- **Classic**: Timeless design, traditional layouts, serif fonts
- **Elegant**: Sophisticated colors, refined typography, subtle animations

## Features Automatically Detected

- Contact forms with validation
- Booking/appointment systems
- Newsletter signups
- Testimonials sections
- Portfolio galleries
- Blog functionality
- E-commerce capabilities
- Team member showcases
- FAQ sections
- Pricing tables

## Technical Implementation

### File Structure
```
src/services/claude-code/
├── index.ts              # Main service manager
├── service.ts            # Claude Code SDK integration
├── streaming.ts          # Stream adaptation layer
├── prompts.ts            # Specialized website prompts
├── types.ts              # TypeScript interfaces
├── mock.ts               # Local development mock
├── mcp-bridge.ts         # MCP tool integration
└── website-builder-agent.ts  # Mastra agent wrapper
```

### API Routes
- `/api/chat` - Original implementation (when Claude Code is disabled)
- `/api/chat-claude-code` - Claude Code implementation (when enabled)

## Local Development

Since Claude Code SDK doesn't install on Windows, use the mock service for local development:

1. Keep `NEXT_PUBLIC_USE_CLAUDE_CODE=false` locally
2. The mock service simulates Claude Code responses
3. Test the full implementation on Vercel staging

## Performance Considerations

- Claude Code uses up to 10 turns for complex websites
- Each turn may involve multiple file operations
- Generation time varies based on website complexity
- Streaming ensures users see progress in real-time

## Best Practices

1. **Clear Prompts**: Be specific about design preferences and features
2. **Industry Context**: Mention the business type for tailored implementations
3. **Inspiration Sites**: Provide URLs for design reference
4. **Brand Guidelines**: Include colors, fonts, and tone preferences
5. **SEO Keywords**: Specify important keywords for optimization

## Example Prompts

### Basic
"Create a modern landing page for a SaaS product with pricing tiers and demo booking"

### Detailed
"Build a luxury real estate website with property showcase, virtual tours, and contact forms. Use dark theme with gold accents. Target high-net-worth individuals searching for premium properties in Manhattan."

### Redesign
"Redesign my existing website (example.com) with a more modern, minimalist approach. Keep the same content but improve the visual hierarchy and add smooth animations."

## Troubleshooting

### Claude Code Not Working
1. Verify `NEXT_PUBLIC_USE_CLAUDE_CODE=true` is set
2. Ensure deployment is on Vercel (not local Windows)
3. Check Anthropic API key is valid
4. Review Vercel function logs for errors

### Generation Quality Issues
1. Provide more specific requirements in prompts
2. Include inspiration websites or brand guidelines
3. Specify target audience and business goals
4. Use industry-specific keywords

## Future Enhancements

- A/B testing between Claude Code and standard generation
- Custom style presets
- Template library integration
- Multi-language website support
- Advanced analytics integration

## API Usage

Claude Code uses your existing Anthropic API key. Usage is billed the same as regular Claude API calls, but Claude Code may use more tokens due to its agentic nature and multiple turns.

Monitor your usage through the Anthropic console and set appropriate limits if needed. 