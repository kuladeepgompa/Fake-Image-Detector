'use client'

import { useState } from 'react'
import axios from 'axios'
import styles from './page.module.css'

interface AnalysisResult {
  prediction: 'real' | 'fake'
  confidence: number
  probability_real: number
  probability_fake: number
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      
      setSelectedFile(file)
      setError(null)
      setResult(null)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select an image first')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await axios.post<AnalysisResult>(
        '/api/analyze',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      setResult(response.data)
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data.error || err.response.data.detail || 'Analysis failed')
      } else if (err.request) {
        setError('Could not connect to the server. Please try again.')
      } else {
        setError('An unexpected error occurred')
      }
      console.error('Analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreview(null)
    setResult(null)
    setError(null)
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Fake Image Detector</h1>
        <p className={styles.subtitle}>
          Upload an image to analyze if it&apos;s real or fake
        </p>

        <div className={styles.uploadSection}>
          <div className={styles.fileInputWrapper}>
            <input
              type="file"
              id="fileInput"
              accept="image/*"
              onChange={handleFileSelect}
              className={styles.fileInput}
            />
            <label htmlFor="fileInput" className={styles.fileInputLabel}>
              {selectedFile ? selectedFile.name : 'Choose Image'}
            </label>
          </div>

          {preview && (
            <div className={styles.previewSection}>
              <img src={preview} alt="Preview" className={styles.previewImage} />
            </div>
          )}

          <div className={styles.buttonGroup}>
            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || loading}
              className={styles.analyzeButton}
            >
              {loading ? 'Analyzing...' : 'Analyze Image'}
            </button>
            {selectedFile && (
              <button
                onClick={handleReset}
                disabled={loading}
                className={styles.resetButton}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className={styles.resultSection}>
            <h2 className={styles.resultTitle}>Analysis Result</h2>
            <div
              className={`${styles.resultCard} ${
                result.prediction === 'real' ? styles.real : styles.fake
              }`}
            >
              <div className={styles.prediction}>
                <span className={styles.predictionLabel}>Prediction:</span>
                <span
                  className={`${styles.predictionValue} ${
                    result.prediction === 'real' ? styles.realText : styles.fakeText
                  }`}
                >
                  {result.prediction.toUpperCase()}
                </span>
              </div>
              <div className={styles.confidence}>
                <span className={styles.confidenceLabel}>Confidence:</span>
                <span className={styles.confidenceValue}>
                  {(result.confidence * 100).toFixed(2)}%
                </span>
              </div>
              <div className={styles.probabilities}>
                <div className={styles.probabilityItem}>
                  <span>Real:</span>
                  <span className={styles.realText}>
                    {(result.probability_real * 100).toFixed(2)}%
                  </span>
                </div>
                <div className={styles.probabilityItem}>
                  <span>Fake:</span>
                  <span className={styles.fakeText}>
                    {(result.probability_fake * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

