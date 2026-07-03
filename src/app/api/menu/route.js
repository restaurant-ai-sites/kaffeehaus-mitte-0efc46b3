import { sb, PROJECT_ID } from "../../../lib/supabase";

export async function GET() {
  try {
    const [sections, items, imgs] = await Promise.all([
      sb(`menu_sections?project_id=eq.${PROJECT_ID}&select=id,name`).catch(() => []),
      sb(`menu_items?project_id=eq.${PROJECT_ID}&select=id,section_id,name,description,price`).catch(() => []),
      sb(`site_images?project_id=eq.${PROJECT_ID}&image_key=eq.speisekarte&select=url`).catch(() => []),
    ]);
    const sectionList = (sections || []).map((s) => ({
      ...s,
      items: (items || []).filter((i) => i.section_id === s.id),
    }));
    return Response.json({
      sections: sectionList,
      speisekarte: imgs?.[0]?.url || null,
    });
  } catch (e) {
    return Response.json({ sections: [], speisekarte: null, error: e.message });
  }
}
