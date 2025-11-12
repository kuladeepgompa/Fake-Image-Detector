# Fake Image Detector - Mobile App

A complete mobile application solution for detecting fake/manipulated images using deep learning.

## Project Structure

```
Fake-Image-Detector-Model/
├── backend/              # FastAPI backend server
│   ├── app.py           # Main API server
│   ├── requirements.txt # Python dependencies
│   └── README.md        # Backend documentation
├── mobile-app/           # React Native mobile app
│   ├── App.js           # Main app component
│   ├── package.json     # Node dependencies
│   ├── app.json         # Expo configuration
│   └── README.md        # Mobile app documentation
└── best_resnet50.pth    # Trained model file
```

## Quick Start

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The backend will run on `http://localhost:8000`

### 2. Mobile App Setup

```bash
cd mobile-app
npm install
```

Update the API URL in `App.js`:
- For simulator: `http://localhost:8000`
- For physical device: `http://YOUR_COMPUTER_IP:8000`

```bash
npm start
```

Then press `i` for iOS or `a` for Android.

## Features

### Mobile App
- ✨ Beautiful gradient UI with smooth animations
- 📷 Image picker from gallery
- 📸 Camera integration
- 🔍 Real-time image analysis
- 📊 Detailed results with confidence scores
- ⚡ Fast and responsive
- 🎨 Modern design with React Native Reanimated

### Backend API
- 🚀 FastAPI for high performance
- 🤖 ResNet50 model inference
- 📡 CORS enabled for mobile access
- 🔒 Error handling and validation
- 📝 Detailed API documentation

## Requirements

### Backend
- Python 3.8+
- PyTorch 2.0+
- FastAPI
- See `backend/requirements.txt` for full list

### Mobile App
- Node.js 16+
- Expo CLI
- iOS Simulator or Android Emulator
- Or Expo Go app on physical device

## Usage

1. **Start the backend server** (required first)
2. **Start the mobile app**
3. **Select or take a photo**
4. **Tap "Analyze Image"**
5. **View results** with confidence scores

## API Configuration

For physical device testing:
1. Find your computer's IP address:
   - Mac/Linux: `ifconfig` or `ip addr`
   - Windows: `ipconfig`
2. Update `API_URL` in `mobile-app/App.js`:
   ```javascript
   const API_URL = 'http://192.168.1.100:8000'; // Your IP
   ```
3. Ensure both devices are on the same network
4. Update backend CORS if needed (currently allows all origins)

## Troubleshooting

### Backend Issues
- **Model not found**: Ensure `best_resnet50.pth` is in the project root
- **Port already in use**: Change port in `app.py` or kill the process using port 8000

### Mobile App Issues
- **Cannot connect to API**: Check API URL and ensure backend is running
- **Permission errors**: Grant camera/media permissions when prompted
- **Network errors**: Ensure device and computer are on same network (for physical devices)

## Development

### Backend Development
```bash
cd backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Mobile App Development
```bash
cd mobile-app
npm start
# Press 'r' to reload, 'm' to toggle menu
```

## Production Deployment

### Backend
- Deploy to cloud service (AWS, GCP, Heroku, etc.)
- Update CORS to allow only your app's domain
- Use environment variables for configuration
- Consider using a production ASGI server like Gunicorn

### Mobile App
- Build standalone app with `expo build`
- Update API URL to production backend
- Configure app icons and splash screens
- Submit to App Store / Google Play

## License

This project is for educational purposes.

