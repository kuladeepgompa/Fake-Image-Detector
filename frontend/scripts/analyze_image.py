#!/usr/bin/env python3
"""
Standalone script to analyze images for fake/real detection.
Can be called from Node.js/Next.js API routes.
"""
import sys
import json
import os
import torch
import torch.nn as nn
from torchvision import models
import torchvision.transforms as transforms
from PIL import Image
import numpy as np
import cv2
import base64
from io import BytesIO

# Model configuration (matching training setup)
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]
IMG_SIZE = 224

# Image preprocessing transform
transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
])

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_model():
    """Load the trained model"""
    model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
    
    # Freeze early layers
    for param in model.parameters():
        param.requires_grad = False
    
    # Unfreeze layer3 and layer4
    for param in model.layer3.parameters():
        param.requires_grad = True
    for param in model.layer4.parameters():
        param.requires_grad = True
    
    # Replace classifier head
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
        nn.Linear(256, 1)
    )
    
    # Load trained weights
    # Get the project root (two levels up from this script)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(script_dir))
    model_path = os.path.join(project_root, "best_resnet50.pth")
    
    # Alternative: if model is in parent directory of frontend
    if not os.path.exists(model_path):
        # Try one more level up (if frontend is in a subdirectory)
        alt_path = os.path.join(os.path.dirname(project_root), "best_resnet50.pth")
        if os.path.exists(alt_path):
            model_path = alt_path
    
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()
    model = model.to(device)
    return model

# Global model instance (loaded once)
_model = None

def get_model():
    """Get or load the model (singleton pattern)"""
    global _model
    if _model is None:
        _model = load_model()
    return _model

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

def analyze_image(image_bytes: bytes):
    """Analyze image and return prediction"""
    try:
        # Preprocess image
        input_tensor = preprocess_image(image_bytes)
        input_tensor = input_tensor.to(device)
        
        # Get model and make prediction
        model = get_model()
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
        
        return result
    except Exception as e:
        raise Exception(f"Analysis error: {str(e)}")

if __name__ == "__main__":
    try:
        # Read image data from stdin (base64 encoded)
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        
        # Decode base64 image
        image_base64 = data.get("image")
        if not image_base64:
            raise ValueError("No image data provided")
        
        # Remove data URL prefix if present
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]
        
        image_bytes = base64.b64decode(image_base64)
        
        # Analyze image
        result = analyze_image(image_bytes)
        
        # Output result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            "error": str(e)
        }
        print(json.dumps(error_result))
        sys.exit(1)

