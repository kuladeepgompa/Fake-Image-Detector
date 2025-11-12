# Quick Start Guide

## Prerequisites
- **For Model Conversion (One-time)**: Python 3.9+ with PyTorch (`pip install torch torchvision`)
- **For Running App**: Node.js 18+

## 🆓 Free Vercel Deployment (Recommended!)

The app now uses **ONNX Runtime** - completely free, no Python server needed!

### Step 1: Convert Model to ONNX (One-time setup)

```bash
# Make sure you're in project root (where best_resnet50.pth is)
python convert_to_onnx.py
```

This creates `frontend/public/model.onnx` - your model that works on Vercel!

### Step 2: Install Dependencies

```bash
cd frontend
npm install
```

### Step 3: Run Locally

```bash
npm run dev
```

The app runs on `http://localhost:3000` - **no Python backend needed!**

### Step 4: Deploy to Vercel (Free!)

1. Push code to GitHub
2. Connect to Vercel
3. Deploy - **That's it!** No backend server, no costs! 🎉

See `ONNX_SETUP.md` for detailed instructions.

---

## Alternative: Local Development with Python (Old Method)

If you want to use the Python script locally instead:

1. **Install Python dependencies:**
   ```bash
   pip install -r frontend/requirements.txt
   ```

2. **Install Node.js dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Run:**
   ```bash
   npm run dev
   ```

## Using the Application

1. Open your browser and navigate to `http://localhost:3000`
2. Click "Choose Image" to select an image file
3. Click "Analyze Image" to get the prediction
4. View the results showing:
   - Prediction (Real or Fake)
   - Confidence percentage
   - Probability breakdown

## Troubleshooting

### Application won't start
- Make sure Node.js is installed: `node --version`
- Install Node.js dependencies: `cd frontend && npm install`
- Check if port 3000 is already in use

### Python/Model errors
- Make sure `best_resnet50.pth` is in the project root directory
- Verify Python 3 is available: `python3 --version`
- Install Python dependencies: `pip install -r frontend/requirements.txt`
- Check that all required packages are installed (torch, torchvision, pillow, opencv-python, numpy)

### Analysis fails
- Check the browser console for error messages
- Verify the model file exists and is accessible
- Ensure Python script is executable: `chmod +x frontend/scripts/analyze_image.py`

## API Testing

You can test the API directly using curl:

```bash
curl -X POST "http://localhost:3000/api/analyze" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/image.jpg"
```

## Health Check

```bash
curl http://localhost:3000/api/health
```

## Network Access

The Next.js app runs on `0.0.0.0` by default in development, making it accessible from other devices on your network:
- Find your computer's IP address: `ifconfig` (Mac/Linux) or `ipconfig` (Windows)
- Access from other devices: `http://YOUR_IP_ADDRESS:3000`

For production deployment, the entire application can be deployed as a single Next.js app!

