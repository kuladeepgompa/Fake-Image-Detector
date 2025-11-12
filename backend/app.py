from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
import torch.nn as nn
from torchvision import models
import torchvision.transforms as transforms
from PIL import Image
import numpy as np
import io
import cv2

app = FastAPI(title="Fake Image Detector API")

# CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model configuration (matching training setup)
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]
IMG_SIZE = 224

# Image preprocessing transform (matching validation/test transform)
transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
])

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Load model architecture (matching training setup)
def load_model():
    model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
    
    # Freeze early layers
    for param in model.parameters():
        param.requires_grad = False
    
    # Unfreeze layer3 and layer4
    for param in model.layer3.parameters():
        param.requires_grad = True
    for param in model.layer4.parameters():
        param.requires_grad = True
    
    # Replace classifier head (matching training architecture)
    num_ftrs = model.fc.in_features
    model.fc = nn.Sequential(
        nn.Dropout(0.5),
        nn.Linear(num_ftrs, 512),
        nn.BatchNorm1d(512),
        nn.ReLU(),
        nn.Dropout(0.3),
        nn.Linear(512, 256),
        nn.BatchNorm1d(256),
        nn.ReLU(),
        nn.Dropout(0.2),
        nn.Linear(256, 1)  # Output logits
    )
    
    # Load trained weights
    import os
    model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "best_resnet50.pth")
    try:
        model.load_state_dict(torch.load(model_path, map_location=device))
        model.eval()
        model = model.to(device)
        print(f"Model loaded successfully from {model_path}")
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        raise

# Load model on startup
model = load_model()

def preprocess_image(image_bytes: bytes) -> torch.Tensor:
    """Preprocess image bytes to match training preprocessing"""
    try:
        # Read image from bytes
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Could not decode image")
        
        # Convert BGR to RGB
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Convert to PIL Image
        pil_image = Image.fromarray(img)
        
        # Apply transforms
        tensor = transform(pil_image)
        
        # Add batch dimension
        tensor = tensor.unsqueeze(0)
        
        return tensor
    except Exception as e:
        raise ValueError(f"Image preprocessing error: {str(e)}")

@app.get("/")
def read_root():
    return {"message": "Fake Image Detector API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "device": str(device)}

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    """
    Analyze uploaded image to determine if it's real or fake
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image bytes
        image_bytes = await file.read()
        
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty file")
        
        # Preprocess image
        try:
            input_tensor = preprocess_image(image_bytes)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Image processing error: {str(e)}")
        
        # Move to device
        input_tensor = input_tensor.to(device)
        
        # Make prediction
        with torch.no_grad():
            logits = model(input_tensor)
            probability = torch.sigmoid(logits).cpu().item()
            prediction = 1 if probability >= 0.5 else 0
        
        # Format response
        result = {
            "prediction": "real" if prediction == 1 else "fake",
            "confidence": float(probability) if prediction == 1 else float(1 - probability),
            "probability_real": float(probability),
            "probability_fake": float(1 - probability)
        }
        
        return JSONResponse(content=result)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

