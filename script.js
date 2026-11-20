(() => {
  "use strict";

  /* ---------- Налаштування ----------
   * WORKER_URL — адреса Cloudflare Worker, який пересилає заявки в Telegram (див. worker/README.md).
   *   Порожньо — форма працює в демо-режимі й нічого не надсилає.
   * SHEET_URL — посилання на опубліковану Google Таблицю у форматі CSV (див. README.md).
   *   Порожньо — ціни й набори беруться з data.js.
   */
  const WORKER_URL = "";
  const SHEET_URL = "";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const money = (n) => `${n.toLocaleString("uk-UA")} грн`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const prettyPhone = (p) => p.replace(/^\+380(\d{2})(\d{3})(\d{2})(\d{2})$/, "+380 $1 $2 $3 $4");
  const MAX_QTY = 99;
  const MAX_TEXT = 120;

  function plural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  /* ---------- Контакти з data.js ---------- */
  function initContacts() {
    $$("[data-phone-link]").forEach((a) => (a.href = `tel:${SHOP.phones[+a.dataset.phoneLink]}`));
    $$("[data-phone-text]").forEach((el) => (el.textContent = prettyPhone(SHOP.phones[+el.dataset.phoneText])));
    $("#phones").innerHTML = SHOP.phones.map((p) => `<li><a href="tel:${p}">${prettyPhone(p)}</a></li>`).join("");
    const insta = $("#insta");
    insta.href = `https://instagram.com/${SHOP.instagram}`;
    $("span", insta).textContent = `@${SHOP.instagram}`;
    const viber = `viber://chat?number=${encodeURIComponent(SHOP.messengerPhone)}`;
    const telegram = `https://t.me/${SHOP.messengerPhone}`;
    $$("[data-viber]").forEach((a) => (a.href = viber));
    $$("[data-telegram]").forEach((a) => (a.href = telegram));
    $$("[data-pickup]").forEach((el) => (el.textContent = SHOP.pickupAddress));
    $$("[data-free-from]").forEach((el) => (el.textContent = money(SHOP.freeDeliveryFrom)));
    $("#year").textContent = new Date().getFullYear();
  }

  /* ---------- Готові набори ---------- */
  let activeCat = "all";
  const findSet = (id) => SHOP.sets.find((s) => s.id === id);
  const setPrice = (s) => (s.price ? `від ${money(s.price)}` : SHOP.setPriceLabel);

  function renderTabs() {
    $("#set-tabs").innerHTML = SHOP.categories
      .map((c) => {
        const count = c.id === "all" ? SHOP.sets.length : SHOP.sets.filter((s) => s.categories.includes(c.id)).length;
        return `<button class="tab" role="tab" type="button" data-cat="${c.id}" aria-selected="${c.id === activeCat}">${esc(c.label)}<span class="tab__count">${count}</span></button>`;
      })
      .join("");
  }

  function renderSets() {
    const list = SHOP.sets.filter((s) => activeCat === "all" || s.categories.includes(activeCat));
    $("#sets-grid").innerHTML = list
      .map(
        (s, i) => `
      <article class="set-card" style="animation-delay:${Math.min(i, 8) * 40}ms">
        <button class="set-card__photo" type="button" data-zoom="${esc(s.id)}" aria-label="Збільшити фото: ${esc(s.title)}">
          <img src="${esc(s.image)}" alt="${esc(s.title)}" loading="lazy" decoding="async" width="980" height="1400">
          <span class="set-card__zoom" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5M11 8v6M8 11h6"/></svg></span>
        </button>
        <div class="set-card__body">
          <h3 class="set-card__title">${esc(s.title)}</h3>
          <p class="set-card__price">${esc(setPrice(s))}</p>
          <div class="set-card__actions">
            <button class="btn btn--primary" type="button" data-order="${esc(s.id)}">Замовити</button>
            <button class="btn btn--soft" type="button" data-similar="${esc(s.id)}">Зібрати схожий</button>
          </div>
        </div>
      </article>`
      )
      .join("");
  }

  function initSets() {
    renderTabs();
    renderSets();

    $("#set-tabs").addEventListener("click", (e) => {
      const tab = e.target.closest("[data-cat]");
      if (!tab || tab.dataset.cat === activeCat) return;
      activeCat = tab.dataset.cat;
      $$(".tab").forEach((t) => t.setAttribute("aria-selected", t === tab));
      tab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      renderSets();
    });

    $("#sets-grid").addEventListener("click", (e) => {
      const zoom = e.target.closest("[data-zoom]");
      const order = e.target.closest("[data-order]");
      const similar = e.target.closest("[data-similar]");
      if (zoom) openLightbox(findSet(zoom.dataset.zoom));
      if (order) {
        const s = findSet(order.dataset.order);
        openOrder({
          items: [`Готовий набір: ${s.title}${s.price ? ` (від ${money(s.price)})` : ""}`],
          total: setPrice(s),
          totalValue: s.price || 0,
          note: s.price ? "Менеджер підтвердить точну суму і кольори" : "Менеджер уточнить вартість і кольори",
        });
      }
      if (similar) startSimilar(findSet(similar.dataset.similar));
    });
  }

  /* ---------- Лайтбокс ---------- */
  function openLightbox(set) {
    const img = $("#lightbox-img");
    img.src = set.image;
    img.alt = set.title;
    $("#lightbox-caption").textContent = set.title;
    $("#lightbox").showModal();
  }

  /* ---------- Конструктор ---------- */
  const state = {
    occasion: "birthday",
    latex: {}, // qty для типів без палітри
    colors: {}, // { plain: { "01": 2 } } для типів з палітрою
    foil: {},
    bubbles: {},
    text: {}, // { "latex:print": "...", "bubbles:feather": "..." }
    open: {}, // які палітри розгорнуті
    digits: "",
    size: SHOP.numberSizes[0].id,
    ref: null,
  };

  // Додає в state ключі для нових позицій (після підвантаження з таблиці)
  function ensureState() {
    SHOP.latex.forEach((x) => {
      if (x.palette) state.colors[x.id] = state.colors[x.id] || {};
      else state.latex[x.id] = state.latex[x.id] || 0;
    });
    SHOP.foil.forEach((x) => (state.foil[x.id] = state.foil[x.id] || 0));
    SHOP.bubbles.forEach((x) => (state.bubbles[x.id] = state.bubbles[x.id] || 0));
    if (!SHOP.numberSizes.some((s) => s.id === state.size)) state.size = SHOP.numberSizes[0].id;
  }

  const groupItems = (group) => SHOP[group];
  const findItem = (group, id) => groupItems(group).find((x) => x.id === id);
  const palette = (x) => (x.palette && SHOP.colors[x.palette]) || null;
  const colorQty = (id) => Object.values(state.colors[id] || {}).reduce((a, b) => a + b, 0);
  const qtyOf = (group, x) => (group === "latex" && palette(x) ? colorQty(x.id) : state[group][x.id] || 0);
  const swatchSrc = (pal, c) => `colors/${pal.folder}/sm/${c.id}.jpg`;

  const icons = {
    heart: `<svg viewBox="0 0 40 40"><defs><linearGradient id="gH" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbe2f3"/><stop offset=".5" stop-color="#e58fd0"/><stop offset="1" stop-color="#b54aa6"/></linearGradient></defs><path d="M20 34S5 25 5 14.5C5 9.8 8.6 6.5 12.6 6.5c3 0 5.6 1.8 7.4 4.4 1.8-2.6 4.4-4.4 7.4-4.4 4 0 7.6 3.3 7.6 8C35 25 20 34 20 34z" fill="url(#gH)"/><path d="M10 12c1-2.4 3-3 4.5-2.6" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".8"/></svg>`,
    printed: `<svg viewBox="0 0 40 40"><defs><linearGradient id="gP" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eefbfc"/><stop offset=".55" stop-color="#9fdfe6"/><stop offset="1" stop-color="#3fb3c4"/></linearGradient></defs><circle cx="20" cy="19" r="15" fill="url(#gP)"/><path d="m20 11 2.4 5 5.4.7-4 3.7 1 5.3-4.8-2.6-4.8 2.6 1-5.3-4-3.7 5.4-.7z" fill="#8a4fd6"/><path d="M10 14c1.4-3 4-4.4 6-4.4" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`,
    figure: `<svg viewBox="0 0 40 40"><defs><linearGradient id="gF" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#efe3ff"/><stop offset=".5" stop-color="#a67be6"/><stop offset="1" stop-color="#6a3bb0"/></linearGradient></defs><path d="M20 20c-3-4-9-8-13-6s-2 10 2 11 8-2 11-5zm0 0c3-4 9-8 13-6s2 10-2 11-8-2-11-5z" fill="url(#gF)"/><path d="m17 22-4 12 4-2 2 3 1-13zm6 0 4 12-4-2-2 3-1-13z" fill="url(#gF)"/><circle cx="20" cy="20" r="3.4" fill="#5a2f9c"/></svg>`,
    bubble: `<svg viewBox="0 0 40 40"><circle cx="20" cy="18" r="14" fill="rgba(220,235,250,.55)" stroke="#b9cfe6" stroke-width="1.2"/><path d="M13 25c2-3 4-3 5-1m3 2c1-3 4-4 6-2m-12-4c1-2 3-2 4 0" stroke="#e57cc8" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M12 12c1.6-2.6 4-3.6 6-3.4" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M20 32v6" stroke="#b9cfe6" stroke-width="1.2"/></svg>`,
    mirror: `<svg viewBox="0 0 40 40"><defs><linearGradient id="gM" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#cfd4dc"/><stop offset="1" stop-color="#8d95a3"/></linearGradient></defs><circle cx="20" cy="18" r="14" fill="url(#gM)"/><path d="M8 18h24M20 4v28M10 10h20M10 26h20" stroke="#fff" stroke-width=".8" opacity=".7"/><path d="M12 11c1.6-2.6 4-3.6 6-3.4" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M20 32v6" stroke="#8d95a3" stroke-width="1.2"/></svg>`,
  };

  const priceLabel = (x) => (x.from ? `від ${x.price} грн / шт.` : `${x.price} грн / шт.`);

  function stepperHtml(name, qty, attrs) {
    return `
      <div class="stepper">
        <button type="button" ${attrs} data-delta="-1" aria-label="Менше: ${esc(name)}" ${qty <= 0 ? "disabled" : ""}>−</button>
        <output aria-live="polite">${qty}</output>
        <button type="button" ${attrs} data-delta="1" aria-label="Більше: ${esc(name)}" ${qty >= MAX_QTY ? "disabled" : ""}>+</button>
      </div>`;
  }

  function inscriptionHtml(group, x, qty) {
    if (!x.inscription || qty <= 0) return "";
    const key = `${group}:${x.id}`;
    return `
      <label class="field inscription">
        <span class="field__label">Текст напису</span>
        <input class="input" type="text" maxlength="${MAX_TEXT}" data-text="${esc(key)}" value="${esc(state.text[key] || "")}" placeholder="наприклад, З днем народження, Соня!">
      </label>`;
  }

  function visualHtml(group, x) {
    if (group === "latex") return `<span class="ball ball--${esc(x.swatch || "plain")}" aria-hidden="true">${x.swatch === "print" ? "<span>♥</span>" : ""}</span>`;
    return `<span class="foil-ico" aria-hidden="true">${icons[x.icon] || icons.printed}</span>`;
  }

  function itemHtml(group, x) {
    const pal = group === "latex" ? palette(x) : null;
    const qty = qtyOf(group, x);
    const sub = x.size ? `${esc(x.size)} · ${x.from ? "від " : ""}${x.price} грн` : priceLabel(x);

    if (!pal) {
      return `
      <li class="item${qty > 0 ? " is-active" : ""}" data-group="${group}" data-id="${esc(x.id)}">
        <div class="item__row">
          ${visualHtml(group, x)}
          <div>
            <div class="item__name">${esc(x.name)}</div>
            <div class="item__price">${sub}</div>
          </div>
          ${stepperHtml(x.name, qty, `data-step="${group}:${esc(x.id)}"`)}
        </div>
        ${inscriptionHtml(group, x, qty)}
      </li>`;
    }

    const open = !!state.open[x.id];
    const picked = pal.items.filter((c) => state.colors[x.id][c.id] > 0);
    const badge = qty ? `${qty} шт.` : pal.pick || "Обрати кольори";
    return `
      <li class="item item--palette${qty > 0 ? " is-active" : ""}${open ? " is-open" : ""}" data-group="latex" data-id="${esc(x.id)}">
        <button class="item__row item__toggle" type="button" data-toggle="${esc(x.id)}" aria-expanded="${open}" aria-controls="pal-${esc(x.id)}">
          ${visualHtml(group, x)}
          <span>
            <span class="item__name">${esc(x.name)}</span>
            <span class="item__price">${sub}</span>
          </span>
          <span class="item__badge">${badge}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></span>
        </button>
        <div class="palette" id="pal-${esc(x.id)}" ${open ? "" : "hidden"}>
          <p class="palette__hint">${esc(pal.hint || "Натисніть на колір, щоб додати. Можна кілька.")}</p>
          ${swatchGroupsHtml(x, pal)}
          ${
            picked.length
              ? `<ul class="picked">${picked
                  .map(
                    (c) => `
            <li class="picked__row">
              <span class="picked__dot${c.custom ? " picked__dot--custom" : ""}" style="${c.custom ? "" : `background-image:url('${esc(swatchSrc(pal, c))}');`}--c:${esc(c.hex)}" aria-hidden="true">${c.custom ? "Aa" : ""}</span>
              <span class="picked__name">${esc(c.name)}</span>
              ${stepperHtml(c.name, state.colors[x.id][c.id], `data-cstep="${esc(x.id)}:${esc(c.id)}"`)}
            </li>`
                  )
                  .join("")}</ul>`
              : ""
          }
          ${inscriptionHtml("latex", x, state.colors[x.id].custom || 0)}
        </div>
      </li>`;
  }

  // Плитки палітри; якщо в палітрі є groups — з підзаголовками
  function swatchGroupsHtml(x, pal) {
    const tiles = (list) =>
      list
        .map((c) => {
          const n = state.colors[x.id][c.id] || 0;
          const face = c.custom
            ? `<span class="swatch__custom" aria-hidden="true"><b>Aa</b>${esc(c.name)}</span>`
            : `<img src="${esc(swatchSrc(pal, c))}" alt="" loading="lazy" decoding="async" width="128" height="128">`;
          return `<button class="swatch${c.custom ? " swatch--custom" : ""}" type="button" data-color="${esc(x.id)}:${esc(c.id)}" aria-pressed="${n > 0}" title="${esc(c.name)}" aria-label="${esc(c.name)}${n ? `, ${n} шт.` : ""}" style="--c:${esc(c.hex)}">
                  ${face}
                  ${n ? `<span class="swatch__qty">${n}</span>` : ""}
                </button>`;
        })
        .join("");
    const label = `${pal.label || "Кольори"}: ${x.name}`;
    if (!pal.groups) return `<div class="swatches" role="group" aria-label="${esc(label)}">${tiles(pal.items)}</div>`;
    return pal.groups
      .map((g) => {
        const list = pal.items.filter((c) => c.group === g.id);
        if (!list.length) return "";
        return `
          <div class="swatch-group">
            <p class="swatch-group__title">${esc(g.label)}</p>
            <div class="swatches swatches--tiles" role="group" aria-label="${esc(`${g.label}: ${x.name}`)}">${tiles(list)}</div>
          </div>`;
      })
      .join("");
  }

  function renderList(group, el) {
    $(el).innerHTML = groupItems(group)
      .map((x) => itemHtml(group, x))
      .join("");
  }

  // Перемальовує одну позицію і повертає фокус на ту саму кнопку
  function refreshItem(group, id, focusSel) {
    const row = $(`.item[data-group="${group}"][data-id="${CSS.escape(id)}"]`);
    if (!row) return;
    const tmp = document.createElement("template");
    tmp.innerHTML = itemHtml(group, findItem(group, id)).trim();
    const fresh = tmp.content.firstElementChild;
    row.replaceWith(fresh);
    if (focusSel) {
      const target = $(focusSel, fresh);
      if (target && !target.disabled) target.focus({ preventScroll: true });
      else $("[data-toggle]", fresh)?.focus({ preventScroll: true });
    }
  }

  function renderBuilder() {
    ensureState();
    $("#occasions").innerHTML = SHOP.occasions
      .map(
        (o) => `
      <label class="occasion">
        <input type="radio" name="occasion" value="${o.id}" ${o.id === state.occasion ? "checked" : ""}>
        <span><span aria-hidden="true">${o.emoji}</span>${esc(o.label)}</span>
      </label>`
      )
      .join("");

    renderList("latex", "#latex-list");
    renderList("foil", "#foil-list");
    renderList("bubbles", "#bubble-list");

    $("#sizes").innerHTML = SHOP.numberSizes
      .map(
        (s) => `
      <label><input type="radio" name="size" value="${s.id}" ${s.id === state.size ? "checked" : ""}><span>${esc(s.label)}<small>${s.price} грн</small></span></label>`
      )
      .join("");
  }

  function calc() {
    const lines = [];
    const textOf = (key) => (state.text[key] || "").trim();
    SHOP.latex.forEach((x) => {
      const pal = palette(x);
      const q = qtyOf("latex", x);
      if (!q) return;
      let detail = "";
      if (pal) {
        detail = pal.items
          .filter((c) => state.colors[x.id][c.id] > 0)
          .map((c) => {
            const t = c.custom ? textOf(`latex:${x.id}`) : "";
            const name = c.custom ? (t ? `напис «${t}»` : "свій напис: уточнити") : c.name;
            return `${name} × ${state.colors[x.id][c.id]}`;
          })
          .join(", ");
      } else if (x.inscription) {
        const t = textOf(`latex:${x.id}`);
        detail = t ? `напис: «${t}»` : "напис / малюнок: уточнити";
      }
      lines.push({ name: `Латексні «${x.name}»`, qty: q, sum: q * x.price, from: !!x.from, detail });
    });
    SHOP.foil.forEach((x) => {
      const q = state.foil[x.id];
      if (q) lines.push({ name: `Фольговані «${x.name}»`, qty: q, sum: q * x.price, from: !!x.from, detail: "" });
    });
    SHOP.bubbles.forEach((x) => {
      const q = state.bubbles[x.id];
      if (!q) return;
      const t = textOf(`bubbles:${x.id}`);
      lines.push({ name: `${x.name}, ${x.size}`, qty: q, sum: q * x.price, from: !!x.from, detail: t ? `напис: «${t}»` : "напис: уточнити" });
    });
    const digitCount = state.digits.length;
    if (digitCount) {
      const size = SHOP.numberSizes.find((s) => s.id === state.size);
      lines.push({ name: `Цифри «${state.digits}», ${size.label}`, qty: digitCount, sum: digitCount * size.price, from: false, detail: "" });
    }
    const total = lines.reduce((a, l) => a + l.sum, 0);
    const hasFrom = lines.some((l) => l.from);
    return { lines, total, hasFrom };
  }

  const lineText = (l) => `${l.name} × ${l.qty} — ${l.from ? "від " : ""}${money(l.sum)}${l.detail ? ` (${l.detail})` : ""}`;
  const occasionLabel = () => SHOP.occasions.find((o) => o.id === state.occasion)?.label || "";

  function updateSummary() {
    const { lines, total, hasFrom } = calc();
    const free = SHOP.freeDeliveryFrom;

    $("#summary-list").innerHTML = lines.length
      ? lines
          .map(
            (l) => `<li><span>${esc(l.name)} × ${l.qty}${l.detail ? `<small>${esc(l.detail)}</small>` : ""}</span><span>${l.from ? "від " : ""}${money(l.sum)}</span></li>`
          )
          .join("")
      : `<li class="is-empty">Поки що порожньо — додайте кульки</li>`;

    $("#summary-total").textContent = `${hasFrom ? "від " : ""}${money(total)}`;

    const delivery = $("#summary-delivery");
    const progress = $(".progress");
    $("#progress-fill").style.width = `${Math.min(100, (total / free) * 100)}%`;
    if (total >= free) {
      delivery.textContent = "Доставка по Троєщині безкоштовна 🎉";
      delivery.classList.add("is-free");
      progress.classList.add("is-full");
    } else {
      delivery.textContent = total
        ? `До безкоштовної доставки по Троєщині ще ${money(free - total)}`
        : `Безкоштовна доставка по Троєщині від ${money(free)}`;
      delivery.classList.remove("is-free");
      progress.classList.remove("is-full");
    }

    $("#summary-note").hidden = !hasFrom;
    $("#builder-order").disabled = total === 0;
  }

  function updateDigits() {
    const size = SHOP.numberSizes.find((s) => s.id === state.size);
    $("#digits-preview").innerHTML = [...state.digits].map((d) => `<span class="digit digit--${size.id}">${d}</span>`).join("");
    const n = state.digits.length;
    $("#digits-hint").textContent = n
      ? `${n} ${plural(n, "цифра", "цифри", "цифр")} × ${size.price} грн = ${money(n * size.price)}`
      : "Кожна цифра рахується окремо";
  }

  function renderRef() {
    const chip = $("#ref-chip");
    if (!state.ref) {
      chip.hidden = true;
      chip.innerHTML = "";
      return;
    }
    chip.hidden = false;
    chip.innerHTML = `
      <img src="${esc(state.ref.image)}" alt="" loading="lazy">
      <div class="ref-chip__text"><small>Збираємо схожий на</small><strong>${esc(state.ref.title)}</strong></div>
      <button type="button" data-ref-clear aria-label="Прибрати зразок">×</button>`;
  }

  function startSimilar(set) {
    state.occasion = set.occasion;
    state.ref = set;
    const radio = $(`input[name="occasion"][value="${set.occasion}"]`);
    if (radio) radio.checked = true;
    renderRef();
    $("#builder").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const clampQty = (n) => Math.max(0, Math.min(MAX_QTY, n));

  function initBuilder() {
    renderBuilder();

    $("#occasions").addEventListener("change", (e) => (state.occasion = e.target.value));

    $(".builder__steps").addEventListener("click", (e) => {
      // Звичайний лічильник: латекс без палітри, фольга, бабли
      const step = e.target.closest("[data-step]");
      if (step) {
        const [group, id] = step.dataset.step.split(":");
        state[group][id] = clampQty((state[group][id] || 0) + Number(step.dataset.delta));
        refreshItem(group, id, `[data-step="${CSS.escape(step.dataset.step)}"][data-delta="${step.dataset.delta}"]`);
        updateSummary();
        return;
      }
      // Розгорнути / згорнути палітру
      const toggle = e.target.closest("[data-toggle]");
      if (toggle) {
        const id = toggle.dataset.toggle;
        state.open[id] = !state.open[id];
        refreshItem("latex", id, `[data-toggle]`);
        return;
      }
      // Тап по кольору: додати 1 шт. (якщо ще не вибраний) або прибрати
      const sw = e.target.closest("[data-color]");
      if (sw) {
        const [id, cid] = sw.dataset.color.split(":");
        const cur = state.colors[id][cid] || 0;
        if (cur > 0) delete state.colors[id][cid];
        else state.colors[id][cid] = 1;
        refreshItem("latex", id, `[data-color="${CSS.escape(sw.dataset.color)}"]`);
        updateSummary();
        return;
      }
      // Кількість конкретного кольору
      const cstep = e.target.closest("[data-cstep]");
      if (cstep) {
        const [id, cid] = cstep.dataset.cstep.split(":");
        const next = clampQty((state.colors[id][cid] || 0) + Number(cstep.dataset.delta));
        if (next) state.colors[id][cid] = next;
        else delete state.colors[id][cid];
        refreshItem("latex", id, next ? `[data-cstep="${CSS.escape(cstep.dataset.cstep)}"][data-delta="${cstep.dataset.delta}"]` : `[data-color="${CSS.escape(cstep.dataset.cstep)}"]`);
        updateSummary();
        return;
      }
      if (e.target.closest("[data-ref-clear]")) {
        state.ref = null;
        renderRef();
      }
    });

    // Текст напису: тільки оновлюємо state, без перемальовування (щоб не губився фокус)
    $(".builder__steps").addEventListener("input", (e) => {
      const key = e.target.dataset.text;
      if (!key) return;
      state.text[key] = e.target.value.slice(0, MAX_TEXT);
      updateSummary();
    });

    const digits = $("#digits");
    digits.addEventListener("input", () => {
      const clean = digits.value.replace(/\D/g, "").slice(0, 4);
      if (clean !== digits.value) digits.value = clean;
      state.digits = clean;
      updateDigits();
      updateSummary();
    });

    $("#sizes").addEventListener("change", (e) => {
      state.size = e.target.value;
      updateDigits();
      updateSummary();
    });

    $("#builder-order").addEventListener("click", () => {
      const { lines, total, hasFrom } = calc();
      if (!total) return;
      const items = [`Привід: ${occasionLabel()}`];
      if (state.ref) items.push(`Схожий на набір: ${state.ref.title}`);
      items.push(...lines.map(lineText));
      openOrder({
        items,
        total: `${hasFrom ? "від " : ""}${money(total)}`,
        totalValue: total,
        note: hasFrom ? "Точну суму підтвердить менеджер." : "",
      });
    });

    updateDigits();
    updateSummary();
  }

  /* ---------- Форма замовлення ---------- */
  const modal = $("#order-modal");
  const form = $("#order-form");
  let currentOrder = null;

  const DELIVERY = {
    troieshchyna: "Доставка по Троєщині",
    outside: "Доставка за межі Троєщини",
    pickup: "Самовивіз",
  };

  function localISO(d = new Date()) {
    const x = new Date(d);
    x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
    return x.toISOString().slice(0, 10);
  }
  const toMin = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  const fromMin = (n) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;

  function renderTimes() {
    const sel = form.time;
    const prev = sel.value;
    const isToday = form.date.value === localISO();
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const opts = [`<option value="">Будь-який час (${SHOP.hours.from}–${SHOP.hours.to})</option>`];
    for (let t = toMin(SHOP.hours.from); t <= toMin(SHOP.hours.to); t += 30) {
      const past = isToday && t < nowMin;
      opts.push(`<option value="${fromMin(t)}" ${past ? "disabled" : ""}>${fromMin(t)}</option>`);
    }
    sel.innerHTML = opts.join("");
    const keep = [...sel.options].find((o) => o.value === prev && !o.disabled);
    sel.value = keep ? prev : "";
  }

  function updateDateHint() {
    const hint = $("#date-hint");
    const isToday = form.date.value && form.date.value === localISO();
    hint.textContent = isToday ? "Замовлення день в день можливе, уточнимо наявність" : "Бажано замовляти за 2–3 дні";
    hint.classList.toggle("is-today", !!isToday);
    renderTimes();
  }

  function updateDelivery() {
    const v = form.delivery.value;
    const needsAddress = v !== "pickup";
    $("#address-field").hidden = !needsAddress;
    form.address.required = needsAddress;
    const hint = $("#delivery-hint");
    const total = currentOrder?.totalValue || 0;
    const free = SHOP.freeDeliveryFrom;
    if (v === "troieshchyna") {
      hint.textContent =
        total >= free ? "Доставка по Троєщині безкоштовна." : `Безкоштовно від ${money(free)}. Інакше вартість доставки уточнить менеджер.`;
    } else if (v === "outside") {
      hint.textContent = "Вартість доставки розраховується за відстанню, менеджер уточнить.";
    } else {
      hint.textContent = "Час, коли забрати, погодимо по телефону.";
    }
  }

  function showPanel(name) {
    form.hidden = name !== "form";
    $("#order-success").hidden = name !== "success";
    $("#order-error").hidden = name !== "error";
    modal.scrollTop = 0;
  }

  function openOrder(order) {
    currentOrder = order;
    $("#order-items").innerHTML = order.items.map((i) => `<li>${esc(i)}</li>`).join("");
    $("#order-total").textContent = order.total;
    $("#order-note").textContent = order.note || "";
    $$(".field.is-invalid", form).forEach((f) => f.classList.remove("is-invalid"));
    form.date.min = localISO();
    updateDateHint();
    updateDelivery();
    showPanel("form");
    modal.showModal();
    modal.scrollTop = 0;
  }

  function validate() {
    let firstBad = null;
    const check = (input, ok) => {
      input.closest(".field").classList.toggle("is-invalid", !ok);
      if (!ok && !firstBad) firstBad = input;
    };
    check(form.name, form.name.value.trim().length >= 2);
    check(form.phone, form.phone.value.replace(/\D/g, "").length >= 10);
    check(form.date, !!form.date.value && form.date.value >= form.date.min);
    if (form.address.required) check(form.address, form.address.value.trim().length >= 3);
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  function payload() {
    const v = form.delivery.value;
    return {
      items: currentOrder.items,
      total: currentOrder.total,
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      date: form.date.value,
      time: form.time.value || "будь-який",
      delivery: DELIVERY[v],
      address: v === "pickup" ? SHOP.pickupAddress : form.address.value.trim(),
      comment: form.comment.value.trim(),
      website: form.website.value, // пастка для ботів, людина це поле не бачить
    };
  }

  async function send(data) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15000);
    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } finally {
      clearTimeout(timer);
    }
  }

  function initOrder() {
    $("#order-demo").hidden = !!WORKER_URL;
    form.addEventListener("change", (e) => {
      if (e.target.name === "delivery") updateDelivery();
      if (e.target.name === "date") updateDateHint();
    });
    form.addEventListener("input", (e) => {
      const field = e.target.closest(".field.is-invalid");
      if (field) field.classList.remove("is-invalid");
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validate()) return;
      const btn = $("button[type=submit]", form);
      if (WORKER_URL) {
        btn.disabled = true;
        btn.textContent = "Надсилаємо…";
        try {
          await send(payload());
        } catch (err) {
          showPanel("error");
          return;
        } finally {
          btn.disabled = false;
          btn.textContent = "Відправити заявку";
        }
      }
      // Без WORKER_URL — демо: дані нікуди не надсилаються
      form.reset();
      updateDelivery();
      showPanel("success");
    });
    $("#order-retry").addEventListener("click", () => showPanel("form"));
    updateDelivery();
  }

  /* ---------- Закриття діалогів ---------- */
  function initDialogs() {
    $$("dialog").forEach((dlg) => {
      dlg.addEventListener("click", (e) => {
        if (e.target === dlg || e.target.closest("[data-close]")) dlg.close();
      });
    });
    // Клік по самому фото в лайтбоксі теж закриває
    $("#lightbox figure").addEventListener("click", () => $("#lightbox").close());
  }

  /* ---------- Ціни з Google Таблиці (CSV) ---------- */
  function parseCSV(text) {
    const rows = [];
    let row = [], cell = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) {
        if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (ch === '"') q = false;
        else cell += ch;
      } else if (ch === '"') q = true;
      else if (ch === ",") { row.push(cell); cell = ""; }
      else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); rows.push(row); row = []; cell = "";
      } else cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    const head = (rows.shift() || []).map((h) => h.trim().toLowerCase());
    return rows
      .filter((r) => r.some((c) => c.trim()))
      .map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] || "").trim()])));
  }

  const yes = (v) => /^(1|так|yes|true|y|\+)$/i.test(v || "");
  const num = (v) => {
    const n = Number(String(v).replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(n) && String(v).trim() !== "" ? n : null;
  };

  function applySheet(rows) {
    const sections = { latex: "latex", foil: "foil", bubble: "bubbles", bubbles: "bubbles" };
    rows.forEach((r) => {
      const sec = (r.section || "").toLowerCase();
      const id = r.id;
      if (!id) return;
      if (sec === "set") {
        let s = findSet(id);
        if (yes(r.hidden)) {
          SHOP.sets = SHOP.sets.filter((x) => x.id !== id);
          return;
        }
        if (!s) {
          if (!r.image) return;
          s = { id, title: r.name || id, image: r.image, categories: [], occasion: "birthday", price: null };
          SHOP.sets.push(s);
        }
        if (r.name) s.title = r.name;
        if (r.image) s.image = r.image;
        if ("price" in r) s.price = num(r.price);
        if (r.categories) s.categories = r.categories.split(/[\s,;]+/).filter(Boolean);
        if (r.occasion) s.occasion = r.occasion;
        return;
      }
      if (sec === "number") {
        const s = SHOP.numberSizes.find((x) => x.id === id);
        if (s && num(r.price) !== null) s.price = num(r.price);
        return;
      }
      const group = sections[sec];
      if (!group) return;
      let x = findItem(group, id);
      if (yes(r.hidden)) {
        SHOP[group] = SHOP[group].filter((y) => y.id !== id);
        return;
      }
      if (!x) {
        if (!r.name || num(r.price) === null) return;
        x = { id, name: r.name, price: 0, swatch: "plain", icon: group === "bubbles" ? "bubble" : "printed", inscription: group === "bubbles" };
        SHOP[group].push(x);
      }
      if (r.name) x.name = r.name;
      if (num(r.price) !== null) x.price = num(r.price);
      if ("from" in r) x.from = yes(r.from);
      if (r.size) x.size = r.size;
    });
  }

  async function loadSheet() {
    if (!SHEET_URL) return;
    try {
      const res = await fetch(SHEET_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      applySheet(parseCSV(await res.text()));
      renderTabs();
      renderSets();
      renderBuilder();
      updateDigits();
      updateSummary();
    } catch (err) {
      console.warn("Не вдалося завантажити таблицю, залишаю ціни з data.js", err);
    }
  }

  initContacts();
  initSets();
  initBuilder();
  initOrder();
  initDialogs();
  loadSheet();
})();
