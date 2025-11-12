# Fake Image Detector Web Application

A full-stack web application for detecting fake images using a trained ResNet50 model.

## Project Structure

```
Fake-Image-Detector-Model/
├── backend/              # Python FastAPI backend
│   ├── app.py           # Main API server
│   └── requirements.txt # Python dependencies
├── frontend/            # Next.js frontend
│   ├── app/             # Next.js app directory
│   ├── package.json     # Node.js dependencies
│   └── ...
├── best_resnet50.pth    # Trained model weights
└── README_WEB_APP.md    # This file
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Make sure `best_resnet50.pth` is in the project root (one level up from backend):
```bash
# The model file should be at: ../best_resnet50.pth
```

5. Start the backend server:
```bash
python app.py
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

1. Start both the backend and frontend servers
2. Open your browser and go to `http://localhost:3000`
3. Click "Choose Image" to upload an image
4. Click "Analyze Image" to get the prediction
5. View the results showing whether the image is real or fake, along with confidence scores

## API Endpoints

### POST /analyze
Analyzes an uploaded image to determine if it's real or fake.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: Form data with `file` field containing the image

**Response:**
```json
{
  "prediction": "real" | "fake",
  "confidence": 0.95,
  "probability_real": 0.95,
  "probability_fake": 0.05
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "device": "cpu" | "cuda"
}
```

## Troubleshooting

### Backend Issues

1. **Model not found**: Make sure `best_resnet50.pth` is in the project root directory
2. **Port already in use**: Change the port in `app.py` (line with `uvicorn.run`)
3. **CUDA errors**: The model will automatically use CPU if CUDA is not available

### Frontend Issues

1. **Cannot connect to backend**: 
   - Make sure the backend is running on port 8000
   - Check CORS settings in `backend/app.py` if accessing from a different origin
2. **Build errors**: Run `npm install` again to ensure all dependencies are installed

## Production Deployment

### Backend
- Use a production ASGI server like Gunicorn with Uvicorn workers
- Set up proper CORS origins for your frontend domain
- Use environment variables for configuration

### Frontend
- Build the production version: `npm run build`
- Start the production server: `npm start`
- Or deploy to Vercel/Netlify for automatic deployments

