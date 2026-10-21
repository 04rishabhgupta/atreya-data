import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CapturedImages } from '../types';
import { Camera, RefreshCcw, Check, ArrowRight, AlertCircle, ArrowLeft, CheckCircle2, Compass, Sparkles } from 'lucide-react';

interface Step3FaceScanProps {
  images: CapturedImages;
  onUpdateImages: (images: CapturedImages) => void;
  onContinue: () => void;
  onBack: () => void;
}

type ScanStage = 'front' | 'left' | 'right';
type DetectedDirection = 'front' | 'left' | 'right' | 'none';

export const Step3FaceScan: React.FC<Step3FaceScanProps> = ({
  images,
  onUpdateImages,
  onContinue,
  onBack
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [currentStage, setCurrentStage] = useState<ScanStage>('front');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Real-time direction detection state
  const [detectedDirection, setDetectedDirection] = useState<DetectedDirection>('none');
  const [directionConfidence, setDirectionConfidence] = useState<number>(0);

  // Temporary local states for current stage preview before confirm
  const [stagePreview, setStagePreview] = useState<string | null>(null);
  const [stageBlob, setStageBlob] = useState<Blob | null>(null);

  // Auto-hold timer ref to trigger capture when angle is maintained
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize webcam
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    let isCancelled = false;

    async function startCamera() {
      try {
        setCameraError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false
        });

        if (isCancelled) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }

        activeStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err: any) {
        console.error('Webcam error:', err);
        setCameraError(
          'Unable to access webcam. Please ensure camera permissions are granted and no other application is using the camera.'
        );
      }
    }

    startCamera();

    return () => {
      isCancelled = true;
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // CRITICAL FIX: Ensure video element NEVER loses its srcObject stream
  // when stages transition (from front -> left -> right) or when previews close.
  useEffect(() => {
    if (videoRef.current && stream) {
      if (videoRef.current.srcObject !== stream) {
        videoRef.current.srcObject = stream;
      }
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [stream, currentStage, stagePreview]);

  // Real-Time Direction & Pose Detection Engine
  // Analyzes facial centroid and motion displacement in mirrored user coordinates
  useEffect(() => {
    if (stagePreview) return; // Pause analysis while reviewing preview image

    if (!analysisCanvasRef.current) {
      analysisCanvasRef.current = document.createElement('canvas');
      analysisCanvasRef.current.width = 160;
      analysisCanvasRef.current.height = 120;
    }

    const analysisCanvas = analysisCanvasRef.current;
    const ctx = analysisCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let prevLuminance: Float32Array | null = null;
    let isSubscribed = true;

    const intervalId = setInterval(() => {
      if (!isSubscribed || !videoRef.current || videoRef.current.readyState < 2) return;

      const video = videoRef.current;
      const width = analysisCanvas.width;
      const height = analysisCanvas.height;

      // Draw current video frame to analysis canvas
      ctx.drawImage(video, 0, 0, width, height);

      try {
        const frame = ctx.getImageData(0, 0, width, height);
        const data = frame.data;
        const totalPixels = width * height;
        const currLuminance = new Float32Array(totalPixels);

        let skinPixelCount = 0;
        let weightedMirroredXSum = 0;
        let leftHalfWeight = 0;
        let rightHalfWeight = 0;
        const centerX = width / 2;

        // Sample face region (center 70% horizontally, middle 70% vertically)
        const minX = Math.floor(width * 0.15);
        const maxX = Math.floor(width * 0.85);
        const minY = Math.floor(height * 0.15);
        const maxY = Math.floor(height * 0.85);

        for (let y = minY; y < maxY; y++) {
          for (let x = minX; x < maxX; x++) {
            const idx = (y * width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            // Luminance
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            currLuminance[y * width + x] = lum;

            // Skin color heuristic (YCbCr / RGB boundary)
            const isSkin = r > 50 && g > 35 && b > 20 && r > g && r > b && (r - g) >= 10;
            if (isSkin) {
              // Convert raw sensor coordinate x into mirrored user-facing coordinate:
              // For front-facing camera: mirroredX = (width - 1 - x)
              const mirroredX = width - 1 - x;
              weightedMirroredXSum += mirroredX;
              skinPixelCount++;

              if (mirroredX < centerX - 4) {
                leftHalfWeight++;
              } else if (mirroredX > centerX + 4) {
                rightHalfWeight++;
              }
            }
          }
        }

        prevLuminance = currLuminance;

        if (skinPixelCount > 80) {
          const mirroredCentroidX = weightedMirroredXSum / skinPixelCount;
          const normalizedOffset = (mirroredCentroidX - centerX) / (width * 0.35); // -1 (left) to +1 (right)
          const asymmetry = (rightHalfWeight - leftHalfWeight) / (rightHalfWeight + leftHalfWeight + 0.001);

          // Thresholds for classification:
          // Left turn: user turned head to their left -> centroid and asymmetry shift to user's left (< -0.16)
          // Right turn: user turned head to their right -> centroid and asymmetry shift to user's right (> 0.16)
          // Front: balanced near center
          if (normalizedOffset < -0.16 || asymmetry < -0.18) {
            setDetectedDirection('left');
            setDirectionConfidence(Math.min(100, Math.round(Math.abs(normalizedOffset) * 120)));
          } else if (normalizedOffset > 0.16 || asymmetry > 0.18) {
            setDetectedDirection('right');
            setDirectionConfidence(Math.min(100, Math.round(Math.abs(normalizedOffset) * 120)));
          } else {
            setDetectedDirection('front');
            setDirectionConfidence(Math.max(60, 100 - Math.round(Math.abs(normalizedOffset) * 100)));
          }
        } else {
          setDetectedDirection('none');
        }
      } catch (err) {
        // Fallback gracefully
      }
    }, 150);

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
    };
  }, [stagePreview]);

  // Handle countdown timer
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      executeCapture();
    }
  }, [countdown]);

  const startCountdown = useCallback(() => {
    if (isCapturing) return;
    setIsCapturing(true);
    setCountdown(3);
  }, [isCapturing]);

  // Execute Capture with foolproof video readiness and mirror mapping
  const executeCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setIsCapturing(false);
      setCountdown(null);
      return;
    }

    // Ensure video is actively playing before reading pixels
    if (video.paused && stream) {
      video.srcObject = stream;
      video.play().catch(() => {});
    }

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsCapturing(false);
      setCountdown(null);
      return;
    }

    // Clear canvas before painting
    ctx.clearRect(0, 0, width, height);

    // Front-camera selfie mirror transform so captured images preserve natural user orientation
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();

    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setIsCapturing(false);
            setCountdown(null);
            return;
          }
          setStagePreview(dataUrl);
          setStageBlob(blob);
          setIsCapturing(false);
          setCountdown(null);
        },
        'image/jpeg',
        0.92
      );
    } catch (err) {
      console.error('Error creating image blob:', err);
      setIsCapturing(false);
      setCountdown(null);
    }
  };

  const confirmStageCapture = () => {
    if (!stagePreview || !stageBlob) return;

    const updated = { ...images };
    if (currentStage === 'front') {
      updated.front = stagePreview;
      updated.frontBlob = stageBlob;
      setCurrentStage('left');
    } else if (currentStage === 'left') {
      updated.left = stagePreview;
      updated.leftBlob = stageBlob;
      setCurrentStage('right');
    } else if (currentStage === 'right') {
      updated.right = stagePreview;
      updated.rightBlob = stageBlob;
    }

    onUpdateImages(updated);
    setStagePreview(null);
    setStageBlob(null);
    setDetectedDirection('none');

    // Ensure video resumes playing immediately for next shot
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  };

  const retakeStageCapture = () => {
    setStagePreview(null);
    setStageBlob(null);
    setDetectedDirection('none');

    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  };

  const isDirectionMatched = detectedDirection === currentStage;

  // Auto-hold capture: If user turns and holds the matched angle for 1.5s, trigger countdown
  useEffect(() => {
    if (stagePreview || isCapturing || countdown !== null) {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      return;
    }

    if (isDirectionMatched) {
      if (!holdTimerRef.current) {
        holdTimerRef.current = setTimeout(() => {
          startCountdown();
        }, 1500);
      }
    } else {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    }

    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
    };
  }, [isDirectionMatched, detectedDirection, stagePreview, isCapturing, countdown, startCountdown]);

  const getStageTitle = () => {
    switch (currentStage) {
      case 'front':
        return 'Shot 1: Front View';
      case 'left':
        return 'Shot 2: Left Side View';
      case 'right':
        return 'Shot 3: Right Side View';
    }
  };

  const getStageInstruction = () => {
    switch (currentStage) {
      case 'front':
        return 'Please look straight at the camera with a neutral expression.';
      case 'left':
        return 'Please slowly turn your head to your left.';
      case 'right':
        return 'Please slowly turn your head to your right.';
    }
  };

  const allCaptured = !!(images.front && images.left && images.right);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-3xl border border-teal-100 shadow-xl p-6 sm:p-10 space-y-8">
        {/* Step Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-teal-50 border border-teal-200 rounded-full text-teal-800 text-xs font-semibold">
            <Camera className="w-4 h-4 text-teal-600" />
            <span>Step 3 of 7: Facial Capture</span>
          </div>
          <button
            onClick={onBack}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Instructions</span>
          </button>
        </div>

        {/* Progress pills for the 3 shots */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div
            className={`p-3 sm:p-4 rounded-2xl border text-center transition-all ${
              currentStage === 'front' && !images.front
                ? 'border-teal-600 bg-teal-50/70 shadow-md ring-2 ring-teal-600/20'
                : images.front
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                : 'border-slate-200 bg-slate-50 text-slate-400'
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider mb-0.5">Shot 1</p>
            <p className="font-bold text-xs sm:text-sm">Front View {images.front && '✓'}</p>
          </div>

          <div
            className={`p-3 sm:p-4 rounded-2xl border text-center transition-all ${
              currentStage === 'left' && !images.left
                ? 'border-teal-600 bg-teal-50/70 shadow-md ring-2 ring-teal-600/20'
                : images.left
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                : 'border-slate-200 bg-slate-50 text-slate-400'
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider mb-0.5">Shot 2</p>
            <p className="font-bold text-xs sm:text-sm">Left View {images.left && '✓'}</p>
          </div>

          <div
            className={`p-3 sm:p-4 rounded-2xl border text-center transition-all ${
              currentStage === 'right' && !images.right
                ? 'border-teal-600 bg-teal-50/70 shadow-md ring-2 ring-teal-600/20'
                : images.right
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                : 'border-slate-200 bg-slate-50 text-slate-400'
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider mb-0.5">Shot 3</p>
            <p className="font-bold text-xs sm:text-sm">Right View {images.right && '✓'}</p>
          </div>
        </div>

        {/* Camera Error Display */}
        {cameraError ? (
          <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center my-6">
            <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-rose-900 mb-2">Camera Access Error</h3>
            <p className="text-sm text-rose-700 max-w-md mx-auto mb-6">{cameraError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-sm shadow-md"
            >
              Retry Camera Connection
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. Camera Section at the Top */}
            <div className="w-full max-w-2xl mx-auto">
              <div className="relative aspect-4/3 bg-slate-900 rounded-3xl overflow-hidden shadow-xl border-4 border-teal-100 flex items-center justify-center">
                {/* 
                  CRITICAL ARCHITECTURAL FIX:
                  The <video> element is PERMANENTLY MOUNTED in the DOM.
                  It is NEVER removed, avoiding browser stream detachment when capturing.
                */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover -scale-x-100 ${
                    stagePreview ? 'hidden' : 'block'
                  }`}
                />

                {/* Captured Still Preview (Shown only when an image has just been captured) */}
                {stagePreview && (
                  <img
                    src={stagePreview}
                    alt="Captured preview"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Overlays (Only active when live video is visible) */}
                {!stagePreview && (
                  <>
                    {/* Dynamic Oval Guideline Overlay with Real-Time Pose Detection Feedback */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className={`w-44 sm:w-56 h-60 sm:h-72 border-4 rounded-full transition-all duration-300 ${
                          isDirectionMatched
                            ? 'border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.6)] bg-emerald-500/10'
                            : 'border-teal-400/80 border-dashed animate-pulse'
                        }`}
                      />
                    </div>

                    {/* Directional Overlay Hints */}
                    {currentStage === 'left' && (
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-teal-300 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow">
                        <span>←</span>
                        <span>Turn Head to Your Left</span>
                      </div>
                    )}

                    {currentStage === 'right' && (
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-teal-300 px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow">
                        <span>Turn Head to Your Right</span>
                        <span>→</span>
                      </div>
                    )}

                    {/* Live Movement Detection Badge */}
                    <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none">
                      <div
                        className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur-md shadow-lg transition-all ${
                          isDirectionMatched
                            ? 'bg-emerald-600/90 text-white shadow-emerald-500/30 ring-2 ring-emerald-300'
                            : 'bg-black/65 text-slate-200'
                        }`}
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>
                          {isDirectionMatched ? (
                            currentStage === 'front' ? 'Face Centered ✓' :
                            currentStage === 'left' ? 'Left Turn Detected ✓ — Hold Still' :
                            'Right Turn Detected ✓ — Hold Still'
                          ) : (
                            detectedDirection === 'none' ? 'Detecting head position...' :
                            detectedDirection === 'front' ? 'Position: Center' :
                            detectedDirection === 'left' ? 'Position: Left' : 'Position: Right'
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Countdown Overlay */}
                    {countdown !== null && (
                      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-8xl font-black text-white animate-ping">
                          {countdown}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Hidden Capture Canvas */}
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </div>

            {/* 2. Camera Information & Controls Placed Directly BELOW the Camera */}
            <div className="w-full max-w-2xl mx-auto bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider text-teal-700 uppercase">
                    {getStageTitle()}
                  </span>
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      isDirectionMatched
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {isDirectionMatched
                        ? 'Angle Matched'
                        : currentStage === 'front'
                        ? 'Align to Center'
                        : `Turn to ${currentStage === 'left' ? 'Left' : 'Right'}`}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                  {getStageInstruction()}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Position your face clearly within the oval guide. The system detects your angle automatically, or you can capture manually below.
                </p>
              </div>

              {/* Action Controls */}
              <div>
                {stagePreview ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold text-center flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>{getStageTitle()} captured successfully! Review or retake below.</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={retakeStageCapture}
                        className="w-full h-14 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <RefreshCcw className="w-5 h-5" />
                        <span>Retake</span>
                      </button>
                      <button
                        onClick={confirmStageCapture}
                        className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30 transition-all active:scale-95"
                      >
                        <Check className="w-5 h-5" />
                        <span>Confirm & Next</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={startCountdown}
                    disabled={isCapturing}
                    className={`w-full h-16 font-bold text-lg rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all active:scale-98 disabled:opacity-50 ${
                      isDirectionMatched
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
                        : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/30'
                    }`}
                  >
                    <Camera className="w-6 h-6" />
                    <span>
                      {isCapturing
                        ? 'Capturing in 3s...'
                        : isDirectionMatched
                        ? `Capture ${getStageTitle()} (Angle Matched ✓)`
                        : `Capture ${getStageTitle()}`}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Captured Photos Review Strip */}
        <div className="bg-slate-50 border border-slate-200 p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-xs sm:text-sm font-bold text-slate-700">Captured Photos:</span>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-200 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center text-center">
                {images.front ? (
                  <img src={images.front} alt="Front" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium">Front</span>
                )}
              </div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-200 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center text-center">
                {images.left ? (
                  <img src={images.left} alt="Left" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium">Left</span>
                )}
              </div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-200 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center text-center">
                {images.right ? (
                  <img src={images.right} alt="Right" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-slate-400 font-medium">Right</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onUpdateImages({ front: null, left: null, right: null });
              setCurrentStage('front');
              setStagePreview(null);
              setStageBlob(null);
              if (videoRef.current && stream) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(() => {});
              }
            }}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 underline"
          >
            Retake All Photos
          </button>
        </div>

        {/* Continue to Details Form */}
        <button
          onClick={onContinue}
          disabled={!allCaptured}
          className={`w-full h-20 font-bold text-xl rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all ${
            allCaptured
              ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/30 active:scale-[0.99]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>Continue to Patient Details</span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};


