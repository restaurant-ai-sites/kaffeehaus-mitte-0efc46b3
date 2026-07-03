import { isAdmin, unauthorized } from "../../../../lib/admin";
import { sb, PROJECT_ID } from "../../../../lib/supabase";

export async function GET(req) {
  if (!isAdmin(req)) return unauthorized();
  try {
    const sections = await sb(
      `menu_sections?project_id=eq.${PROJECT_ID}&select=id,name`
    ).catch(() => []);
    const items = await sb(
      `menu_items?project_id=eq.${PROJECT_ID}&select=id,section_id,name,description,price`
    ).catch(() => []);
    const sectionList = (sections || []).map((s) => ({
      ...s,
      items: (items || []).filter((i) => i.section_id === s.id),
    }));
    return Response.json({ sections: sectionList });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  if (!isAdmin(req)) return unauthorized();
  try {
    const body = await req.json();
    const { type } = body;

    if (type === "section") {
      const { name } = body;
      if (!name) return Response.json({ error: "Name erforderlich" }, { status: 400 });
      const rows = await sb("menu_sections", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ project_id: PROJECT_ID, name }),
      });
      return Response.json({ section: rows?.[0] });
    }

    if (type === "item") {
      const { section_id, name, description, price } = body;
      if (!section_id || !name) return Response.json({ error: "section_id und name erforderlich" }, { status: 400 });
      const rows = await sb("menu_items", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ project_id: PROJECT_ID, section_id, name, description: description || null, price: price || null }),
      });
      return Response.json({ item: rows?.[0] });
    }

    return Response.json({ error: "Unbekannter Typ" }, { status: 400 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  if (!isAdmin(req)) return unauthorized();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const type = searchParams.get("type");
  if (!id || !type) return Response.json({ error: "id und type erforderlich" }, { status: 400 });
  try {
    if (type === "section") {
      await sb(`menu_items?section_id=eq.${id}`, { method: "DELETE" }).catch(() => null);
      await sb(`menu_sections?id=eq.${id}`, { method: "DELETE" });
    } else if (type === "item") {
      await sb(`menu_items?id=eq.${id}`, { method: "DELETE" });
    }
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
