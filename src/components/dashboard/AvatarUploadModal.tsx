import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Upload,
  RefreshCw,
  Check,
  X,
  Trash2,
  AlertCircle,
  Sparkles,
  Loader2,
  FlipHorizontal,
  User,
  ShieldCheck,
} from 'lucide-react';
import { useFitnessStore } from '../../store/useFitnessStore';

export function AvatarUploadModal() {
  const isOpen = useFitnessStore((s) => s.isAvatarModalOpen);
  const setIsOpen = useFitnessStore((s) => s.setAvatarModalOpen);
  const user = useFitnessStore((s) => s.user);
  const updateAvatar = useFitnessStore((s) => s.updateAvatar);

  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isShutterFlashing, setIsShutterFlashing] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping track:', e);
        }
      });
      setCameraStream(null);
    }
  }, [cameraStream]);

  // Start camera stream
  const startCamera = useCallback(
    async (preferredFacing: 'user' | 'environment' = facingMode) => {
      stopCamera();
      setCameraError(null);
      setIsCameraStarting(true);

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access is not supported on this browser or platform.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: preferredFacing,
            width: { ideal: 640 },
            height: { ideal: 640 },
          },
          audio: false,
        });

        setCameraStream(stream);
        setIsCameraStarting(false);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => {
            console.warn('Video play error:', err);
          });
        }
      } catch (err: any) {
        setIsCameraStarting(false);
        console.warn('Camera start error:', err);
        if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
          setCameraError('Camera permission was denied. Please grant permission in your browser or select a photo file.');
        } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
          setCameraError('No camera found on this device. You can choose a photo file instead.');
        } else {
          setCameraError(err?.message || 'Unable to access device camera. Please upload an image instead.');
        }
      }
    },
    [facingMode, stopCamera]
  );

  // When modal opens in camera mode, start camera
  useEffect(() => {
    if (isOpen && mode === 'camera' && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, mode, capturedImage]);

  // Ensure video element gets stream if stream changes
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraStream]);

  // Close handler with cleanup
  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setCameraError(null);
    setIsOpen(false);
  };

  // Flip camera between user (front) and environment (back)
  const handleFlipCamera = () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  // Take photo from video stream and crop centered square to canvas
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    setIsShutterFlashing(true);
    setTimeout(() => setIsShutterFlashing(false), 200);

    const canvas = document.createElement('canvas');
    const targetSize = 400;
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const vWidth = video.videoWidth || 640;
      const vHeight = video.videoHeight || 480;
      const minDim = Math.min(vWidth, vHeight);
      const startX = (vWidth - minDim) / 2;
      const startY = (vHeight - minDim) / 2;

      // If front camera, mirror image for natural selfie feel
      if (facingMode === 'user') {
        ctx.translate(targetSize, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, startX, startY, minDim, minDim, 0, 0, targetSize, targetSize);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  // File upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const targetSize = 400;
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;
          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, targetSize, targetSize);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setCapturedImage(dataUrl);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Save captured photo to user profile
  const handleSaveAvatar = async () => {
    if (!capturedImage) return;
    setIsSaving(true);
    await updateAvatar(capturedImage);
    setIsSaving(false);
    handleClose();
  };

  // Remove avatar handler
  const handleRemoveAvatar = async () => {
    if (confirm('Remove your profile photo and revert to initial monogram?')) {
      setIsSaving(true);
      await updateAvatar(null);
      setIsSaving(false);
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        >
          {/* Shutter flash overlay effect */}
          {isShutterFlashing && (
            <div className="absolute inset-0 z-50 bg-white opacity-80 pointer-events-none transition-opacity duration-150" />
          )}

          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Profile Photo</h2>
                <p className="text-xs text-slate-400">Personalize your account avatar</p>
              </div>
            </div>

            <button
              type="button"
              id="close-avatar-modal-btn"
              onClick={handleClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Mode Switcher Tabs (Take Photo vs Upload) */}
            {!capturedImage && (
              <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200/60">
                <button
                  type="button"
                  id="avatar-tab-camera-btn"
                  onClick={() => {
                    setMode('camera');
                    startCamera();
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    mode === 'camera'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Device Camera</span>
                </button>
                <button
                  type="button"
                  id="avatar-tab-upload-btn"
                  onClick={() => {
                    stopCamera();
                    setMode('upload');
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    mode === 'upload'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>Upload File</span>
                </button>
              </div>
            )}

            {/* Error Message if Camera fails */}
            {cameraError && !capturedImage && mode === 'camera' && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setCameraError(null);
                      setMode('upload');
                    }}
                    className="mt-2 inline-flex items-center gap-1 font-bold text-rose-700 underline underline-offset-2 hover:text-rose-900"
                  >
                    <span>Switch to file upload instead</span>
                  </button>
                </div>
              </div>
            )}

            {/* PREVIEW OF CAPTURED IMAGE */}
            {capturedImage ? (
              <div className="space-y-4 text-center">
                <div className="relative mx-auto w-48 h-48 rounded-full overflow-hidden border-4 border-emerald-500 shadow-lg bg-slate-900">
                  <img
                    src={capturedImage}
                    alt="New avatar preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 inset-x-0 flex justify-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                      Ready to Save
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  Looks great! Confirm to update your athlete avatar across all devices.
                </div>

                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    id="avatar-retake-photo-btn"
                    onClick={() => {
                      setCapturedImage(null);
                      if (mode === 'camera') startCamera();
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake Photo</span>
                  </button>

                  <button
                    type="button"
                    id="avatar-save-confirm-btn"
                    onClick={handleSaveAvatar}
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm & Use Photo</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : mode === 'camera' ? (
              /* LIVE CAMERA VIEWFINDER */
              <div className="space-y-4">
                <div className="relative mx-auto w-56 h-56 rounded-full overflow-hidden border-4 border-slate-900 bg-slate-950 shadow-inner flex items-center justify-center group">
                  {isCameraStarting ? (
                    <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                      <span>Activating camera...</span>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${
                          facingMode === 'user' ? 'scale-x-[-1]' : ''
                        }`}
                      />

                      {/* Optical Centering Reticle Overlay */}
                      <div className="absolute inset-0 pointer-events-none border border-white/20 rounded-full flex items-center justify-center">
                        <div className="w-16 h-16 border border-white/30 rounded-full" />
                      </div>

                      {/* Flip Camera Button */}
                      <button
                        type="button"
                        id="avatar-flip-camera-btn"
                        onClick={handleFlipCamera}
                        title="Flip camera"
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-2xs shadow-xs"
                      >
                        <FlipHorizontal className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-xs text-slate-500">
                    Position your face within the circle and snap your photo
                  </p>
                </div>

                {/* Shutter Capture Button */}
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    id="avatar-capture-shutter-btn"
                    onClick={handleCapturePhoto}
                    disabled={isCameraStarting || !!cameraError}
                    className="group relative w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Take Photo"
                  >
                    <div className="w-13 h-13 rounded-full border-2 border-white flex items-center justify-center group-hover:scale-95 transition-transform">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              /* FILE UPLOAD / DRAG & DROP MODE */
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="avatar-file-input"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-emerald-50/20 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white text-slate-600 group-hover:text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-2xs border border-slate-100 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    Click to browse or drop an image
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    PNG, JPG, HEIC, or WebP up to 10MB
                  </div>
                </div>
              </div>
            )}

            {/* Current Avatar Status & Remove Option */}
            {user?.avatar_url && !capturedImage && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-200">
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-slate-600 font-medium">Custom photo active</span>
                </div>

                <button
                  type="button"
                  id="avatar-remove-current-btn"
                  onClick={handleRemoveAvatar}
                  disabled={isSaving}
                  className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove photo</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Avatars are processed locally and securely stored with your profile</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
