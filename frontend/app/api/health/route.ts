import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

export const runtime = 'nodejs'

async function checkPythonAndModel(): Promise<{ python: boolean; model: boolean; device?: string }> {
  return new Promise((resolve) => {
    // Check if Python is available
    const pythonCheck = spawn('python3', ['--version'])
    
    let pythonAvailable = false
    pythonCheck.on('close', (code) => {
      pythonAvailable = code === 0
      
      // Check if model file exists (project root, one level up from frontend)
      const modelPath = path.join(process.cwd(), '..', 'best_resnet50.pth')
      const modelExists = fs.existsSync(modelPath)
      
      // Check if Python script exists
      const scriptPath = path.join(process.cwd(), 'scripts', 'analyze_image.py')
      const scriptExists = fs.existsSync(scriptPath)
      
      resolve({
        python: pythonAvailable,
        model: modelExists && scriptExists,
        device: 'cpu' // Default, could be enhanced to check GPU
      })
    })
    
    pythonCheck.on('error', () => {
      const modelPath = path.join(process.cwd(), '..', 'best_resnet50.pth')
      const modelExists = fs.existsSync(modelPath)
      const scriptPath = path.join(process.cwd(), 'scripts', 'analyze_image.py')
      const scriptExists = fs.existsSync(scriptPath)
      
      resolve({
        python: false,
        model: modelExists && scriptExists,
      })
    })
  })
}

export async function GET() {
  const status = await checkPythonAndModel()
  
  return NextResponse.json({
    status: status.python && status.model ? 'healthy' : 'degraded',
    python: status.python,
    model: status.model,
    device: status.device || 'unknown'
  })
}

