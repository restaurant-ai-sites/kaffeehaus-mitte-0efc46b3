import { isAdmin, unauthorized } from "../../../../lib/admin";
import { sb, PROJECT_ID } from "../../../../lib/supabase";

export async function GET(req) {
  if (!isAdmin(req)) return unauthorized();
  const rows = await sb(`restaurant_projects?project_id=eq.${PROJECT_ID}&select=extracted_info`).catch(() => []);
  const info = rows?.[0]?.extracted_info || {};
  return Response.json({
    phone: info.phone || "",
    email: info.email || "",
    address: info.address || "",
    opening_hours: info.opening_hours || {},
  });
}

export async function POST(req) {
  if (!isAdmin(req)) return unauthorized();
  const { phone, email, address, opening_hours } = await req.json().catch(() => ({}));
  const rows = await sb(`restaurant_projects?project_id=eq.${PROJECT_ID}&select=extracted_info`).catch(() => []);
  const current = rows?.[0]?.extracted_info || {};
  const updated = { ...current, phone: phone || "", email: email || "", address: address || "", opening_hours: opening_hours || {} };
  await sb(`restaurant_projects?project_id=eq.${PROJECT_ID}`, {
    method: "PATCH",
    body: JSON.stringify({ extracted_info: updated }),
  });
  return Response.json({ ok: true });
}
