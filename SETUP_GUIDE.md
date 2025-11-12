# Setup Guide - Fake Image Detector Mobile App

## Prerequisites

### Backend Requirements
- Python 3.8 or higher
- pip (Python package manager)

### Mobile App Requirements
- Node.js 16 or higher
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for Mac) or Android Emulator
- Or Expo Go app on your physical device

## Step-by-Step Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Make sure the model file exists in the parent directory
# The file should be: ../best_resnet50.pth

# Start the backend server
python app.py
```

The backend will start on `http://localhost:8000`

**Verify it's working:**
- Open browser: `http://localhost:8000/health`
- Should see: `{"status": "healthy", "model_loaded": true}`

### 2. Mobile App Setup

```bash
# Navigate to mobile app directory
cd mobile-app

# Install Node dependencies
npm install

# Configure API URL (IMPORTANT!)
# Edit config.js and update API_URL:
# - For simulator: 'http://localhost:8000'
# - For physical device: 'http://YOUR_COMPUTER_IP:8000'
```

**Finding your computer's IP address:**
- **Mac/Linux**: Run `ifconfig` or `ip addr` and look for your local network IP (usually 192.168.x.x)
- **Windows**: Run `ipconfig` and look for IPv4 Address

**Update config.js:**
```javascript
// For physical device:
export const API_URL = 'http://192.168.1.100:8000'; // Your IP
```

### 3. Start the Mobile App

```bash
# In the mobile-app directory
npm start
```

This will:
- Start the Expo development server
- Show a QR code in the terminal
- Open Expo DevTools in your browser

**Options:**
- Press `i` to open iOS Simulator (Mac only)
- Press `a` to open Android Emulator
- Scan QR code with Expo Go app on your physical device
- Press `w` to open in web browser

### 4. Testing

1. **Start the backend** (must be running first)
2. **Start the mobile app**
3. **In the app:**
   - Tap "Choose from Gallery" or "Take Photo"
   - Select or take an image
   - Tap "Analyze Image"
   - View the results!

## Troubleshooting

### Backend Issues

**Problem: Model file not found**
```
Error: [Errno 2] No such file or directory: '../best_resnet50.pth'
```
**Solution:** Ensure `best_resnet50.pth` is in the project root directory (parent of backend/)

**Problem: Port 8000 already in use**
```
Error: Address already in use
```
**Solution:** 
- Kill the process: `lsof -ti:8000 | xargs kill` (Mac/Linux)
- Or change the port in `app.py`: `uvicorn.run(app, host="0.0.0.0", port=8001)`

**Problem: Module not found**
```
ModuleNotFoundError: No module named 'fastapi'
```
**Solution:** Install dependencies: `pip install -r requirements.txt`

### Mobile App Issues

**Problem: Cannot connect to API**
```
Network request failed
```
**Solutions:**
1. Ensure backend is running (`http://localhost:8000/health`)
2. Check API_URL in `config.js`
3. For physical device: Ensure device and computer are on same WiFi network
4. Check firewall settings (may need to allow port 8000)

**Problem: Permission denied (camera/gallery)**
```
Permission denied
```
**Solution:** Grant permissions when prompted, or go to device Settings > App > Permissions

**Problem: Expo not found**
```
Command not found: expo
```
**Solution:** Install Expo CLI: `npm install -g expo-cli`

**Problem: Metro bundler errors**
```
Error: Unable to resolve module
```
**Solution:** 
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear cache: `npm start -- --reset-cache`

## Development Tips

### Backend Development
- The server auto-reloads on code changes (if using `--reload` flag)
- Check logs in terminal for debugging
- Test API with curl or Postman before testing in app

### Mobile App Development
- Press `r` in terminal to reload the app
- Press `m` to toggle developer menu
- Check Expo DevTools in browser for logs
- Use React Native Debugger for advanced debugging

## Production Deployment

### Backend
1. Deploy to cloud service (AWS, GCP, Heroku, etc.)
2. Update CORS in `app.py` to allow only your app domain
3. Use environment variables for configuration
4. Set up SSL/HTTPS

### Mobile App
1. Update `config.js` with production API URL
2. Build standalone app: `expo build:ios` or `expo build:android`
3. Configure app icons and splash screens
4. Submit to App Store / Google Play

## Need Help?

- Check the README files in `backend/` and `mobile-app/` directories
- Review error messages carefully
- Ensure all prerequisites are installed
- Verify network connectivity (for physical device testing)

