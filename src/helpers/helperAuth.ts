import { supabase } from "../supabaseClient";

export async function ensureSession(): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) return;

  if (!session) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
  }
}
