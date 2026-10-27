import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kzemjiijodshsryvhsmj.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = supabaseUrl && supabaseAnonKey && !supabaseAnonKey.includes("placeholder")
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const STORAGE_KEY = "revid_ai_projects_v2";

// Helper to get all projects (from Supabase if configured, otherwise localStorage)
export async function getProjects() {
  if (typeof window === "undefined") return [];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("video_projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn("Supabase fetch error, falling back to local storage:", err);
    }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Helper to save or update a project
export async function saveProject(project) {
  if (typeof window === "undefined") return project;

  const projectToSave = {
    ...project,
    updated_at: new Date().toISOString(),
    created_at: project.created_at || new Date().toISOString(),
  };

  // Always update local storage for instant offline capability
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    const index = existing.findIndex((p) => p.id === projectToSave.id);
    let updated;
    if (index >= 0) {
      updated = [...existing];
      updated[index] = projectToSave;
    } else {
      updated = [projectToSave, ...existing];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Local storage error:", err);
  }

  // Sync to Supabase if connected
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("video_projects")
        .upsert(projectToSave)
        .select()
        .single();
      if (!error && data) return data;
    } catch (err) {
      console.warn("Supabase upsert error, local copy saved:", err);
    }
  }

  return projectToSave;
}

// Helper to delete project
export async function deleteProject(id) {
  if (typeof window === "undefined") return;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const existing = JSON.parse(raw);
      const filtered = existing.filter((p) => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    }
  } catch (err) {
    console.error("Local storage delete error:", err);
  }

  if (supabase) {
    try {
      await supabase.from("video_projects").delete().eq("id", id);
    } catch (err) {
      console.warn("Supabase delete error:", err);
    }
  }
}
