
// Client-side Multi-Tenancy & Authorization Header Helper
export function getActiveUserId(): string | null {
  try {
    const raw = localStorage.getItem('fitness-wellness-storage');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state?.user?.id) {
        return parsed.state.user.id;
      }
    }
  } catch (e) {
    // Ignore storage parse issues
  }
  return null;
}

export function getClientAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const uid = getActiveUserId();
  if (uid) {
    headers['x-user-id'] = uid;
  }
  return headers;
}

import { DayHistorySnippet, DayNutritionSummary, FoodLogEntry, HealthCondition, MedicinePhoto, UserProfile, VisionAIAnalysisResult } from '../types';

export async function fetchHealthCheck(): Promise<{ status: string; serverTime: string; currentDate: string }> {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Backend health check failed');
  return res.json();
}

export async function fetchNutritionForDay(date: string): Promise<DayNutritionSummary> {
  const uid = getActiveUserId();
  const res = await fetch(`/api/nutrition/day?date=${encodeURIComponent(date)}${uid ? `&userId=${encodeURIComponent(uid)}` : ''}`, { headers: getClientAuthHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch nutrition for ${date}`);
  return res.json();
}

export async function fetchNutritionHistory(days = 14): Promise<Record<string, DayHistorySnippet>> {
  const uid = getActiveUserId();
  const res = await fetch(`/api/nutrition/history?days=${days}${uid ? `&userId=${encodeURIComponent(uid)}` : ''}`, { headers: getClientAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch nutrition history');
  const data = await res.json();
  return data.history || {};
}

export async function apiAddFoodLog(entry: {
  date: string;
  food_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  key_micros: any;
  meal_type: string;
  image_url?: string;
  ai_confidence?: number;
  serving_size?: string;
  dietary_notes?: string[];
  health_compatibility?: any;
  components?: any[];
  nutritional_background?: any;
  ai_engine_used?: string;
}): Promise<FoodLogEntry> {
  const res = await fetch('/api/nutrition/food-log', {
    method: 'POST',
    headers: getClientAuthHeaders(),
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error('Failed to save food log to backend');
  const data = await res.json();
  return data.log;
}

export async function apiDeleteFoodLog(id: string): Promise<boolean> {
  const res = await fetch(`/api/nutrition/food-log/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete food log from backend');
  const data = await res.json();
  return !!data.success;
}

export async function apiLogWater(
  date: string,
  amountMl: number,
  mode: 'add' | 'set' | 'reset' = 'add'
): Promise<number> {
  const res = await fetch('/api/nutrition/water', {
    method: 'POST',
    headers: getClientAuthHeaders(),
    body: JSON.stringify({ date, amountMl, mode }),
  });
  if (!res.ok) throw new Error('Failed to update water on backend');
  const data = await res.json();
  return data.waterIntakeMl || 0;
}

export async function apiAnalyzeFoodVision(
  imageBase64: string,
  mimeType = 'image/jpeg',
  dishHint?: string,
  healthContext?: {
    health_conditions?: string[];
    health_description?: string;
    medicines?: string[];
  }
): Promise<VisionAIAnalysisResult> {
  const res = await fetch('/api/ai/vision', {
    method: 'POST',
    headers: getClientAuthHeaders(),
    body: JSON.stringify({
      imageBase64,
      mimeType,
      dishHint,
      health_conditions: healthContext?.health_conditions,
      health_description: healthContext?.health_description,
      medicines: healthContext?.medicines,
    }),
  });
  if (!res.ok) throw new Error('Failed to analyze food with Vision AI');
  const json = await res.json();
  return json.data;
}

export async function apiAnalyzeFoodNutrition(
  dishName: string,
  healthContext?: {
    health_conditions?: string[];
    health_description?: string;
    medicines?: string[];
  }
): Promise<VisionAIAnalysisResult> {
  const res = await fetch('/api/ai/nutrition-analysis', {
    method: 'POST',
    headers: getClientAuthHeaders(),
    body: JSON.stringify({
      dishName,
      health_conditions: healthContext?.health_conditions,
      health_description: healthContext?.health_description,
      medicines: healthContext?.medicines,
    }),
  });
  if (!res.ok) throw new Error('Failed to analyze food nutrition background');
  const json = await res.json();
  return json.data;
}

export async function apiCheckAiStatus(): Promise<{
  success: boolean;
  backend_connected: boolean;
  nvidia_connected: boolean;
  nvidia_key_configured: boolean;
  nvidia_model: string;
  gemini_available: boolean;
}> {
  try {
    const res = await fetch('/api/ai/status');
    if (!res.ok) {
      return {
        success: false,
        backend_connected: false,
        nvidia_connected: false,
        nvidia_key_configured: false,
        nvidia_model: '',
        gemini_available: false,
      };
    }
    return await res.json();
  } catch {
    return {
      success: false,
      backend_connected: false,
      nvidia_connected: false,
      nvidia_key_configured: false,
      nvidia_model: '',
      gemini_available: false,
    };
  }
}

export async function apiSyncProfile(user: UserProfile): Promise<void> {
  await fetch('/api/user/profile', {
    method: 'POST',
    headers: getClientAuthHeaders(),
    body: JSON.stringify({ user }),
  });
}

export async function apiFetchProfile(): Promise<UserProfile | null> {
  try {
    const res = await fetch('/api/user/profile', { headers: getClientAuthHeaders() });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

export async function apiRecalibrateProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    const res = await fetch('/api/user/update-biometric', {
      method: 'POST',
      headers: getClientAuthHeaders(),
      body: JSON.stringify({ updates }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

export const apiUpdateBiometricProfile = apiRecalibrateProfile;

export async function apiUpdateMedicalProfile(data: {
  health_conditions?: HealthCondition[];
  health_description?: string;
  medicines?: string[];
  medicine_photos?: MedicinePhoto[];
}): Promise<UserProfile | null> {
  try {
    const res = await fetch('/api/user/medical-profile', {
      method: 'POST',
      headers: getClientAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.user || null;
  } catch {
    return null;
  }
}

export async function apiScanMedicine(
  imageBase64: string,
  mimeType?: string
): Promise<{
  medicine_name: string;
  active_ingredient?: string;
  dosage?: string;
  indication?: string;
  dietary_precaution?: string;
} | null> {
  try {
    const res = await fetch('/api/ai/scan-medicine', {
      method: 'POST',
      headers: getClientAuthHeaders(),
      body: JSON.stringify({ imageBase64, mimeType }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export async function apiUpdateAvatar(avatar_url: string | null): Promise<UserProfile | null> {
  try {
    const res = await fetch('/api/user/avatar', {
      method: 'POST',
      headers: getClientAuthHeaders(),
      body: JSON.stringify({ avatar_url }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

export async function apiFetchAccounts(): Promise<{ accounts: UserProfile[]; activeUserId: string | null }> {
  try {
    const res = await fetch('/api/auth/accounts', { headers: getClientAuthHeaders() });
    if (!res.ok) return { accounts: [], activeUserId: null };
    const data = await res.json();
    return {
      accounts: data.accounts || [],
      activeUserId: data.activeUserId || null,
    };
  } catch {
    return { accounts: [], activeUserId: null };
  }
}

export async function apiLogin(params: {
  userId?: string;
  emailOrPhone?: string;
}): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: getClientAuthHeaders(),
      body: JSON.stringify(params),
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, message: err?.message || 'Login network error' };
  }
}

export async function apiLogout(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getClientAuthHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiDeleteAccount(userId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/delete-account', {
      method: 'POST',
      headers: getClientAuthHeaders(),
      body: JSON.stringify({ userId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
