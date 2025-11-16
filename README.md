TEAM MEMBERS:
KULADEEP (23BDS021)
HARSHITH (23BDS058)
BHARATH (23BDS012 )
SADAN (23BDS048)
GURU SAI HARSHA (23BDS005)
SUDHARSHANA (23BDS059)



 AI Image Authenticity Detector

A full-stack web application that uses deep learning to detect whether an image is real or AI-generated. Built with a fine-tuned ResNet50 model, this application provides real-time image analysis with confidence scores and probability distributions.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.0-black.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-orange.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Model Information](#-model-information)
- [Development](#-development)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

Features

-  Real-time Image Analysis**: Upload images and get instant predictions
- Confidence Scores**: View detailed probability distributions for real vs fake classifications
-  Modern UI**: Beautiful, responsive interface with drag-and-drop file upload
-  Fast Performance**: Optimized model inference with GPU support
- Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- Real-time Feedback**: Visual progress indicators and smooth animations
- Glassmorphism Design**: Modern UI with backdrop blur effects and gradient animations

Tech Stack

Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **PyTorch**: Deep learning framework for model inference
- **ResNet50**: Pre-trained CNN architecture fine-tuned for fake image detection
- **Uvicorn**: ASGI server for running FastAPI
- **OpenCV & PIL**: Image processing and preprocessing

Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Axios**: HTTP client for API requests
- **CSS Modules**: Scoped styling with modern animations

Machine Learning
- **Model Architecture**: ResNet50 with custom classifier head
- **Transfer Learning**: Fine-tuned on ImageNet weights
- **Training**: Binary classification (Real vs Fake)

 Project Structure

```
Fake-Image-Detector-Model/
├── backend/                      # FastAPI backend server
│   ├── app.py                   # Main API server
│   ├── requirements.txt         # Python dependencies
│   ├── test_model.py            # Model testing script
│   └── venv/                    # Virtual environment (not in git)
│
├── frontend/                     # Next.js frontend application
│   ├── app/                     # Next.js app directory
│   │   ├── api/                 # API routes
│   │   │   ├── analyze/         # Image analysis endpoint
│   │   │   └── health/          # Health check endpoint
│   │   ├── page.tsx             # Main application page
│   │   ├── layout.tsx           # Root layout
│   │   ├── globals.css          # Global styles
│   │   └── page.module.css      # Component styles
│   ├── public/                  # Static assets
│   │   └── model.onnx          # ONNX model (optional)
│   ├── scripts/                 # Utility scripts
│   │   └── analyze_image.py    # Python analysis script
│   ├── package.json             # Node.js dependencies
│   └── tsconfig.json            # TypeScript configuration
│
├── dataset/                      # Training and test datasets
│   ├── train/                   # Training images
│   │   ├── real/               # Real images
│   │   └── fake/               # Fake/AI-generated images
│   └── test/                    # Test images
│       ├── real/
│       └── fake/
│
├── Output_images/               # Training outputs and visualizations
├── main.ipynb                    # Jupyter notebook for model training
├── best_resnet50.pth            # Trained model weights
├── requirements.txt             # Root-level Python dependencies
├── start_backend.sh             # Backend startup script
├── start_frontend.sh            # Frontend startup script
└── README.md                    # This file
```

Prerequisites

Before you begin, ensure you have the following installed:

- Python 3.8+** ([Download](https://www.python.org/downloads/))
- Node.js 16+** and npm ([Download](https://nodejs.org/))
- Git** ([Download](https://git-scm.com/downloads))

 System Requirements

- RAM: Minimum 4GB (8GB recommended)
- Storage: At least 2GB free space
- GPU: Optional but recommended for faster inference (NVIDIA GPU with CUDA support)

🚀 Installation

 Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/Fake-Image-Detector-Model.git
cd Fake-Image-Detector-Model
```

 Step 2: Place Model File

IMPORTANT: Place your trained model file (`best_resnet50.pth`) in the project root directory:

```bash
Fake-Image-Detector-Model/
└── best_resnet50.pth  ← Place your model file here
```

If your model file has a different name, update the `MODEL_PATH` in `backend/app.py`:

```python
model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "your-model-name.pth")
```

### Step 3: Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python3 -m venv venv
   ```

3. **Activate virtual environment:**
   ```bash
   # On macOS/Linux:
   source venv/bin/activate
   
   # On Windows:
   venv\Scripts\activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Verify model file location:**
   ```bash
   # From backend directory
   ls ../best_resnet50.pth
   ```

Step 4: Frontend Setup

1. Navigate to frontend directory:**
   ```bash
   cd ../frontend
   ```

2. Install dependencies:**
   ```bash
   npm install
   ```

3. Create environment file (optional):**
   ```bash
   # Create .env.local file
   echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
   ```

🎮 Usage

Starting the Application

 Option 1: Using Startup Scripts (Recommended)

Terminal 1 - Backend:**
```bash
chmod +x start_backend.sh
./start_backend.sh
```

Terminal 2 - Frontend:**
```bash
chmod +x start_frontend.sh
./start_frontend.sh
```

Option 2: Manual Start

Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```

Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Accessing the Application

- Frontend**: Open [http://localhost:3000](http://localhost:3000) in your browser
- Backend API**: Available at [http://localhost:8000](http://localhost:8000)
- API Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

Using the Web Interface

1. Upload Image**: 
   - Drag and drop an image onto the upload zone, or
   - Click the upload zone to browse and select an image

2. Analyze**: Click the "Analyze Image" button

3. View Results**: 
   - See the prediction (Real or AI-Generated)
   - View confidence score and probability distributions
   - Check detailed statistics

4. Reset: Click "Reset" to upload a new image

Supported Image Formats

- JPEG/JPG
- PNG
- WEBP
- Maximum file size: 10MB (configurable)

 API Documentation

Base URL

```
http://localhost:8000
```

 Endpoints

1. Health Check

GET** `/health`

Check if the API is running and the model is loaded.

Response:**
```json
{
  "status": "healthy",
  "device": "cpu"
}
```

 2. Analyze Image

POST** `/analyze`

Analyze an uploaded image to determine if it's real or fake.

Request:
- Method**: `POST`
- Content-Type**: `multipart/form-data`
- Body**: Form data with `file` field containing the image

Example using curl:**
```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/image.jpg"
```

Response:**
```json
{
  "prediction": "real",
  "confidence": 0.95,
  "probability_real": 0.95,
  "probability_fake": 0.05
}
```

Response Fields:**
- `prediction`: Either `"real"` or `"fake"`
- `confidence`: Confidence score (0.0 to 1.0) for the prediction
- `probability_real`: Probability that the image is real (0.0 to 1.0)
- `probability_fake`: Probability that the image is fake/AI-generated (0.0 to 1.0)

Error Responses:**

```json
{
  "detail": "File must be an image"
}
```

```json
{
  "detail": "Image processing error: [error message]"
}
```

 3. Root Endpoint

**GET** `/`

Returns a simple message indicating the API is running.

Response:**
```json
{
  "message": "Fake Image Detector API is running"
}
```

 Model Information

Architecture

- **Base Model**: ResNet50 (ImageNet pre-trained)
- **Fine-tuning Strategy**: 
  - Frozen early layers (conv1, bn1, layer1, layer2)
  - Trainable layers (layer3, layer4)
  - Custom classifier head with dropout regularization

 Classifier Head

```
Input (2048 features)
  ↓
Dropout (0.5)
  ↓
Linear (2048 → 512)
  ↓
BatchNorm1d
  ↓
ReLU
  ↓
Dropout (0.3)
  ↓
Linear (512 → 256)
  ↓
BatchNorm1d
  ↓
ReLU
  ↓
Dropout (0.2)
  ↓
Linear (256 → 1) [Output logits]
```

 Preprocessing

Images are preprocessed to match ImageNet standards:
- Resize to 224×224 pixels
- Normalize with ImageNet mean and std:
  - Mean: [0.485, 0.456, 0.406]
  - Std: [0.229, 0.224, 0.225]

Training

The model was trained on a dataset of real and AI-generated images with:
- Binary cross-entropy loss
- Adam optimizer
- Learning rate scheduling
- Data augmentation (during training)

 Development

Running in Development Mode

Both backend and frontend support hot-reloading:

- **Backend**: Automatically reloads on code changes
- **Frontend**: Next.js Fast Refresh enabled

 Testing the Backend

```bash
cd backend
source venv/bin/activate
python test_model.py
```

 Building for Production

Frontend:**
```bash
cd frontend
npm run build
npm start
```

Backend:**
The backend can be run with production ASGI servers:

```bash
# Using Gunicorn with Uvicorn workers
pip install gunicorn
gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

Code Structure

- **Backend API**: RESTful API following FastAPI best practices
- **Frontend**: Component-based React architecture with TypeScript
- **Styling**: CSS Modules for scoped styling
- **State Management**: React hooks (useState, useRef)

Deployment

Backend Deployment

 Option 1: Cloud Platforms

**Heroku:**
```bash
# Add Procfile
echo "web: uvicorn app:app --host 0.0.0.0 --port \$PORT" > Procfile

# Deploy
git push heroku main
```

Railway/Render:**
- Connect your GitHub repository
- Set build command: `pip install -r requirements.txt`
- Set start command: `python app.py`
- Upload model file to the server

 Option 2: VPS/Dedicated Server

```bash
# Install dependencies
pip install -r requirements.txt gunicorn

# Run with Gunicorn
gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --timeout 120
```

Important**: 
- Update CORS settings to allow your frontend domain
- Use environment variables for configuration
- Set up proper logging and monitoring

Frontend Deployment

Vercel (Recommended for Next.js)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
4. Deploy

 Netlify

1. Build command: `npm run build`
2. Publish directory: `.next`
3. Set environment variables
4. Deploy

 Self-Hosted

```bash
npm run build
npm start
```

 Environment Variables

**Backend** (Optional):
```env
MODEL_PATH=/path/to/model.pth
PORT=8000
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

**Frontend**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

 Troubleshooting

Common Issues

1. Model File Not Found

**Error:**
```
FileNotFoundError: [Errno 2] No such file or directory: '../best_resnet50.pth'
```

**Solution:**
- Verify the model file is in the project root directory
- Check the file name matches exactly (case-sensitive)
- Update `MODEL_PATH` in `backend/app.py` if using a different name

 2. Port Already in Use

**Error:**
```
Address already in use
```

**Solution:**
```bash
# Find and kill process on port 8000 (macOS/Linux)
lsof -ti:8000 | xargs kill

# Or change port in app.py
uvicorn.run(app, host="0.0.0.0", port=8001)
```

 3. Module Not Found

**Error:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Solution:**
```bash
# Ensure virtual environment is activated
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

 4. Cannot Connect to Backend

**Error:**
```
Network request failed
Cannot connect to server
```

**Solution:**
- Verify backend is running: `http://localhost:8000/health`
- Check CORS settings in `backend/app.py`
- Verify `.env.local` has correct API URL
- Check firewall settings

 5. CUDA/GPU Issues

**Error:**
```
CUDA out of memory
```

**Solution:**
- The model automatically falls back to CPU if CUDA is unavailable
- For GPU issues, ensure CUDA drivers are installed
- Reduce batch size if using GPU

 6. Frontend Build Errors

**Error:**
```
Module not found
Build failed
```

**Solution:**
```bash
# Clean and reinstall
rm -rf node_modules .next package-lock.json
npm install
npm run build
```

 Getting Help

1. Check the [Issues](https://github.com/yourusername/Fake-Image-Detector-Model/issues) page
2. Review the logs in both backend and frontend terminals
3. Verify all prerequisites are installed correctly
4. Ensure model file is in the correct location

 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Commit your changes:**
   ```bash
   git commit -m "Add: Your feature description"
   ```
5. **Push to the branch:**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request**

 Contribution Guidelines

- Follow the existing code style
- Add comments for complex logic
- Update documentation as needed
- Test your changes thoroughly
- Ensure all tests pass

Acknowledgments

- **ResNet Architecture**: Based on the ResNet paper by He et al.
- **PyTorch**: Deep learning framework
- **FastAPI**: Modern web framework
- **Next.js**: React framework
- **ImageNet**: Pre-trained weights
- THANKING Our Prof. Dr.Animesh Chaturvedi for the guidance and Feedback.

For questions, issues, or suggestions:

- **GitHub Issues**: [Open an issue](https://github.com/yourusername/Fake-Image-Detector-Model/issues)
- **Email**: kuladeepgompa@gmail.com
## 📊 Project Status

- ✅ Model Training
- ✅ Backend API
- ✅ Frontend UI
- ✅ Documentation
- 🔄 Continuous Improvements

---

