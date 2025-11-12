"""
Convert PyTorch model to ONNX format for Node.js inference
Run this script once to convert the model, then you can use it in Vercel!
"""
import torch
import torch.nn as nn
from torchvision import models
import os

# Model configuration (matching training setup)
def create_model():
    """Create model with same architecture as training"""
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
    
    return model

def convert_to_onnx():
    """Convert PyTorch model to ONNX format"""
    print("Loading PyTorch model...")
    
    # Load model
    model = create_model()
    model_path = "best_resnet50.pth"
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")
    
    # Load weights
    device = torch.device("cpu")  # ONNX conversion works best on CPU
    model.load_state_dict(torch.load(model_path, map_location=device))
    model.eval()
    model = model.to(device)
    
    print("Model loaded successfully!")
    
    # Create dummy input (batch_size=1, channels=3, height=224, width=224)
    dummy_input = torch.randn(1, 3, 224, 224).to(device)
    
    # Export to ONNX
    # Create frontend/public directory if it doesn't exist
    frontend_dir = "frontend"
    public_dir = os.path.join(frontend_dir, "public")
    os.makedirs(public_dir, exist_ok=True)
    
    onnx_path = os.path.join(public_dir, "model.onnx")
    
    print(f"Converting to ONNX format...")
    torch.onnx.export(
        model,
        dummy_input,
        onnx_path,
        export_params=True,
        opset_version=11,  # Compatible with ONNX Runtime
        do_constant_folding=True,
        input_names=['input'],
        output_names=['output'],
        dynamic_axes={
            'input': {0: 'batch_size'},
            'output': {0: 'batch_size'}
        }
    )
    
    print(f"✓ Model converted successfully to {onnx_path}")
    print(f"  File size: {os.path.getsize(onnx_path) / (1024*1024):.2f} MB")
    print("\nYou can now use this ONNX model in your Next.js app!")

if __name__ == "__main__":
    try:
        convert_to_onnx()
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

