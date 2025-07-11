# Claude Code Integration Test Guide - PREVIEW FIX APPLIED

## 🚨 CRITICAL FIX: Preview Now Actually Works! 🚨

**The preview wasn't showing because file operations were SIMULATED, not EXECUTED!**

### What Was Fixed:
1. ✅ **MCP Bridge now executes real file operations** (was returning fake success)
2. ✅ **Files are actually written to Freestyle sandbox** (was just logging)
3. ✅ **Path issues resolved** (/template prefix removed)
4. ✅ **"Continue" command works properly** (doesn't restart from scratch)

## Quick Diagnostic Checklist

### 1. **Verify Environment Variable**
Check that `NEXT_PUBLIC_USE_CLAUDE_CODE=true` is set in your Vercel environment.

### 2. **Check Browser Console**
When you submit a prompt, you should see:
```
[Chat] Using API route: /api/chat-claude-code, Claude Code enabled: true
```

If you see `Claude Code enabled: false`, the environment variable is not set correctly.

### 3. **Check Vercel Function Logs**
In your Vercel dashboard, check the function logs. You should NOW see:
```
[Claude Code Route] Request received - Using Claude Code for premium website generation!
[Claude Code] Starting new website generation...
[MCP Bridge] Writing file: app/page.tsx
[Stream Adapter] Executing create for file: app/page.tsx
[Stream Adapter] File operation successful: app/page.tsx
[MCP Bridge] Writing file: components/navigation.tsx
[Stream Adapter] File operation successful: components/navigation.tsx
[MCP Bridge] Writing file: components/hero.tsx
[Stream Adapter] File operation successful: components/hero.tsx
...
```

**🎯 KEY DIFFERENCE: You should see actual file operations being executed!**

## What Has Been Fixed

### 1. **Enhanced System Prompts**
- Added CRITICAL requirements to NEVER create "coming soon" pages
- Explicit instructions to complete ALL todo items
- Mandatory completion checklist
- Clear directive to continue until EVERYTHING is complete

### 2. **Increased Processing Capacity**
- Increased `maxTurns` from 10 to 50
- Added more allowed tools including "RunCommand"
- Enhanced prompt building to enforce completion

### 3. **Diagnostic Logging**
- Added comprehensive logging to track progress
- Task completion tracking
- Warning when tasks are incomplete
- Summary of generation results

### 4. **Prompt Enhancement**
- Automatic enhancement of user prompts
- Explicit requirements for full websites
- No placeholders or lorem ipsum allowed

## Test Prompts

### Basic Test
```
Create a modern landing page for a SaaS product
```

Expected: Full landing page with hero, features, pricing, testimonials, footer

### Detailed Test
```
Build a luxury real estate website with property showcase, virtual tours, agent profiles, and contact forms. Use dark theme with gold accents.
```

Expected: Complete multi-section website with all requested features

### Stress Test
```
Create a complete digital agency website with portfolio, services, team, blog, and contact sections. Make it look premium and expensive.
```

Expected: Full website with all sections implemented

## Troubleshooting

### Issue: Preview Not Showing / Blank Preview

**This should now be FIXED!** But if you still have issues:

1. **Check File Operations in Logs**
   - Look for `[MCP Bridge] Writing file:` messages
   - Confirm `[Stream Adapter] File operation successful` messages
   - If you see these, files ARE being created

2. **Refresh the Preview**
   - Click the refresh button in the preview window
   - Sometimes the preview needs a manual refresh

3. **Check for Errors**
   - Look for `[MCP Bridge] Error executing file operation`
   - Check if MCP tools are available

4. **Verify Paths**
   - Files should be created as: `app/page.tsx`, `components/hero.tsx`
   - NOT as: `/template/app/page.tsx`

### Issue: Still Getting "Coming Soon" Pages

1. **Verify Claude Code is Active**
   - Check browser console for route confirmation
   - Check Vercel logs for Claude Code messages

2. **Clear Browser Cache**
   - Hard refresh (Ctrl+F5 or Cmd+Shift+R)
   - Try incognito/private browsing

3. **Check Vercel Deployment**
   - Ensure latest code is deployed
   - Verify environment variables in Vercel dashboard

### Issue: Tasks Not Completing

Check Vercel function logs for:
```
[Claude Code] WARNING: Only completed X/Y tasks!
```

This indicates Claude Code is running but stopping early. The enhanced prompts should prevent this.

### Issue: Not Using Claude Code Route

If you see in browser console:
```
[Chat] Using API route: /api/chat, Claude Code enabled: false
```

Then `NEXT_PUBLIC_USE_CLAUDE_CODE` is not set to `true` in your environment.

## Expected Behavior

When working correctly, Claude Code will:

1. Create a comprehensive todo list (10-20+ items)
2. Execute each task systematically
3. Generate complete, professional sections
4. Use real, compelling content
5. Apply premium design patterns
6. Complete ALL tasks before finishing

## Monitoring Generation

Watch the Vercel function logs in real-time to see:
- Task creation
- Progress updates
- File operations
- Completion status

## Performance Notes

- Generation may take 30-60 seconds for complex websites
- Multiple file operations will be performed
- Streaming ensures users see progress
- 50 turns allows for comprehensive completion

## Success Indicators

✅ Full website generated (not placeholders)
✅ All requested features implemented
✅ Professional, premium appearance
✅ Real content throughout
✅ Completion message shows 100% tasks done
✅ No "coming soon" or placeholder content

## Next Steps if Issues Persist

1. Check the diagnostic summary in Vercel logs
2. Look for any error messages
3. Verify the SDK is loading (no "SDK not available" errors)
4. Ensure sufficient function timeout (300s configured)
5. Monitor token usage in Anthropic console 