"""Quick test script to verify model loading works"""
import torch
import torch.nn as nn
from torchvision import models
import os

def test_model_loading():
    print("Testing model loading...")
    
    # Device configuration
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    # Model path
    model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "best_resnet50.pth")
    print(f"Model path: {model_path}")
    
    if not os.path.exists(model_path):
        print(f"ERROR: Model file not found at {model_path}")
        return False
    
    print(f"Model file found ({os.path.getsize(model_path) / (1024*1024):.2f} MB)")
    
    # Load model architecture
    print("Loading model architecture...")
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
    
    # Load weights
    print("Loading model weights...")
    try:
        model.load_state_dict(torch.load(model_path, map_location=device))
        model.eval()
        model = model.to(device)
        print("✓ Model loaded successfully!")
        
        # Test with dummy input
        print("Testing with dummy input...")
        dummy_input = torch.randn(1, 3, 224, 224).to(device)
        with torch.no_grad():
            output = model(dummy_input)
            prob = torch.sigmoid(output).item()
            print(f"✓ Model inference works! Output probability: {prob:.4f}")
        
        return True
    except Exception as e:
        print(f"ERROR loading model: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_model_loading()
    if success:
        print("\n✓ All tests passed! The model is ready to use.")
    else:
        print("\n✗ Tests failed. Please check the errors above.")

