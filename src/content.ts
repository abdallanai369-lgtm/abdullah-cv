import { createClient } from '@supabase/supabase-js';
import { freshDefaultCV } from './cv';
import type { CVData } from './cv';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

export const cloudConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabase = cloudConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

const LOCAL_KEY = 'abdullah-cv-local-content-v1';

export function normalizeCV(value: unknown): CVData {
  const fallback = freshDefaultCV();
  if (!value || typeof value !== 'object') return fallback;

  const candidate = value as Partial<CVData>;
  return {
    ...fallback,
    ...candidate,
    profile: { ...fallback.profile, ...(candidate.profile ?? {}) },
    skills: Array.isArray(candidate.skills) ? candidate.skills : fallback.skills,
    technologies: Array.isArray(candidate.technologies) ? candidate.technologies : fallback.technologies,
    projects: Array.isArray(candidate.projects) ? candidate.projects : fallback.projects,
    workEnvironment: Array.isArray(candidate.workEnvironment) ? candidate.workEnvironment : fallback.workEnvironment,
    targetFields: Array.isArray(candidate.targetFields) ? candidate.targetFields : fallback.targetFields,
  };
}

export function loadLocalCV(): CVData {
  try {
    const saved = localStorage.getItem(LOCAL_KEY);
    return saved ? normalizeCV(JSON.parse(saved)) : freshDefaultCV();
  } catch {
    return freshDefaultCV();
  }
}

export function saveLocalCV(content: CVData): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(content));
}

export function clearLocalCV(): void {
  localStorage.removeItem(LOCAL_KEY);
}

export async function loadCloudCV(): Promise<CVData> {
  if (!supabase) return loadLocalCV();

  const { data, error } = await supabase
    .from('cv_content')
    .select('content')
    .eq('id', 'main')
    .maybeSingle();

  if (error) throw error;
  return data?.content ? normalizeCV(data.content) : freshDefaultCV();
}

export async function saveCloudCV(content: CVData): Promise<void> {
  if (!supabase) throw new Error('لم يتم إعداد الحفظ السحابي.');

  const { error } = await supabase.from('cv_content').upsert({
    id: 'main',
    content,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}

export async function loadPublicCV(): Promise<CVData> {
  if (!cloudConfigured) return loadLocalCV();

  try {
    return await loadCloudCV();
  } catch {
    return freshDefaultCV();
  }
}
