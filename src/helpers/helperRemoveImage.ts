import { supabase } from "../supabaseClient";

function getStoragePathFromPublicUrl(
  publicUrl: string,
  bucket: string,
): string | null {
  const marker = `/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  const raw = publicUrl.slice(idx + marker.length).split("?")[0];
  return decodeURIComponent(raw);
}

export async function removeTaskImages(
  rows: { image_url?: string | null }[] | null,
) {
  const paths = (rows ?? []).flatMap((r) => {
    if (!r.image_url) return [];
    const path = getStoragePathFromPublicUrl(r.image_url, "task-images");
    return path ? [path] : [];
  });

  if (!paths.length) return;

  const { error } = await supabase.storage.from("task-images").remove(paths);
  if (error) console.error("Failed to delete task images:", error);
}
