'use client'

import { useState, useRef } from 'react'
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
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const handleFileSelect = (file: File) => {
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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
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
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 2L7.17 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4H16.83L15 2H9ZM12 7C15.31 7 18 9.69 18 13C18 16.31 15.31 19 12 19C8.69 19 6 16.31 6 13C6 9.69 8.69 7 12 7ZM12 9C9.79 9 8 10.79 8 13C8 15.21 9.79 17 12 17C14.21 17 16 15.21 16 13C16 10.79 14.21 9 12 9Z" fill="currentColor"/>
            </svg>
          </div>
          <h1 className={styles.title}>AI Image Authenticity Detector</h1>
          <p className={styles.subtitle}>
            Upload an image to detect if it&apos;s real or AI-generated using advanced deep learning
          </p>
        </div>

        <div className={styles.uploadSection}>
          <div
            ref={dropZoneRef}
            className={`${styles.dropZone} ${isDragging ? styles.dragging : ''} ${preview ? styles.hasPreview : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !preview && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              id="fileInput"
              accept="image/*"
              onChange={handleFileInputChange}
              className={styles.fileInput}
            />
            
            {!preview ? (
              <div className={styles.dropZoneContent}>
                <div className={styles.uploadIcon}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15V3M12 3L8 7M12 3L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L2 19C2 20.1046 2.89543 21 4 21L20 21C21.1046 21 22 20.1046 22 19L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className={styles.dropZoneTitle}>
                  {isDragging ? 'Drop your image here' : 'Drag & drop your image'}
                </h3>
                <p className={styles.dropZoneSubtitle}>
                  or click to browse
                </p>
                <p className={styles.dropZoneHint}>
                  Supports JPG, PNG, WEBP (Max 10MB)
                </p>
              </div>
            ) : (
              <div className={styles.previewWrapper}>
                <img src={preview} alt="Preview" className={styles.previewImage} />
                <button
                  className={styles.removeImageBtn}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleReset()
                  }}
                  aria-label="Remove image"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
                {selectedFile && (
                  <div className={styles.fileInfo}>
                    <p className={styles.fileName}>{selectedFile.name}</p>
                    <p className={styles.fileSize}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.buttonGroup}>
            <button
              onClick={handleAnalyze}
              disabled={!selectedFile || loading}
              className={styles.analyzeButton}
            >
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Analyze Image</span>
                </>
              )}
            </button>
            {selectedFile && !loading && (
              <button
                onClick={handleReset}
                className={styles.resetButton}
              >
                <svg className={styles.buttonIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 12C3 4.5885 4.5885 3 12 3C19.4115 3 21 4.5885 21 12C21 19.4115 19.4115 21 12 21C4.5885 21 3 19.4115 3 12Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <svg className={styles.errorIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className={styles.resultSection}>
            <div
              className={`${styles.resultCard} ${
                result.prediction === 'real' ? styles.real : styles.fake
              }`}
            >
              <div className={styles.resultHeader}>
                <div className={styles.resultIcon}>
                  {result.prediction === 'real' ? (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
                <div className={styles.resultTitle}>
                  <h2>Analysis Complete</h2>
                  <p className={styles.resultSubtitle}>Image authenticity verified</p>
                </div>
              </div>

              <div className={styles.predictionBadge}>
                <span className={styles.predictionLabel}>Prediction</span>
                <span
                  className={`${styles.predictionValue} ${
                    result.prediction === 'real' ? styles.realText : styles.fakeText
                  }`}
                >
                  {result.prediction === 'real' ? '✓ Real Image' : '✗ AI Generated'}
                </span>
              </div>

              <div className={styles.confidenceSection}>
                <div className={styles.confidenceHeader}>
                  <span className={styles.confidenceLabel}>Confidence Level</span>
                  <span className={styles.confidenceValue}>
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${result.confidence * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className={styles.probabilities}>
                <div className={styles.probabilityCard}>
                  <div className={styles.probabilityHeader}>
                    <span className={styles.probabilityLabel}>Real Probability</span>
                    <span className={`${styles.probabilityValue} ${styles.realText}`}>
                      {(result.probability_real * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className={styles.probabilityBar}>
                    <div
                      className={`${styles.probabilityFill} ${styles.realFill}`}
                      style={{ width: `${result.probability_real * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className={styles.probabilityCard}>
                  <div className={styles.probabilityHeader}>
                    <span className={styles.probabilityLabel}>Fake Probability</span>
                    <span className={`${styles.probabilityValue} ${styles.fakeText}`}>
                      {(result.probability_fake * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className={styles.probabilityBar}>
                    <div
                      className={`${styles.probabilityFill} ${styles.fakeFill}`}
                      style={{ width: `${result.probability_fake * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

