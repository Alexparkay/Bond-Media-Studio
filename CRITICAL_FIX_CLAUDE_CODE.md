# CRITICAL FIX: Claude Code Not Being Used

## The Problem

Your console logs show:
```
[Chat] Using API route: /api/chat, Claude Code enabled: false
```

**Claude Code was NOT being used at all!** You were hitting the standard chat route.

## Why This Happened

1. **Environment variables with `NEXT_PUBLIC_` prefix are baked in at BUILD TIME in Next.js**
2. Setting `NEXT_PUBLIC_USE_CLAUDE_CODE=true` in Vercel AFTER deployment doesn't work
3. You need to REBUILD after setting the environment variable

## The Fix Applied

I've made Claude Code the DEFAULT behavior - no environment variable needed:

```typescript
// Before
const useClaudeCode = isClaudeCodeEnabled();
const apiRoute = useClaudeCode ? "/api/chat-claude-code" : "/api/chat";

// After
const apiRoute = "/api/chat-claude-code"; // ALWAYS use Claude Code
```

## What You Need to Do NOW

1. **Commit and push the changes:**
```bash
git add -A
git commit -m "Make Claude Code the default - no env var needed"
git push
```

2. **Wait for Vercel to deploy**

3. **Test again** - you should see in console:
```
[Chat] Using API route: /api/chat-claude-code (Claude Code ALWAYS enabled)
```

## Additional Issues to Watch For

The chat shows errors like:
```
Error: ENOENT: no such file or directory, scandir '/template/template'
```

This suggests path issues. Once Claude Code is actually running, we can debug further.

## Verification

After deployment, in your browser console you should see:
- `[Chat] Using API route: /api/chat-claude-code (Claude Code ALWAYS enabled)`
- No more "Claude Code enabled: false" messages

In Vercel logs you should see:
- `[Claude Code Route] Request received`
- `[MCP Bridge] Writing file:` messages
- Actual file operations

## If Preview Still Doesn't Work

Once Claude Code is actually running, if preview still doesn't work:
1. Check Vercel logs for MCP Bridge file operations
2. Ensure Freestyle sandbox is properly initialized
3. Try refreshing the preview window 