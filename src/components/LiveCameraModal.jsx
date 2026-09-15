import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Camera, X, RefreshCw, SwitchCamera, AlertCircle, Upload } from 'lucide-react'

export default function LiveCameraModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const nativeCameraInputRef = useRef(null)
  const fileInputRef = useRef(null)

  const [hasPermission, setHasPermission] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [facingMode, setFacingMode] = useState('environment') // 'environment' (back) or 'user' (front)
  const [isCapturing, setIsCapturing] = useState(false)

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop())
      } catch {}
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [])

  const startCamera = useCallback(async (mode = facingMode) => {
    stopStream()
    setErrorMsg('')
    setHasPermission(null)

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasPermission(false)
      setErrorMsg('Direct browser camera is unavailable on this connection. You can use your device camera directly below.')
      return
    }

    // Set a 1.5s timeout watchdog so user is NEVER stuck on a loading spinner
    let resolved = false
    const watchdog = setTimeout(() => {
      if (!resolved && hasPermission === null) {
        setHasPermission(false)
        setErrorMsg('Camera access is taking longer than expected. Tap below to use your device camera directly.')
      }
    }, 1500)

    try {
      let stream = null

      // Tier 1: Try ideal facing mode & resolution
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })
      } catch {
        // Tier 2: Try simple facing mode
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: mode },
            audio: false,
          })
        } catch {
          // Tier 3: Universal fallback to any available video stream
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          })
        }
      }

      resolved = true
      clearTimeout(watchdog)

      if (!stream) {
        throw new Error('No video stream received from device.')
      }

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        try {
          await videoRef.current.play()
        } catch (playErr) {
          console.warn('Video play warning:', playErr)
        }
      }
      setHasPermission(true)
    } catch (err) {
      resolved = true
      clearTimeout(watchdog)
      console.warn('getUserMedia error:', err)
      setHasPermission(false)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg('Camera permission was blocked. You can allow camera in browser settings or use the native camera button below.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMsg('No camera hardware detected on this device.')
      } else {
        setErrorMsg('Could not open direct browser camera. Tap below to capture with your device camera.')
      }
    }
  }, [facingMode, stopStream, hasPermission])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        stopStream()
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      startCamera(facingMode)
    } else {
      stopStream()
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      stopStream()
    }
  }, [isOpen, facingMode, startCamera, stopStream, onClose])

  const handleCapture = () => {
    if (!videoRef.current || !streamRef.current) return

    setIsCapturing(true)
    try {
      const video = videoRef.current
      const width = video.videoWidth || 1280
      const height = video.videoHeight || 720

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          setIsCapturing(false)
          if (blob) {
            let capturedFile
            const fileName = `bill_camera_${Date.now()}.jpg`
            try {
              capturedFile = new File([blob], fileName, { type: 'image/jpeg' })
            } catch {
              blob.name = fileName
              blob.lastModified = Date.now()
              capturedFile = blob
            }

            stopStream()
            onCapture(capturedFile)
            onClose()
          }
        },
        'image/jpeg',
        0.92
      )
    } catch (err) {
      console.error('Frame capture error:', err)
      setIsCapturing(false)
    }
  }

  const handleFlipCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(nextMode)
  }

  const handleNativeCapture = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      stopStream()
      onCapture(file)
      onClose()
    }
    e.target.value = ''
  }

  if (!isOpen) return null

  if (typeof document === 'undefined') return null

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Camera receipt scanner"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/60 shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
              <Camera size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">Receipt Scanner</h3>
              <p className="text-xs text-slate-400">Position your bill inside the frame</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => nativeCameraInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 text-xs font-medium flex items-center gap-1.5 border border-sky-500/30 cursor-pointer transition-colors"
              title="Capture photo using device camera app"
            >
              <Camera size={13} />
              <span className="hidden sm:inline">Device Camera</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close camera"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Camera Viewport Area */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[400px] bg-black flex items-center justify-center overflow-hidden">
          {hasPermission === true && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Reticle */}
              <div className="absolute inset-6 sm:inset-10 border-2 border-dashed border-sky-400/60 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                <span className="text-[11px] font-medium text-sky-200 bg-black/50 px-2 py-0.5 rounded self-start backdrop-blur-sm">
                  Align receipt flat
                </span>
                <span className="text-[11px] font-medium text-slate-200 bg-black/60 px-2 py-0.5 rounded self-center backdrop-blur-sm">
                  Tap shutter to capture
                </span>
              </div>
            </>
          )}

          {/* Loading / Connecting View */}
          {hasPermission === null && (
            <div className="text-center space-y-4 p-6 max-w-xs">
              <RefreshCw size={24} className="animate-spin text-sky-400 mx-auto" />
              <div>
                <p className="text-xs font-semibold text-slate-200">Connecting to camera…</p>
                <p className="text-[11px] text-slate-400 mt-1">Accept permission prompt if prompted</p>
              </div>

              {/* Instant Native Device Camera Fallback */}
              <div className="pt-2 space-y-2">
                <label
                  htmlFor="live-modal-native-cam"
                  className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Camera size={15} /> Use Native Device Camera
                </label>
                <input
                  id="live-modal-native-cam"
                  ref={nativeCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={handleNativeCapture}
                />
              </div>
            </div>
          )}

          {/* Permission Denied or Not Supported Error */}
          {hasPermission === false && (
            <div className="p-6 text-center space-y-4 max-w-sm">
              <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
                <AlertCircle size={22} />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-white">Camera Access</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {errorMsg}
                </p>
              </div>

              {/* Action options */}
              <div className="pt-1 space-y-2.5">
                <label
                  htmlFor="live-modal-native-cam-fallback"
                  className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow"
                >
                  <Camera size={15} /> Take Photo with Device Camera
                </label>
                <input
                  id="live-modal-native-cam-fallback"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={handleNativeCapture}
                />

                <label
                  htmlFor="live-modal-file-fallback"
                  className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Upload size={14} /> Choose Photo from Gallery
                </label>
                <input
                  id="live-modal-file-fallback"
                  type="file"
                  accept="image/*,application/pdf"
                  className="sr-only"
                  onChange={handleNativeCapture}
                />
              </div>
            </div>
          )}
        </div>

        {/* Shutter & Controls Footer */}
        {hasPermission === true && (
          <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
            {/* Flip Camera Button */}
            <button
              type="button"
              onClick={handleFlipCamera}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Switch camera"
              aria-label="Switch camera"
            >
              <SwitchCamera size={18} />
            </button>

            {/* Shutter Action Button */}
            <button
              type="button"
              onClick={handleCapture}
              disabled={isCapturing}
              aria-label="Take photo"
              className="w-14 h-14 rounded-full p-1 border-2 border-white/40 hover:border-white transition-transform active:scale-95 cursor-pointer flex items-center justify-center"
            >
              <div className="w-full h-full rounded-full bg-sky-500 hover:bg-sky-400 flex items-center justify-center transition-colors">
                {isCapturing ? (
                  <RefreshCw size={18} className="animate-spin text-white" />
                ) : (
                  <Camera size={20} className="text-white" />
                )}
              </div>
            </button>

            {/* Native Gallery Fallback */}
            <label
              htmlFor="live-modal-footer-file"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              title="Upload existing file"
            >
              <Upload size={16} />
              <span className="hidden sm:inline">Upload</span>
            </label>
            <input
              id="live-modal-footer-file"
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="sr-only"
              onChange={handleNativeCapture}
            />
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
