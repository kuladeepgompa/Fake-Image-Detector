import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

// Dynamic import for ONNX Runtime to avoid webpack bundling issues
let onnxRuntime: any = null
async function getOnnxRuntime() {
  if (!onnxRuntime) {
    onnxRuntime = await import('onnxruntime-node')
  }
  return onnxRuntime
}

export const runtime = 'nodejs'
export const maxDuration = 30 // 30 seconds max for model inference

// Model configuration (matching training setup)
const IMAGENET_MEAN = [0.485, 0.456, 0.406]
const IMAGENET_STD = [0.229, 0.224, 0.225]
const IMG_SIZE = 224

// Global model session (loaded once, reused for all requests)
let modelSession: any = null

async function loadModel(): Promise<any> {
  if (modelSession) {
    return modelSession
  }

  try {
    // Dynamically import ONNX Runtime
    const ort = await getOnnxRuntime()
    const { InferenceSession } = ort

    // Try multiple possible paths for the ONNX model
    // Use dynamic path resolution to avoid bundling the model file
    const possiblePaths = [
      path.join(process.cwd(), 'public', 'model.onnx'),
      path.join(process.cwd(), '..', 'public', 'model.onnx'),
      path.join(process.cwd(), 'model.onnx'),
    ]

    let modelPath: string | null = null
    // Use try-catch instead of existsSync to avoid file tracing
    for (const p of possiblePaths) {
      try {
        // Just try to access it - if it fails, try next path
        await fs.promises.access(p, fs.constants.F_OK)
        modelPath = p
        break
      } catch {
        // File doesn't exist, try next path
        continue
      }
    }

    if (!modelPath) {
      throw new Error(
        'ONNX model not found. Please run convert_to_onnx.py to generate model.onnx and place it in the public/ directory.'
      )
    }

    console.log(`Loading ONNX model from: ${modelPath}`)
    modelSession = await InferenceSession.create(modelPath, {
      executionProviders: ['cpu'], // Use CPU (works on Vercel)
    })

    console.log('ONNX model loaded successfully!')
    return modelSession
  } catch (error: any) {
    throw new Error(`Failed to load ONNX model: ${error.message}`)
  }
}

async function preprocessImage(imageBuffer: Buffer): Promise<Float32Array> {
  try {
    // Resize and normalize image using sharp
    const image = sharp(imageBuffer)
    const metadata = await image.metadata()

    // Resize to 224x224
    const resized = await image
      .resize(IMG_SIZE, IMG_SIZE, {
        fit: 'cover',
      })
      .raw()
      .toBuffer()

    // Convert to normalized float32 array [C, H, W] format
    const pixels = new Uint8Array(resized)
    const normalized = new Float32Array(3 * IMG_SIZE * IMG_SIZE)

    // Normalize and rearrange from HWC to CHW format
    for (let i = 0; i < IMG_SIZE * IMG_SIZE; i++) {
      const r = pixels[i * 3] / 255.0
      const g = pixels[i * 3 + 1] / 255.0
      const b = pixels[i * 3 + 2] / 255.0

      // Apply ImageNet normalization
      normalized[i] = (r - IMAGENET_MEAN[0]) / IMAGENET_STD[0] // R channel
      normalized[IMG_SIZE * IMG_SIZE + i] = (g - IMAGENET_MEAN[1]) / IMAGENET_STD[1] // G channel
      normalized[2 * IMG_SIZE * IMG_SIZE + i] = (b - IMAGENET_MEAN[2]) / IMAGENET_STD[2] // B channel
    }

    return normalized
  } catch (error: any) {
    throw new Error(`Image preprocessing error: ${error.message}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    if (buffer.length === 0) {
      return NextResponse.json({ error: 'Empty file' }, { status: 400 })
    }

    // Preprocess image
    const preprocessed = await preprocessImage(buffer)

    // Load model (cached after first load)
    const session = await loadModel()

    // Dynamically import ONNX Runtime for Tensor
    const ort = await getOnnxRuntime()
    const { Tensor } = ort

    // Create input tensor [1, 3, 224, 224]
    const inputTensor = new Tensor('float32', preprocessed, [1, 3, IMG_SIZE, IMG_SIZE])

    // Run inference
    const feeds = { input: inputTensor }
    const results = await session.run(feeds)
    const output = results.output

    // Get prediction (output is a Tensor)
    const outputData = output.data as Float32Array
    const logit = outputData[0]

    // Apply sigmoid to get probability
    const probability = 1 / (1 + Math.exp(-logit))
    const prediction = probability >= 0.5 ? 1 : 0

    // Format response
    const result = {
      prediction: prediction === 1 ? 'real' : 'fake',
      confidence: prediction === 1 ? probability : 1 - probability,
      probability_real: probability,
      probability_fake: 1 - probability,
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Fake Image Detector API - Use POST /api/analyze to analyze images',
    model: modelSession ? 'loaded' : 'not loaded',
  })
}
