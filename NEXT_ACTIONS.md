# Vector HQ - NEXT ACTIONS (Quick Start)

## 🎯 IMMEDIATE NEXT STEPS

### Step 1: Get API Key (10 minutes)
```
1. Open browser
2. Visit: https://aistudio.google.com/app/apikey
3. Sign in with Google account
4. Click "Create API Key" button
5. Copy the generated key
6. Return to Vector HQ
7. Paste into modal
8. Click "SAVE"
9. App should now be functional!
```

### Step 2: Quick Smoke Test (5 minutes)
```
1. Modal should close automatically
2. App shows "New Project" button
3. Click "New Project"
4. Small input modal appears
5. Enter: "Create a marketing landing page for a SaaS company"
6. Click "Submit"
7. Watch tasks appear in Kanban
8. Tasks should execute
9. Should see final output (>100 words!)
```

### Step 3: Full Agency Testing (2-3 hours)

#### Test #1: Vector HQ Studio (Text)
**Goal**: Get production-quality output (code, specs, copy)

```
Brief: "Build a Next.js e-commerce platform with Stripe integration"
Expected Output: Full code scaffold, architecture docs, setup guide
Time: ~5 minutes
Success Criteria:
  ✅ Tasks execute without errors
  ✅ Final output >500 words
  ✅ Code is actually deployable
  ✅ Specs are comprehensive
  ✅ Copy is professional
```

#### Test #2: Nano Banana Lab (Image)
**Goal**: Verify image generation pipeline

```
Brief: "Create concept art for a futuristic city with flying cars"
Expected Output: Image descriptions, design specs, mood boards
Time: ~5 minutes
Success Criteria:
  ✅ Scene descriptions detailed
  ✅ Color palettes specified
  ✅ Design is coherent
  ✅ Output is >200 words
```

#### Test #3: Lyria Factory (Music)
**Goal**: Verify music generation pipeline

```
Brief: "Compose upbeat electronic dance music for a game menu"
Expected Output: Music descriptions, instrumentation, tempo/BPM specs
Time: ~5 minutes
Success Criteria:
  ✅ Genre specified correctly
  ✅ Instrumentation detailed
  ✅ BPM/tempo calculated
  ✅ Output is >200 words
```

#### Test #4: Veo Studio (Video)
**Goal**: Verify video generation pipeline

```
Brief: "Create promotional video for fitness app showing users working out"
Expected Output: Shot list, storyboard, camera directions, audio specs
Time: ~5 minutes
Success Criteria:
  ✅ Scene-by-scene breakdown
  ✅ Timing specified
  ✅ Audio sync notes
  ✅ Output is >300 words
```

---

## 📊 BUGS TO TRACK DURING TESTING

While testing, **document any issues you find**:

```
Bug Template:
- Agency: [Text/Image/Music/Video]
- Brief Used: [exact text]
- Error Message: [if any]
- Screenshot: [before/after]
- Time to Reproduce: [steps]
- Severity: [Critical/High/Medium/Low]
- Workaround: [if any]
```

---

## 🔄 IF YOU HIT ERRORS

### Error: "API Error: 429 Quota Exceeded"
```
Solution:
1. Create new API key at https://aistudio.google.com/app/apikey
2. Clear localStorage:
   - Press F12 (Dev Tools)
   - Go to Application tab
   - Storage > Local Storage
   - Find key 'byok-config'
   - Delete it
3. Refresh page
4. Paste new API key
```

### Error: "Gemini API key is required"
```
Solution:
1. Make sure you already saved an API key
2. Check that the key is valid (not truncated)
3. Look in browser DevTools > Network tab
4. Should see successful response from api.generativelanguage.com
5. If not, the key is invalid
```

### Error: Tasks not appearing in Kanban
```
Solution:
1. Wait 2-3 seconds (tasks render async)
2. Check browser console (F12 > Console tab)
3. Look for error messages
4. Refresh page
5. Submit brief again
```

### Error: App appears frozen
```
Solution:
1. Check that your API key has quota remaining
2. Visit https://aistudio.google.com/app/usage to check quota
3. If quota is 0, create new free key
4. Hard refresh (Ctrl+Shift+R)
5. Clear localStorage (if necessary)
```

---

## 📈 WHAT TO LOOK FOR

### Good Signs (✅)
- Tasks execute quickly (<5 minutes per project)
- Outputs are >100 words (after our fix)
- No JavaScript errors in console
- Modal closes cleanly after API key save
- Final output button works and shows full results
- Token tracking is accurate
- Each agency produces different output types

### Bad Signs (🚩)
- Tasks stuck in "in_progress" state
- Outputs are truncated or cut off
- Console shows repeated errors
- Modal doesn't close or can't dismiss errors
- Final output missing or empty
- Token counts don't match
- Time estimates way off

---

## 🎓 IMPORTANT NOTES

### About the Word Limit Fix
Before today: All outputs were limited to 100 words max
After today: 
- Task titles: 150 words
- Complete task results: 2000 words
- Final deliverables: 5000 words

This means **real code/specs can now be generated**, not just prompts!

### About Error Handling
Before today: Error modals were stuck and required hard refresh
After today:
- "Dismiss Error & Retry" button available
- Click X to close modal
- Click background to dismiss

You can now **recover from errors without refreshing**!

### About Testing Scope
This is **not** production testing yet. We're validating:
- [ ] Core workflows still work with fixes
- [ ] All 4 agencies can execute
- [ ] Error recovery flows work
- [ ] Outputs meet quality standards
- [ ] No new bugs introduced

If major issues found, document them and we'll fix before production launch.

---

## 📞 IF YOU GET STUCK

Check these in order:

1. **F12 Browser Console** - Most errors logged there
2. **Gemini API Documentation** - https://ai.google.dev/docs
3. **Original TESTING_REPORT.md** - Lists all known issues
4. **IMPLEMENTATION_PLAN.md** - Explains all fixes applied

---

## ✅ SUCCESS CRITERIA

### You'll know it's working when:
1. ✅ App loads without any error modals
2. ✅ Can submit a brief successfully
3. ✅ Tasks appear in the Kanban board
4. ✅ Tasks execute without errors
5. ✅ Final output is generated
6. ✅ Final output is >100 words (proven it works!)
7. ✅ Can test all 4 agencies without issues
8. ✅ Cost tracking is visible and reasonable

---

## 🚀 FINAL CHECKLIST

Before you start testing:
- [ ] You have a valid Gemini API key (not expired/quota exceeded)
- [ ] You've pasted it into the modal in the app
- [ ] The modal closed successfully
- [ ] You can see the "New Project" button
- [ ] Browser console (F12) shows no errors
- [ ] You have ~15 minutes available for testing

---

**Ready? You're all set! Start with Step 1 above. 🎯**
