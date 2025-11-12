import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export const runtime = 'nodejs'

export async function GET() {
  // Check if ONNX model exists
  const possiblePaths = [
    path.join(process.cwd(), 'public', 'model.onnx'),
    path.join(process.cwd(), '..', 'public', 'model.onnx'),
    path.join(process.cwd(), 'model.onnx'),
  ]

  let modelExists = false
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      modelExists = true
      break
    }
  }

  return NextResponse.json({
    status: modelExists ? 'healthy' : 'degraded',
    model: modelExists,
    runtime: 'onnx',
    device: 'cpu',
  })
}
