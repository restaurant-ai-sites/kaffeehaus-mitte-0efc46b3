import { isAdmin, unauthorized } from "../../../../lib/admin";
import { sb, PROJECT_ID } from "../../../../lib/supabase";

// GET: admin mesajları listele
export async function GET(req) {
  if (!isAdmin(req)) return unauthorized();
  const rows = await sb(
    `support_messages?project_id=eq.${PROJECT_ID}&order=created_at.desc&limit=50`
  ).catch(() => []);
  return Response.json({ messages: rows || [] });
}

// POST: restoranın gönderdiği destek mesajı (herkese açık)
export async function POST(req) {
  try {
    const { name, email, message } = await req.json();
    if (!name || !message) return Response.json({ error: "Ad ve mesaj zorunlu." }, { status: 400 });

    await sb(`support_messages`, {
      method: "POST",
      body: JSON.stringify({ project_id: PROJECT_ID, name, email: email || "", message, status: "new" }),
    });

    // Telegram bildirimi (opsiyonel)
    const adminChatId = process.env.ADMIN_TELEGRAM_CHAT_ID;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (botToken && adminChatId) {
      const text = `📩 Yeni destek mesajı!\n\nProje: ${PROJECT_ID}\nGönderen: ${name} (${email || "e-posta yok"})\n\n${message}`;
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: adminChatId, text }),
      }).catch(() => null);
    }

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

// PATCH: mesaj durumunu güncelle (admin)
export async function PATCH(req) {
  if (!isAdmin(req)) return unauthorized();
  const { id, status } = await req.json();
  if (!id || !status) return Response.json({ error: "id ve status gerekli." }, { status: 400 });
  await sb(`support_messages?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return Response.json({ ok: true });
}
