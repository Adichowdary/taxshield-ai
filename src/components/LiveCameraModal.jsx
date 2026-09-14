import { useState, useRef, useEffect, useCallback } from 'react'
import { Camera, X, RefreshCw, SwitchCamera, AlertCircle, Sparkles, Check } from 'lucide-react'

export default function LiveCameraModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const fileFallbackRef = useRef(null)

  const [hasPermission, setHasPermission] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [facingMode, setFacingMode] = useState('environment') // 'environment' (back) or 'user' (front)
  const [isCapturing, setIsCapturing] = useState(false)

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  const startCamera = useCallback(async (mode = facingMode) => {
    stopStream()
    setErrorMsg('')
    setHasPermission(null)

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasPermission(false)
      setErrorMsg('Direct camera access is not supported on this browser or connection.')
      return
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch((err) => console.warn('Video play error:', err))
      }
      setHasPermission(true)
    } catch (err) {
      console.warn('getUserMedia error:', err)
      setHasPermission(false)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg('Camera permission was denied. Please allow camera access in your browser settings.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMsg('No camera hardware detected on this device.')
      } else {
        setErrorMsg('Could not start live camera. You can still select or take a photo below.')
      }
    }
  }, [facingMode, stopStream])

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode)
    } else {
      stopStream()
    }
    return () => stopStream()
  }, [isOpen, facingMode, startCamera, stopStream])

  const handleCapture = () => {
    if (!videoRef.current || !streamRef.current) return

    setIsCapturing(true)
    try {
      const video = videoRef.current
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth || 1280
      canvas.height = video.videoHeight || 720

      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        (blob) => {
          setIsCapturing(false)
          if (blob) {
            const capturedFile = new File(
              [blob],
              `bill_camera_${Date.now()}.jpg`,
              { type: 'image/jpeg' }
            )
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

  const handleFallbackFileInput = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      stopStream()
      onCapture(file)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-950 border border-sky-500/30 dark:border-[#D4AF37]/30 shadow-2xl overflow-hidden flex flex-col text-white max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 dark:bg-[#D4AF37]/20 dark:text-[#FDE68A] flex items-center justify-center font-bold">
              <Camera size={16} />
            </div>
            <div>
              <h3 className="font-poppins font-bold text-xs sm:text-sm tracking-tight text-white flex items-center gap-1.5">
                Live Optical Bill Scanner
              </h3>
              <p className="text-[10px] text-slate-400">Position bill receipt inside the reticle</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close Camera"
          >
            <X size={20} />
          </button>
        </div>

        {/* Camera Viewport Area */}
        <div className="relative flex-1 min-h-[320px] sm:min-h-[420px] bg-black flex items-center justify-center overflow-hidden">
          {hasPermission === true && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Receipt Reticle Box */}
              <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-sky-400/70 dark:border-[#D4AF37]/70 rounded-2xl pointer-events-none flex flex-col justify-between p-3 shadow-[0_0_20px_rgba(2,132,199,0.2)]">
                <div className="flex justify-between text-[10px] font-mono text-sky-300 dark:text-[#FDE68A] font-bold">
                  <span>[ OCR SENSOR ]</span>
                  <span>1080P HD</span>
                </div>

                {/* Laser scanline animation */}
                <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-sky-400 dark:via-[#D4AF37] to-transparent animate-laser-scan shadow-[0_0_12px_#38BDF8]" />

                <div className="text-center text-[11px] font-medium text-slate-200 bg-black/60 py-1 px-2 rounded-lg backdrop-blur-md self-center">
                  Align receipt edges & tap shutter
                </div>
              </div>
            </>
          )}

          {/* Loading / Starting Camera */}
          {hasPermission === null && (
            <div className="text-center space-y-2 p-6">
              <RefreshCw size={28} className="animate-spin text-sky-400 dark:text-[#D4AF37] mx-auto" />
              <p className="text-xs font-semibold text-slate-300">Initializing camera sensor...</p>
            </div>
          )}

          {/* Permission Denied or Not Supported Error */}
          {hasPermission === false && (
            <div className="p-6 text-center space-y-4 max-w-sm">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
                <AlertCircle size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-white">Camera Access Notice</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {errorMsg}
                </p>
              </div>

              {/* Fallback Native File Capture Button */}
              <button
                type="button"
                onClick={() => fileFallbackRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-gradient-to-r dark:from-[#B45309] dark:to-[#D4AF37] text-white font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Camera size={16} /> Open Native Device Camera
              </button>

              <input
                ref={fileFallbackRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFallbackFileInput}
              />
            </div>
          )}
        </div>

        {/* Shutter / Controls Footer */}
        {hasPermission === true && (
          <div className="px-6 py-4 bg-slate-950 border-t border-white/10 flex items-center justify-between">
            {/* Flip Camera Button */}
            <button
              type="button"
              onClick={handleFlipCamera}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Flip Front/Rear Camera"
            >
              <SwitchCamera size={20} />
            </button>

            {/* Shutter Action Button */}
            <button
              type="button"
              onClick={handleCapture}
              disabled={isCapturing}
              aria-label="Take Photo"
              className="w-16 h-16 rounded-full p-1.5 border-4 border-white/30 hover:border-white transition-all active:scale-95 touch-manipulation cursor-pointer flex items-center justify-center shadow-2xl"
            >
              <div 
                className="w-full h-full rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
                  boxShadow: '0 0 20px rgba(2, 132, 199, 0.6)'
                }}
              >
                {isCapturing ? (
                  <RefreshCw size={22} className="animate-spin text-white" />
                ) : (
                  <Camera size={24} className="text-white" />
                )}
              </div>
            </button>

            {/* Native Gallery Fallback */}
            <button
              type="button"
              onClick={() => fileFallbackRef.current?.click()}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              title="Upload from Device"
            >
              File
            </button>

            <input
              ref={fileFallbackRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFallbackFileInput}
            />
          </div>
        )}
      </div>
    </div>
  )
}
