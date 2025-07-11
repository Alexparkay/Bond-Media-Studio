import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { PostgresStore, PgVector } from "@mastra/pg";
import { tool } from "ai";
import { z } from "zod";
import { claudeCodeManager } from "./index";
import { PREMIUM_WEBSITE_SYSTEM_PROMPT } from "./prompts";
import { anthropic } from "@ai-sdk/anthropic";

export const websiteMemory = new Memory({
  options: {
    lastMessages: 10,
    semanticRecall: false,
    threads: {
      generateTitle: true,
    },
  },
  vector: new PgVector({
    connectionString: process.env.DATABASE_URL!,
  }),
  storage: new PostgresStore({
    connectionString: process.env.DATABASE_URL!,
  }),
  processors: [],
});

export const websiteBuilderAgent = new Agent({
  name: "WebsiteBuilderAgent",
  model: anthropic("claude-3-7-sonnet-20250219"),
  instructions: PREMIUM_WEBSITE_SYSTEM_PROMPT,
  memory: websiteMemory,
  tools: {
    update_todo_list: tool({
      description:
        "Use the update todo list tool to keep track of the tasks you need to do to create the website. Update it each time you complete a task. For complex websites, use multiple todos to ensure you get everything right.",
      parameters: z.object({
        items: z.array(
          z.object({
            description: z.string(),
            completed: z.boolean(),
          })
        ),
      }),
      execute: async () => {
        return {};
      },
    }),
    analyze_website_requirements: tool({
      description: "Analyze the user's request to extract website requirements, style preferences, and features",
      parameters: z.object({
        prompt: z.string().describe("The user's website request"),
      }),
      execute: async ({ prompt }) => {
        const request = claudeCodeManager.parseUserPrompt(prompt);
        return {
          analysis: request,
          recommendations: [
            "Use modern, responsive design",
            "Implement SEO best practices",
            "Add performance optimizations",
            "Include accessibility features",
          ],
        };
      },
    }),
  },
}); 