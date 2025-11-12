# ONNX Setup Guide (Free Solution for Vercel!)

This guide shows you how to convert your PyTorch model to ONNX format so it can run **completely free** on Vercel without needing a separate Python server!

## Why ONNX?

- ✅ **100% Free** - Runs on Vercel's free tier
- ✅ **No Python Server Needed** - Everything runs in Node.js
- ✅ **Fast** - Optimized inference runtime
- ✅ **Works on Vercel** - No external dependencies

## Step 1: Convert Model to ONNX

Run this command in your project root:

```bash
# Make sure you're in the project root (where best_resnet50.pth is)
python convert_to_onnx.py
```

This will create `frontend/public/model.onnx` - this is your model file that will work on Vercel!

**Requirements:**
- Python 3.9+ with PyTorch installed
- The `best_resnet50.pth` file in the project root

## Step 2: Install Dependencies

```bash
cd frontend
npm install
```

This will install:
- `onnxruntime-node` - Runs ONNX models in Node.js
- `sharp` - Fast image processing

## Step 3: Deploy to Vercel

1. Make sure `frontend/public/model.onnx` exists
2. Push your code to GitHub
3. Deploy to Vercel (it will automatically detect Next.js)
4. **That's it!** No backend server needed!

## File Structure

After conversion, you should have:
```
frontend/
├── public/
│   └── model.onnx  ← Your converted model (upload this to Vercel)
├── app/
│   └── api/
│       └── analyze/
│           └── route.ts  ← Uses ONNX Runtime
└── package.json
```

## Troubleshooting

### "ONNX model not found" error
- Make sure you ran `convert_to_onnx.py`
- Check that `frontend/public/model.onnx` exists
- The file should be ~100-200 MB

### Model conversion fails
- Make sure PyTorch is installed: `pip install torch torchvision`
- Check that `best_resnet50.pth` is in the project root
- Try running the conversion script with: `python convert_to_onnx.py`

### Vercel deployment fails
- Make sure `model.onnx` is in `frontend/public/` directory
- Check Vercel build logs for errors
- The model file will be uploaded with your deployment

## How It Works

1. **Local Development**: ONNX Runtime runs the model directly in Node.js
2. **Vercel Production**: Same thing! ONNX Runtime works on Vercel's serverless functions
3. **No Python**: Everything is pure Node.js/TypeScript

## Model Size

The ONNX model will be similar in size to your PyTorch model. Vercel's free tier supports files up to 100MB in the public directory, but you can use larger files with their Pro plan or by hosting the model on a CDN.

If your model is too large:
1. Use model quantization (reduce precision)
2. Host model on a CDN and download on first request
3. Use Vercel's Pro plan for larger files

## Next Steps

1. Convert the model: `python convert_to_onnx.py`
2. Test locally: `cd frontend && npm run dev`
3. Deploy to Vercel: Push to GitHub and connect to Vercel
4. Enjoy your free, serverless ML app! 🎉

