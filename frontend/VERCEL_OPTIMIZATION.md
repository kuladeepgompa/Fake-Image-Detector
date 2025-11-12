# Vercel Function Size Optimization Guide

## Problem
Vercel has a 250 MB limit for serverless functions. The `onnxruntime-node` package is very large and can exceed this limit.

## Solutions Applied

### 1. Output File Tracing Exclusions
We've configured `outputFileTracingExcludes` in `next.config.js` to exclude:
- Test files
- Documentation
- Source maps
- Other platform binaries (only Linux x64 for Vercel)
- Model file (served via CDN from public/)

### 2. Model File Handling
The model file (`model.onnx`) should be in `frontend/public/` directory. This ensures:
- It's served via Vercel's CDN (not bundled in function)
- It's accessible at runtime via HTTP or file system
- It doesn't count toward function size

### 3. Alternative: Host Model Externally
If the function is still too large, consider hosting the model externally:

**Option A: Download model on first request**
```typescript
// In route.ts
async function downloadModelIfNeeded() {
  const modelPath = path.join(process.cwd(), 'public', 'model.onnx')
  if (!fs.existsSync(modelPath)) {
    // Download from CDN/S3/etc
    const response = await fetch('https://your-cdn.com/model.onnx')
    const buffer = await response.arrayBuffer()
    await fs.promises.writeFile(modelPath, Buffer.from(buffer))
  }
}
```

**Option B: Use environment variable for model URL**
```typescript
const modelUrl = process.env.MODEL_URL || '/model.onnx'
// Load from URL instead of file system
```

### 4. Check Function Size
To check your function size before deploying:

```bash
# Build locally
npm run build

# Check .next/server/app/api/analyze/route.js size
du -sh .next/server/app/api/analyze/
```

### 5. Further Optimizations

If still too large, consider:

1. **Use ONNX Runtime Web** (browser-based, but won't work server-side)
2. **Quantize the model** - Reduce model precision to shrink file size
3. **Split into multiple functions** - Separate preprocessing from inference
4. **Use Edge Functions** - But ONNX Runtime doesn't work on Edge
5. **Deploy backend separately** - Use Railway/Render free tier for Python backend

## Current Configuration

- ✅ Excludes unnecessary platform binaries
- ✅ Excludes test/documentation files  
- ✅ Model served from public/ (CDN)
- ✅ Dynamic imports for ONNX Runtime

## If Still Failing

1. Check Vercel build logs for exact size
2. Consider using a separate backend service (Railway/Render free tier)
3. Use model quantization to reduce size
4. Contact Vercel support about Pro plan limits

