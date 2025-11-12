# Complete Setup Guide - Fake Image Detector

This guide will help you set up the complete Fake Image Detector application with Next.js frontend and FastAPI backend.

## Project Structure

```
Fake-Image-Detector-Model/
├── backend/                 # FastAPI backend server
│   ├── app.py              # Main API server
│   ├── requirements.txt    # Python dependencies
│   └── start.sh           # Startup script
├── frontend/               # Next.js frontend app
│   ├── app/               # Next.js app directory
│   ├── public/           # Static files (icons, manifest)
│   ├── package.json       # Node dependencies
│   └── .env.local         # Environment variables
└── best_resnet50.pth      # Your trained model file (PLACE HERE)
```

## Prerequisites

### Backend Requirements
- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended)

### Frontend Requirements
- Node.js 16 or higher
- npm or yarn

## Step 1: Place Your Model File

**IMPORTANT: Place your `.pth` model file in the project root directory**

```
Fake-Image-Detector-Model/
└── best_resnet50.pth  ← Place your .pth file here
```

The backend will automatically look for the model file in the parent directory of the `backend` folder.

If your model file has a different name, update `MODEL_PATH` in `backend/app.py`:

```python
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "your-model-name.pth")
```

## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd backend
```

### 2.2 Create Virtual Environment (Recommended)

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```

### 2.3 Install Dependencies

```bash
pip install -r requirements.txt
```

### 2.4 Verify Model File Location

Ensure your `.pth` file is in the project root (parent directory of `backend/`):

```bash
# From backend directory, check if model exists
ls ../best_resnet50.pth
```

### 2.5 Start Backend Server

```bash
python app.py
```

Or use the startup script:

```bash
chmod +x start.sh
./start.sh
```

The backend will start on `http://localhost:8000`

### 2.6 Verify Backend is Running

Open your browser and visit:
- `http://localhost:8000/health`

You should see:
```json
{"status": "healthy", "model_loaded": true}
```

If `model_loaded` is `false`, check:
1. Model file exists in the correct location
2. Model file name matches in `app.py`
3. Check backend logs for error messages

## Step 3: Frontend Setup

### 3.1 Navigate to Frontend Directory

Open a new terminal window:

```bash
cd frontend
```

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

```bash
# Create .env.local file
touch .env.local
```

Add the following content:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production, update with your backend URL:
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### 3.4 Create App Icons (Optional but Recommended)

Create app icons for PWA support. Place these files in `frontend/public/`:

- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)
- `icon.png` (at least 192x192 pixels)

