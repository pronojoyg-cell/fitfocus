import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Image as ImageIcon, Sparkles, Upload, X, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFitnessStore } from '../../store/useFitnessStore';
import { analyzeMealImage, CURATED_FOOD_DATABASE } from '../../lib/visionAi';
import { MealCategory } from '../../types';

export function AIVisionFABModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealCategory>('lunch');
  const [customDishPrompt, setCustomDishPrompt] = useState('');

  const addFoodLog = useFitnessStore((s) => s.addFoodLog);
  const setAILoggingLoading = useFitnessStore((s) => s.setAILoggingLoading);
  const isAILoggingLoading = useFitnessStore((s) => s.isAILoggingLoading);
  const setActiveFoodReport = useFitnessStore((s) => s.setActiveFoodReport);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleProcessImage = async (fileOrUrl: File | string, hintText?: string) => {
    setIsOpen(false);
    setAILoggingLoading(true);

    try {
      const result = await analyzeMealImage(fileOrUrl, hintText);
      const savedLog = await addFoodLog({
        food_name: result.food_name,
        meal_type: selectedMealType,
        calories: result.calories,
        protein_g: result.protein_g,
        carbs_g: result.carbs_g,
        fats_g: result.fats_g,
        key_micros: result.key_micros,
        image_url: result.image_url,
        ai_confidence: result.confidence_score,
        serving_size: result.serving_size,
        dietary_notes: result.dietary_notes,
        health_compatibility: result.health_compatibility,
        components: result.components,
        nutritional_background: result.nutritional_background,
        ai_engine_used: result.ai_engine_used || 'AI Vision Engine',
      });

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10B981', '#0F172A'],
      });

      if (savedLog) {
        setActiveFoodReport(savedLog);
      }
    } catch (err) {
      console.error('Vision AI error', err);
    } finally {
      setAILoggingLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessImage(file, customDishPrompt);
    }
  };

  const mealTypes: { id: MealCategory; label: string }[] = [
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'dinner', label: 'Dinner' },
    { id: 'snack', label: 'Snack' },
  ];

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          type="button"
          id="ai-vision-fab-btn"
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all border border-slate-700/50 cursor-pointer"
        >
          <div className="relative">
            <Camera className="w-5 h-5 text-emerald-400" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
          <span className="font-semibold text-sm tracking-tight pr-0.5">
            Log Meal with AI
          </span>
        </motion.button>
      </div>

      {/* Hidden File Inputs for Device Camera and Gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Modal / Sheet */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 tracking-tight">
                      AI Vision Food Logger
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Photo recognition & nutrition breakdown
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Meal Category Pills */}
              <div className="mb-5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                  Meal Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {mealTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedMealType(type.id)}
                      className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        selectedMealType === type.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Capture Actions */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {/* Take Photo Button */}
                <button
                  type="button"
                  id="camera-capture-trigger"
                  onClick={() => cameraInputRef.current?.click()}
                  className="p-4 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50 flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">Take Photo</span>
                    <span className="text-[11px] text-slate-500">Device Camera</span>
                  </div>
                </button>

                {/* Upload Photo Button */}
                <button
                  type="button"
                  id="gallery-upload-trigger"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-full bg-slate-800 text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">Upload Image</span>
                    <span className="text-[11px] text-slate-500">From Photo Library</span>
                  </div>
                </button>
              </div>

              {/* Optional Hint Input */}
              <div className="mb-6">
                <input
                  type="text"
                  value={customDishPrompt}
                  onChange={(e) => setCustomDishPrompt(e.target.value)}
                  placeholder="Optional dish hint (e.g. 2 eggs on sourdough, 1 bowl yogurt)..."
                  className="w-full text-xs py-2.5 px-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800 text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* Quick Preset Culinary Photos for Instant Testing */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Or Tap a Sample Culinary Snap
                  </span>
                  <span className="text-[11px] text-emerald-600 font-medium">Instant AI Log</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {CURATED_FOOD_DATABASE.slice(0, 4).map((item) => (
                    <button
                      key={item.food_name}
                      type="button"
                      onClick={() => handleProcessImage(item.image_url, item.food_name)}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20 text-left transition-all flex items-center gap-2.5 cursor-pointer group"
                    >
                      <img
                        src={item.image_url}
                        alt={item.food_name}
                        className="w-11 h-11 rounded-lg object-cover group-hover:scale-105 transition-transform shrink-0"
                      />
                      <div className="overflow-hidden">
                        <span className="text-xs font-semibold text-slate-900 truncate block">
                          {item.food_name.split(' with ')[0]}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {item.calories} kcal • {item.protein_g}g P
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
