import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

export const runtime = 'nodejs'
export const maxDuration = 30 // 30 seconds max for model inference

async function analyzeImageWithPython(imageBuffer: Buffer): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      // Get the path to the Python script
      const scriptPath = path.join(process.cwd(), 'scripts', 'analyze_image.py')
      
      // Check if script exists
      if (!fs.existsSync(scriptPath)) {
        reject(new Error('Python analysis script not found'))
        return
      }

      // Encode image as base64
      const imageBase64 = imageBuffer.toString('base64')
      const inputData = JSON.stringify({ image: imageBase64 })

      // Spawn Python process
      const pythonProcess = spawn('python3', [scriptPath], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1',
        },
      })

      let stdout = ''
      let stderr = ''

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}: ${stderr}`))
          return
        }

        try {
          const result = JSON.parse(stdout)
          if (result.error) {
            reject(new Error(result.error))
          } else {
            resolve(result)
          }
        } catch (parseError) {
          reject(new Error(`Failed to parse Python output: ${stdout}`))
        }
      })

      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to spawn Python process: ${error.message}`))
      })

      // Send input data to Python process
      pythonProcess.stdin.write(inputData)
      pythonProcess.stdin.end()
    } catch (error: any) {
      reject(error)
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    if (buffer.length === 0) {
      return NextResponse.json(
        { error: 'Empty file' },
        { status: 400 }
      )
    }

    // Analyze image using Python script
    const result = await analyzeImageWithPython(buffer)

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
  return NextResponse.json({ message: 'Fake Image Detector API - Use POST /api/analyze to analyze images' })
}

