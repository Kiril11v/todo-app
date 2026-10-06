import { supabase } from "../supabaseClient";

export async function ensureSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
    }
}