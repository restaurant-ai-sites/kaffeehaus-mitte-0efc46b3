import { isAdmin, unauthorized } from "../../../../lib/admin";
import { sb, uploadToStorage, PROJECT_ID } from "../../../../lib/supabase";

export async function GET(req) {
  if (!isAdmin(req)) return unauthorized();
  const rows = await sb(`site_images?project_id=eq.${PROJECT_ID}&select=image_key,url`).catch(() => []);
  const images = {};
  (rows || []).forEach((r) => { images[r.image_key] = r.url; });
  return Response.json({ images });
}

export async function POST(req) {
  if (!isAdmin(req)) return unauthorized();
  try {
    const formData = await req.formData();
    const imageKey = formData.get("key");
    const file = formData.get("file");

    if (!imageKey || !file) return Response.json({ error: "key ve file gerekli." }, { status: 400 });

    const ext = file.name?.split(".").pop() || "jpg";
    const path = `${PROJECT_ID}/${imageKey}-${Date.now()}.${ext}`;
    const url = await uploadToStorage("site-images", path, file);

    await sb(`site_images`, {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({ project_id: PROJECT_ID, image_key: imageKey, url, updated_at: new Date().toISOString() }),
    });

    return Response.json({ ok: true, url });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  if (!isAdmin(req)) return unauthorized();
  const { searchParams } = new URL(req.url);
  const imageKey = searchParams.get("key");
  if (!imageKey) return Response.json({ error: "key gerekli." }, { status: 400 });
  await sb(`site_images?project_id=eq.${PROJECT_ID}&image_key=eq.${imageKey}`, { method: "DELETE" });
  return Response.json({ ok: true });
}
