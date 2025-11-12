# Quick Start Guide

## Prerequisites
- Python 3.9+ with required packages (torch, torchvision, pillow, opencv-python, numpy)
- Node.js 18+

## Starting the Application

The application is now fully integrated into Next.js - no separate backend server needed!

### Setup (First Time Only)

1. **Install Python dependencies:**
   ```bash
   pip install -r frontend/requirements.txt
   ```
   Or if you have a virtual environment:
   ```bash
   cd backend
   source venv/bin/activate
   pip install -r ../frontend/requirements.txt
   ```

2. **Install Node.js dependencies:**
   ```bash
   cd frontend
   npm install
   ```

### Starting the Application

**Single Command:**
```bash
cd frontend
npm run dev
```

The application will start on `http://localhost:3000` and is accessible from any device on your network!

### Alternative: Using the startup script

```bash
./start_frontend.sh
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

