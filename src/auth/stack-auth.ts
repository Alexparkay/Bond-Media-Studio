import "server-only";

import { StackServerApp } from "@stackframe/stack";
import { freestyle } from "@/lib/freestyle";

// Validate required environment variables
const requiredEnvVars = {
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
  secretServerKey: process.env.STACK_SECRET_SERVER_KEY,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required Stack Auth environment variables: ${missingVars.join(', ')}. ` +
    `Please ensure all Stack Auth environment variables are set in your .env file or Vercel dashboard.`
  );
}

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  projectId: requiredEnvVars.projectId!,
  publishableClientKey: requiredEnvVars.publishableClientKey!,
  secretServerKey: requiredEnvVars.secretServerKey!,
});

export async function getUser() {
  const user = await stackServerApp.getUser();

  if (!user) {
    throw new Error("User not found");
  }

  if (!user?.serverMetadata?.freestyleIdentity) {
    const gitIdentity = await freestyle.createGitIdentity();

    await user.update({
      serverMetadata: {
        ...user.serverMetadata,
        freestyleIdentity: gitIdentity.id,
      }
    });
  }

  return {
    userId: user.id,
    freestyleIdentity: user.serverMetadata?.freestyleIdentity || '',
  };
}
