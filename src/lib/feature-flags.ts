// Feature flags for gradual rollout
export const featureFlags = {
  // Enable enhanced prompts for premium websites
  usePremiumPrompts: true,
  
  // Enable website analysis features
  enableWebsiteAnalysis: true,
};

// Helper to check if Claude Code is enabled
// Check at runtime instead of build time to support environment variable changes
export function isClaudeCodeEnabled(): boolean {
  // Check the environment variable at runtime
  // This allows changes without rebuilding
  if (typeof window !== 'undefined') {
    // Client-side: check if explicitly set to false, otherwise default to true
    return process.env.NEXT_PUBLIC_USE_CLAUDE_CODE !== "false";
  }
  // Server-side: same logic
  return process.env.NEXT_PUBLIC_USE_CLAUDE_CODE !== "false";
} 