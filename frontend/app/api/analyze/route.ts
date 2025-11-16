import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

export const runtime = 'nodejs'
export const maxDuration = 30 // 30 seconds max for model inference

// CORS headers helper
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

async function analyzeImageWithPython(imageBuffer: Buffer): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      // Convert image buffer to base64
      const imageBase64 = imageBuffer.toString('base64')
      
      // Prepare input data
      const inputData = JSON.stringify({ image: imageBase64 })
      
      // Find the Python interpreter (try venv first, then system)
      const possiblePythonPaths = [
        path.join(process.cwd(), 'backend', 'venv', 'bin', 'python3'),
        path.join(process.cwd(), '..', 'backend', 'venv', 'bin', 'python3'),
        path.join(process.cwd(), '.venv311', 'bin', 'python3'),
        path.join(process.cwd(), '..', '.venv311', 'bin', 'python3'),
        'python3', // Fallback to system Python
      ]
      
      let pythonPath = 'python3'
      for (const pythonPathOption of possiblePythonPaths) {
        if (pythonPathOption === 'python3') {
          pythonPath = pythonPathOption
          break
        }
        // Use synchronous check since we're inside a Promise callback
        if (fs.existsSync(pythonPathOption)) {
          pythonPath = pythonPathOption
          console.log(`Using Python interpreter: ${pythonPath}`)
          break
        }
      }
      
      // Find the Python script path
      const scriptPath = path.join(process.cwd(), 'scripts', 'analyze_image.py')
      
      // Check if script exists, try alternative paths
      let pythonScriptPath = scriptPath
      if (!fs.existsSync(pythonScriptPath)) {
        // Try alternative paths
        const altPaths = [
          path.join(process.cwd(), '..', 'frontend', 'scripts', 'analyze_image.py'),
          path.join(process.cwd(), 'frontend', 'scripts', 'analyze_image.py'),
        ]
        for (const altPath of altPaths) {
          if (fs.existsSync(altPath)) {
            pythonScriptPath = altPath
            break
          }
        }
        if (!fs.existsSync(pythonScriptPath)) {
          throw new Error(`Python script not found. Tried: ${scriptPath} and alternatives`)
        }
      }
      
      console.log(`Running Python script: ${pythonScriptPath} with ${pythonPath}`)
      
      // Spawn Python process
      const pythonProcess = spawn(pythonPath, [pythonScriptPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
      })
      
      let stdout = ''
      let stderr = ''
      
      // Collect stdout
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString()
      })
      
      // Collect stderr
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString()
      })
      
      // Handle process completion
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error('Python script error:', stderr)
          reject(new Error(`Python script exited with code ${code}: ${stderr || 'Unknown error'}`))
          return
        }
        
        try {
          const result = JSON.parse(stdout)
          if (result.error) {
            reject(new Error(result.error))
          } else {
            resolve(result)
          }
        } catch (parseError: any) {
          console.error('Failed to parse Python output:', stdout)
          reject(new Error(`Failed to parse Python script output: ${parseError.message}`))
        }
      })
      
      // Handle process errors
      pythonProcess.on('error', (error) => {
        console.error('Failed to spawn Python process:', error)
        reject(new Error(`Failed to start Python process: ${error.message}. Make sure Python 3 is installed.`))
      })
      
      // Send input data to Python script
      pythonProcess.stdin.write(inputData)
      pythonProcess.stdin.end()
      
    } catch (error: any) {
      reject(new Error(`Error setting up Python process: ${error.message}`))
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    // Log that the route was hit
    console.log('POST /api/analyze called')
    
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.log('No file provided')
      return NextResponse.json(
        { error: 'No file provided' },
        { 
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`)

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { 
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    if (buffer.length === 0) {
      return NextResponse.json(
        { error: 'Empty file' },
        { 
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    // Analyze image using Python script
    console.log('Analyzing image with Python script...')
    const result = await analyzeImageWithPython(buffer)
    console.log('Analysis result:', result)

    return NextResponse.json(result, {
      headers: corsHeaders,
    })
  } catch (error: any) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { 
        status: 500,
        headers: corsHeaders,
      }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Fake Image Detector API - Use POST /api/analyze to analyze images',
    method: 'Python script (PyTorch)',
    status: 'ok',
  }, {
    headers: corsHeaders,
  })
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  })
}
