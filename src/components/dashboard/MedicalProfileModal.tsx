import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  HeartPulse,
  Pill,
  Upload,
  Camera,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Activity,
  Droplets,
  Flame,
  Bone,
  Heart,
  Loader2,
} from 'lucide-react';
import { useFitnessStore } from '../../store/useFitnessStore';
import { HealthCondition, MedicinePhoto } from '../../types';
import { HEALTH_CONDITIONS_CATALOG } from '../../lib/healthConditions';
import { apiScanMedicine } from '../../lib/api';

export function MedicalProfileModal() {
  const user = useFitnessStore((s) => s.user);
  const isOpen = useFitnessStore((s) => s.isMedicalProfileModalOpen);
  const setIsOpen = useFitnessStore((s) => s.setMedicalProfileModalOpen);
  const updateMedicalProfile = useFitnessStore((s) => s.updateMedicalProfile);

  // Two-step flow: 'conditions' -> 'medicines'
  const [step, setStep] = useState<'conditions' | 'medicines'>('conditions');

  // Step 1: Health Conditions
  const [selectedConditions, setSelectedConditions] = useState<HealthCondition[]>([]);
  const [healthDescription, setHealthDescription] = useState<string>('');

  // Step 2: Regular Medicines & Pictures
  const [medicines, setMedicines] = useState<string[]>([]);
  const [newMedInput, setNewMedInput] = useState<string>('');
  const [medicinePhotos, setMedicinePhotos] = useState<MedicinePhoto[]>([]);

  // Scanning & UI States
  const [isScanningPhoto, setIsScanningPhoto] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever modal opens or user updates
  useEffect(() => {
    if (user && isOpen) {
      setSelectedConditions(user.health_conditions || []);
      setHealthDescription(user.health_description || '');
      setMedicines(user.medicines || []);
      setMedicinePhotos(user.medicine_photos || []);
      setStep('conditions');
      setSaveSuccess(false);
      setScanMessage(null);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const toggleCondition = (conditionId: HealthCondition) => {
    if (selectedConditions.includes(conditionId)) {
      setSelectedConditions(selectedConditions.filter((c) => c !== conditionId));
    } else {
      setSelectedConditions([...selectedConditions, conditionId]);
    }
  };

  const handleAddMedicine = () => {
    const trimmed = newMedInput.trim();
    if (!trimmed) return;
    if (!medicines.some((m) => m.toLowerCase() === trimmed.toLowerCase())) {
      setMedicines([...medicines, trimmed]);
    }
    setNewMedInput('');
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleRemovePhoto = (index: number) => {
    setMedicinePhotos(medicinePhotos.filter((_, i) => i !== index));
  };

  // Medicine photo upload & OCR scanning via backend
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningPhoto(true);
    setScanMessage('AI is scanning medicine packaging & active ingredients...');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;

        // Call backend real AI medicine OCR scanner
        const scanResult = await apiScanMedicine(base64Data, file.type || 'image/jpeg');

        const detectedName = scanResult?.medicine_name || file.name.replace(/\.[^/.]+$/, '');
        const newPhotoItem: MedicinePhoto = {
          id: `med_${Date.now()}`,
          url: base64Data,
          photo_url: base64Data,
          extracted_name: detectedName,
          detected_name: detectedName,
          dosage: scanResult?.dosage,
          active_ingredient: scanResult?.active_ingredient,
          notes: scanResult?.dietary_precaution,
          uploaded_at: new Date().toISOString(),
          taken_at: new Date().toISOString(),
        };

        setMedicinePhotos((prev) => [newPhotoItem, ...prev]);

        // Auto-add to medication list if not present
        if (detectedName && !medicines.some((m) => m.toLowerCase() === detectedName.toLowerCase())) {
          setMedicines((prev) => [...prev, detectedName]);
        }

        setScanMessage(
          scanResult?.dietary_precaution
            ? `Identified "${detectedName}". Dietary note: ${scanResult.dietary_precaution}`
            : `Identified "${detectedName}" successfully.`
        );
        setIsScanningPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.warn('Medicine photo scan error:', err);
      setScanMessage('Could not scan photo automatically, but image was attached.');
      setIsScanningPhoto(false);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    await updateMedicalProfile({
      health_conditions: selectedConditions,
      health_description: healthDescription,
      medicines: medicines,
      medicine_photos: medicinePhotos,
    });
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => {
      setIsOpen(false);
    }, 700);
  };

  const getConditionIcon = (id: HealthCondition) => {
    switch (id) {
      case 'diabetes':
        return <Droplets className="w-5 h-5 text-amber-600" />;
      case 'high_bp':
        return <Activity className="w-5 h-5 text-rose-600" />;
      case 'low_bp':
        return <Heart className="w-5 h-5 text-blue-600" />;
      case 'arthritis':
        return <Bone className="w-5 h-5 text-orange-600" />;
      case 'joint_pain':
        return <Flame className="w-5 h-5 text-yellow-600" />;
      case 'cholesterol':
        return <HeartPulse className="w-5 h-5 text-purple-600" />;
      default:
        return <HeartPulse className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 14 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-2xs shrink-0">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Medical Profile</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 tracking-wide uppercase">
                    AI Safeguards
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  {step === 'conditions'
                    ? 'Step 1 of 2: Select health conditions & metabolic focus areas'
                    : 'Step 2 of 2: Regular medications & prescription scans'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors border border-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="flex items-center border-b border-slate-100 bg-white px-6 py-2.5 gap-3">
            <button
              type="button"
              onClick={() => setStep('conditions')}
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                step === 'conditions'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200/60 shadow-2xs'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
                step === 'conditions' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                1
              </span>
              <span>Health Conditions ({selectedConditions.length})</span>
            </button>

            <span className="text-slate-300">/</span>

            <button
              type="button"
              onClick={() => setStep('medicines')}
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                step === 'medicines'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200/60 shadow-2xs'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold ${
                step === 'medicines' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                2
              </span>
              <span>Medications ({medicines.length + medicinePhotos.length})</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {step === 'conditions' ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                    Select Your Health Conditions
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select all that apply. Whenever you scan or log food, the AI will cross-reference nutrients (sodium, potassium, saturated fats, carbohydrates, and fiber) against your selected conditions.
                  </p>
                </div>

                {/* Grid of Conditions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {HEALTH_CONDITIONS_CATALOG.map((item) => {
                    const isSelected = selectedConditions.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleCondition(item.id)}
                        className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-rose-50/60 border-rose-300 shadow-xs ring-1 ring-rose-200'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                        }`}
                      >
                        <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-2xs shrink-0 mt-0.5">
                          {getConditionIcon(item.id)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">
                              {item.title}
                            </span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-rose-600 border-rose-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}>
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                            {item.shortDesc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Additional Clinical Notes */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Specific Lifestyle or Health Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={healthDescription}
                    onChange={(e) => setHealthDescription(e.target.value)}
                    placeholder="e.g. Monitoring fasting glucose in the mornings, prefer low-purine ingredients, mild knee stiffness after running."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-rose-400 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            ) : (
              /* Step 2: Medicines & Photo OCR */
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                    Regular Medications & Prescription Scans
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Write down medications you take regularly or upload a clear photo of the packaging. The AI will inspect potential food-drug interactions (e.g. grapefruit with statins, carbohydrate timing with metformin).
                  </p>
                </div>

                {/* Input Medicine Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    Add Regular Medicine
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Pill className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={newMedInput}
                        onChange={(e) => setNewMedInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddMedicine();
                          }
                        }}
                        placeholder="e.g. Metformin 500mg, Atorvastatin 20mg, Amlodipine 5mg, Omega-3"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-rose-400 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMedicine}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Upload Picture Button */}
                  <div className="pt-1 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span>Or snap/upload a photo of your medicine strip or label:</span>
                    </span>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="med-photo-upload-input"
                    />

                    <button
                      type="button"
                      disabled={isScanningPhoto}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {isScanningPhoto ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                          <span>Scanning with AI OCR...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-3.5 h-3.5 text-rose-600" />
                          <span>Upload Medicine Photo</span>
                        </>
                      )}
                    </button>
                  </div>

                  {scanMessage && (
                    <div className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-xl flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{scanMessage}</span>
                    </div>
                  )}
                </div>

                {/* List of Active Medicines */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800">
                      Current Active Medications ({medicines.length})
                    </span>
                    {medicines.length === 0 && (
                      <span className="text-[11px] text-slate-400 italic">
                        No medicines added yet (optional)
                      </span>
                    )}
                  </div>

                  {medicines.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {medicines.map((med, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-2xs"
                        >
                          <Pill className="w-3.5 h-3.5 text-rose-500" />
                          <span>{med}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicine(index)}
                            className="text-slate-400 hover:text-rose-600 transition-colors ml-1 cursor-pointer"
                            title="Remove medicine"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* Uploaded Medicine Photos */}
                {medicinePhotos.length > 0 && (
                  <div>
                    <span className="block text-xs font-bold text-slate-800 mb-2">
                      Scanned Prescription & Medicine Photos ({medicinePhotos.length})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {medicinePhotos.map((photo, pIdx) => (
                        <div
                          key={photo.id || pIdx}
                          className="flex items-center gap-3 p-2.5 rounded-2xl border border-slate-200 bg-white shadow-2xs"
                        >
                          <img
                            src={photo.photo_url || photo.url}
                            alt={photo.detected_name || photo.extracted_name || 'Medicine'}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0 bg-slate-100"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">
                              {photo.detected_name || photo.extracted_name || 'Medicine'}
                            </div>
                            {photo.active_ingredient && (
                              <div className="text-[10px] text-purple-700 truncate font-medium">
                                {photo.active_ingredient}
                              </div>
                            )}
                            {photo.notes && (
                              <div className="text-[10px] text-slate-400 truncate">
                                {photo.notes}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(pIdx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Assurance Info Banner */}
                <div className="bg-purple-50/70 border border-purple-100 rounded-2xl p-3 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-purple-900 leading-relaxed">
                    <strong>Medical Profile Synchronized:</strong> Every time you upload food photos for nutritional analysis, the multimodal engine automatically analyzes your selected conditions and regular medications to deliver clinically safe, personalized dietary observations.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/80">
            {step === 'conditions' ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  id="medical-profile-continue-btn"
                  onClick={() => setStep('medicines')}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                >
                  <span>Continue to Medicines</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setStep('conditions')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    id="save-medical-profile-btn"
                    onClick={handleSaveAll}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {saveSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>Saved to Cloud!</span>
                      </>
                    ) : isSaving ? (
                      <span>Saving Profile...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-white" />
                        <span>Save Medical Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