You can:
1. Use any image editor to create these
2. Use online tools like [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
3. The app will work without them, but icons are needed for proper PWA support

### 3.5 Start Frontend Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 3.6 Verify Frontend is Working

1. Open `http://localhost:3000` in your browser
2. You should see the Fake Image Detector app
3. Try uploading an image to test the connection

## Step 4: Testing the Complete Application

### 4.1 Test Backend API

Test the backend directly using curl:

```bash
curl -X POST "http://localhost:8000/predict" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/test-image.jpg"
```

### 4.2 Test Frontend

1. Open `http://localhost:3000`
2. Click "Choose from Gallery" or "Take Photo"
3. Select an image
4. Click "Analyze Image"
5. View the results

## Step 5: Adding to Home Screen (PWA)

### iOS (Safari)

1. Open the app in Safari on your iPhone/iPad
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Customize the name if desired
5. Tap "Add"

### Android (Chrome)

1. Open the app in Chrome on your Android device
2. Tap the menu (3 dots in top right)
3. Tap "Add to Home Screen" or "Install App"
4. Tap "Add" or "Install"

## Troubleshooting

### Backend Issues

#### Model File Not Found

**Error:**
```
FileNotFoundError: [Errno 2] No such file or directory: '../best_resnet50.pth'
```

**Solution:**
1. Verify the model file is in the project root directory
2. Check the file name matches exactly (case-sensitive)
3. Update `MODEL_PATH` in `backend/app.py` if using a different file name

#### Port Already in Use

**Error:**
```
Address already in use
```

**Solution:**
```bash
# Find process using port 8000
lsof -ti:8000

# Kill the process (macOS/Linux)
lsof -ti:8000 | xargs kill

# Or change the port in app.py
uvicorn.run(app, host="0.0.0.0", port=8001)
```

#### Module Not Found

**Error:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Solution:**
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

### Frontend Issues

#### Cannot Connect to Backend

**Error:**
```
Network request failed
Cannot connect to server
```

**Solution:**
1. Ensure backend is running: `http://localhost:8000/health`
2. Check `.env.local` has correct API URL
3. Verify CORS is enabled in backend (should be by default)
4. Check browser console for detailed error messages

#### Build Errors

**Error:**
```
Module not found
Build failed
```

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules .next
npm install

# Clear cache and rebuild
npm run build -- --no-cache
```

#### PWA Not Working

**Issues:**
- "Add to Home Screen" not showing
- App icons not displaying

**Solution:**
1. Ensure you're using HTTPS in production (required for PWA)
2. Check that `manifest.json` is accessible at `/manifest.json`
3. Verify icons exist in `public/` folder
4. Check browser console for service worker errors
5. Clear browser cache and try again

### General Issues

#### CORS Errors

**Error:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution:**
The backend already has CORS enabled for all origins. If you need to restrict it:

1. Edit `backend/app.py`
2. Update CORS settings:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Network Issues (Physical Device)

**Problem:**
App works on simulator but not on physical device

**Solution:**
1. Find your computer's IP address:
   - macOS/Linux: `ifconfig` or `ip addr`
   - Windows: `ipconfig`
2. Update `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://192.168.1.100:8000
   ```
3. Ensure device and computer are on same WiFi network
4. Update backend to allow your IP in CORS (if restricted)
5. Restart both backend and frontend

## Production Deployment

### Backend Deployment

1. **Choose a hosting service:**
   - AWS, Google Cloud, Azure
   - Heroku, Railway, Render
   - DigitalOcean, Linode

2. **Deploy steps:**
   ```bash
   # Install dependencies
   pip install -r requirements.txt
   
   # Upload model file to server
   # Update MODEL_PATH if needed
   
   # Start server
   python app.py
   # Or use gunicorn/uvicorn for production
   ```

3. **Update CORS:**
   - Allow only your frontend domain
   - Use environment variables for configuration

### Frontend Deployment

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Deploy to:**
   - Vercel (recommended for Next.js)
   - Netlify
   - AWS Amplify
   - Your own server

3. **Update environment variables:**
   - Set `NEXT_PUBLIC_API_URL` to production backend URL
   - Ensure HTTPS is enabled (required for PWA)

4. **Verify:**
   - App loads correctly
   - API calls work
   - PWA functions properly
   - Icons display correctly

## File Locations Summary

### Model File
```
Fake-Image-Detector-Model/
└── best_resnet50.pth  ← Your model file goes here
```

### Backend Files
```
backend/
├── app.py              ← Main API server
├── requirements.txt    ← Python dependencies
└── start.sh           ← Startup script (optional)
```

### Frontend Files
```
frontend/
├── app/
│   ├── page.tsx       ← Main app page
│   ├── layout.tsx     ← App layout
│   └── globals.css    ← Global styles
├── public/
│   ├── manifest.json  ← PWA manifest
│   └── icon-*.png     ← App icons
├── .env.local         ← Environment variables
└── package.json       ← Node dependencies
```

## Quick Start Commands

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd frontend
npm install
# Create .env.local with NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all files are in correct locations
3. Check backend and frontend logs for errors
4. Ensure all dependencies are installed
5. Verify environment variables are set correctly

## Next Steps

1. ✅ Place your `.pth` model file in the project root
2. ✅ Set up and start the backend
3. ✅ Set up and start the frontend
4. ✅ Test the application
5. ✅ Add to home screen (PWA)
6. ✅ Deploy to production (optional)

Good luck! 🚀

