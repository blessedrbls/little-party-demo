/**
 * Little Party Studio — приймає заявки з сайту і пересилає їх у Telegram.
 *
 * Секрети (Cloudflare → Worker → Settings → Variables and Secrets):
 *   TELEGRAM_TOKEN   — токен бота від @BotFather            (тип: Secret)
 *   CHAT_ID          — куди слати: id чату, групи чи каналу  (тип: Secret)
 *   ALLOWED_ORIGINS  — домени сайту через кому, напр.
 *                      https://blessedrbls.github.io       (тип: Text)
 * У коді й у репозиторії токена та chat id немає і бути не повинно.
 */

const MAX_BODY = 8 * 1024; // байт
const DELIVERY = ["Доставка по Троєщині", "Доставка за межі Троєщини", "Самовивіз"];
const CONTACT = ["Подзвонити", "Написати в Telegram", "Написати у Viber"];

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((s) => s.trim().replace(/\/$/, ""))
      .filter(Boolean);
    const originOk = allowed.includes(origin);
    const cors = originOk
      ? {
          "Access-Control-Allow-Origin": origin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
          Vary: "Origin",
        }
      : { Vary: "Origin" };
    const reply = (status, body) =>
      new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...cors } });

    if (request.method === "OPTIONS") return new Response(null, { status: originOk ? 204 : 403, headers: cors });
    if (request.method !== "POST") return reply(405, { ok: false, error: "method" });
    if (!originOk) return reply(403, { ok: false, error: "origin" });
    if (!env.TELEGRAM_TOKEN || !env.CHAT_ID) return reply(500, { ok: false, error: "config" });

    // Обмеження розміру: і за заголовком, і за фактичним тілом
    const declared = Number(request.headers.get("Content-Length") || 0);
    if (declared > MAX_BODY) return reply(413, { ok: false, error: "too_large" });
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > MAX_BODY) return reply(413, { ok: false, error: "too_large" });

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return reply(400, { ok: false, error: "json" });
    }

    // Пастка для ботів: людина це поле не бачить і не заповнює
    if (data && typeof data.website === "string" && data.website.trim()) return reply(200, { ok: true });

    const order = validate(data);
    if (!order.ok) return reply(422, { ok: false, error: order.error });

    const tg = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.CHAT_ID,
        text: format(order.value),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    if (!tg.ok) return reply(502, { ok: false, error: "telegram" });
    return reply(200, { ok: true });
  },
};

const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function validate(d) {
  if (!d || typeof d !== "object") return { ok: false, error: "body" };
  const name = str(d.name, 60);
  const phone = str(d.phone, 30);
  const digits = phone.replace(/\D/g, "");
  const date = str(d.date, 10);
  const time = str(d.time, 20);
  const delivery = str(d.delivery, 40);
  const contact = str(d.contact, 40);
  const address = str(d.address, 200);
  const comment = str(d.comment, 1000);
  const total = str(d.total, 40);
  const items = Array.isArray(d.items) ? d.items.slice(0, 40).map((i) => str(i, 300)).filter(Boolean) : [];

  if (name.length < 2) return { ok: false, error: "name" };
  if (digits.length < 10 || digits.length > 13) return { ok: false, error: "phone" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { ok: false, error: "date" };
  if (time && !/^(\d{2}:\d{2}|будь-який)$/.test(time)) return { ok: false, error: "time" };
  if (!DELIVERY.includes(delivery)) return { ok: false, error: "delivery" };
  if (contact && !CONTACT.includes(contact)) return { ok: false, error: "contact" };
  if (delivery !== "Самовивіз" && address.length < 3) return { ok: false, error: "address" };
  if (!items.length) return { ok: false, error: "items" };

  return { ok: true, value: { name, phone, contact, date, time, delivery, address, comment, total, items } };
}

const h = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

function format(o) {
  const [y, m, d] = o.date.split("-");
  const lines = [
    "🎈 <b>Нова заявка з сайту</b>",
    "",
    "<b>Склад:</b>",
    ...o.items.map((i) => `• ${h(i)}`),
    `<b>Сума:</b> ${h(o.total || "—")}`,
    "",
    `<b>Ім'я:</b> ${h(o.name)}`,
    `<b>Телефон:</b> ${h(o.phone)}`,
    `<b>Зв'язок:</b> ${h(o.contact || "—")}`,
    `<b>Дата:</b> ${d}.${m}.${y}`,
    `<b>Час:</b> ${h(o.time || "будь-який")}`,
    `<b>Отримання:</b> ${h(o.delivery)}`,
    `<b>Адреса:</b> ${h(o.address || "—")}`,
  ];
  if (o.comment) lines.push(`<b>Коментар:</b> ${h(o.comment)}`);
  const text = lines.join("\n");
  return text.length > 4000 ? `${text.slice(0, 3990)}…` : text; // ліміт Telegram — 4096 символів
}
