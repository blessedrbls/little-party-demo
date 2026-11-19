(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const money = (n) => `${n.toLocaleString("uk-UA")} грн`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const prettyPhone = (p) => p.replace(/^\+380(\d{2})(\d{3})(\d{2})(\d{2})$/, "+380 $1 $2 $3 $4");

  /* ---------- Контакти з data.js ---------- */
  function initContacts() {
    $$("[data-phone-link]").forEach((a) => (a.href = `tel:${SHOP.phones[+a.dataset.phoneLink]}`));
    $$("[data-phone-text]").forEach((el) => (el.textContent = prettyPhone(SHOP.phones[+el.dataset.phoneText])));
    $("#phones").innerHTML = SHOP.phones.map((p) => `<li><a href="tel:${p}">${prettyPhone(p)}</a></li>`).join("");
    const insta = $("#insta");
    insta.href = `https://instagram.com/${SHOP.instagram}`;
    $("span", insta).textContent = `@${SHOP.instagram}`;
    $("#viber").href = `viber://chat?number=${encodeURIComponent(SHOP.messengerPhone)}`;
    $("#telegram").href = `https://t.me/${SHOP.messengerPhone}`;
    $("#year").textContent = new Date().getFullYear();
  }

  /* ---------- Готові набори ---------- */
  let activeCat = "all";
  const findSet = (id) => SHOP.sets.find((s) => s.id === id);

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
        <button class="set-card__photo" type="button" data-zoom="${s.id}" aria-label="Збільшити фото: ${esc(s.title)}">
          <img src="${s.image}" alt="${esc(s.title)}" loading="lazy" decoding="async" width="980" height="1400">
          <span class="set-card__zoom" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5M11 8v6M8 11h6"/></svg></span>
        </button>
        <div class="set-card__body">
          <h3 class="set-card__title">${esc(s.title)}</h3>
          <p class="set-card__price">${esc(SHOP.setPriceLabel)}</p>
          <div class="set-card__actions">
            <button class="btn btn--primary" type="button" data-order="${s.id}">Замовити</button>
            <button class="btn btn--soft" type="button" data-similar="${s.id}">Зібрати схожий</button>
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
        openOrder({ items: [`Готовий набір: ${s.title}`], total: SHOP.setPriceLabel, note: "Менеджер уточнить вартість і кольори" });
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
    latex: Object.fromEntries(SHOP.latex.map((x) => [x.id, 0])),
    foil: Object.fromEntries(SHOP.foil.map((x) => [x.id, 0])),
    digits: "",
    size: SHOP.numberSizes[0].id,
    ref: null,
  };
  const MAX_QTY = 99;

  const foilIcons = {
    heart: `<svg viewBox="0 0 40 40"><defs><linearGradient id="gH" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8dede"/><stop offset=".5" stop-color="#d99a9f"/><stop offset="1" stop-color="#b9787c"/></linearGradient></defs><path d="M20 34S5 25 5 14.5C5 9.8 8.6 6.5 12.6 6.5c3 0 5.6 1.8 7.4 4.4 1.8-2.6 4.4-4.4 7.4-4.4 4 0 7.6 3.3 7.6 8C35 25 20 34 20 34z" fill="url(#gH)"/><path d="M10 12c1-2.4 3-3 4.5-2.6" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".8"/></svg>`,
    printed: `<svg viewBox="0 0 40 40"><defs><linearGradient id="gP" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3f6fa"/><stop offset=".55" stop-color="#bcd0e2"/><stop offset="1" stop-color="#8eaecb"/></linearGradient></defs><circle cx="20" cy="19" r="15" fill="url(#gP)"/><path d="m20 11 2.4 5 5.4.7-4 3.7 1 5.3-4.8-2.6-4.8 2.6 1-5.3-4-3.7 5.4-.7z" fill="#c6a15b"/><path d="M10 14c1.4-3 4-4.4 6-4.4" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`,
    figure: `<svg viewBox="0 0 40 40"><defs><linearGradient id="gF" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6e8c6"/><stop offset=".5" stop-color="#c6a15b"/><stop offset="1" stop-color="#9c7a39"/></linearGradient></defs><path d="M20 20c-3-4-9-8-13-6s-2 10 2 11 8-2 11-5zm0 0c3-4 9-8 13-6s2 10-2 11-8-2-11-5z" fill="url(#gF)"/><path d="m17 22-4 12 4-2 2 3 1-13zm6 0 4 12-4-2-2 3-1-13z" fill="url(#gF)"/><circle cx="20" cy="20" r="3.4" fill="#b08a44"/></svg>`,
  };

  const priceLabel = (x) => (x.from ? `від ${x.price} грн / шт.` : `${x.price} грн / шт.`);

  function itemRow(group, x, visual) {
    return `
      <li class="item" data-group="${group}" data-id="${x.id}">
        ${visual}
        <div>
          <div class="item__name">${esc(x.name)}</div>
          <div class="item__price">${priceLabel(x)}</div>
        </div>
        <div class="stepper">
          <button type="button" data-step="-1" aria-label="Менше: ${esc(x.name)}" disabled>−</button>
          <output aria-live="polite">0</output>
          <button type="button" data-step="1" aria-label="Більше: ${esc(x.name)}">+</button>
        </div>
      </li>`;
  }

  function renderBuilder() {
    $("#occasions").innerHTML = SHOP.occasions
      .map(
        (o) => `
      <label class="occasion">
        <input type="radio" name="occasion" value="${o.id}" ${o.id === state.occasion ? "checked" : ""}>
        <span><span aria-hidden="true">${o.emoji}</span>${esc(o.label)}</span>
      </label>`
      )
      .join("");

    $("#latex-list").innerHTML = SHOP.latex
      .map((x) => itemRow("latex", x, `<span class="ball ball--${x.swatch}" aria-hidden="true">${x.swatch === "print" ? "<span>♥</span>" : ""}</span>`))
      .join("");

    $("#foil-list").innerHTML = SHOP.foil
      .map((x) => itemRow("foil", x, `<span class="foil-ico" aria-hidden="true">${foilIcons[x.icon] || ""}</span>`))
      .join("");

    $("#sizes").innerHTML = SHOP.numberSizes
      .map(
        (s) => `
      <label><input type="radio" name="size" value="${s.id}" ${s.id === state.size ? "checked" : ""}><span>${esc(s.label)}<small>${s.price} грн</small></span></label>`
      )
      .join("");
  }

  function syncRow(group, id) {
    const row = $(`.item[data-group="${group}"][data-id="${id}"]`);
    const qty = state[group][id];
    $("output", row).textContent = qty;
    $('[data-step="-1"]', row).disabled = qty <= 0;
    $('[data-step="1"]', row).disabled = qty >= MAX_QTY;
    row.classList.toggle("is-active", qty > 0);
  }

  function calc() {
    const lines = [];
    SHOP.latex.forEach((x) => {
      const q = state.latex[x.id];
      if (q) lines.push({ name: `Латексні «${x.name}»`, qty: q, sum: q * x.price, from: false });
    });
    SHOP.foil.forEach((x) => {
      const q = state.foil[x.id];
      if (q) lines.push({ name: `Фольговані «${x.name}»`, qty: q, sum: q * x.price, from: !!x.from });
    });
    const digitCount = state.digits.length;
    if (digitCount) {
      const size = SHOP.numberSizes.find((s) => s.id === state.size);
      lines.push({ name: `Цифри «${state.digits}», ${size.label}`, qty: digitCount, sum: digitCount * size.price, from: false });
    }
    const total = lines.reduce((a, l) => a + l.sum, 0);
    const hasFrom = lines.some((l) => l.from);
    return { lines, total, hasFrom };
  }

  const lineText = (l) => `${l.name} × ${l.qty} — ${l.from ? "від " : ""}${money(l.sum)}`;
  const occasionLabel = () => SHOP.occasions.find((o) => o.id === state.occasion).label;

  function updateSummary() {
    const { lines, total, hasFrom } = calc();
    const free = SHOP.freeDeliveryFrom;

    $("#summary-list").innerHTML = lines.length
      ? lines.map((l) => `<li><span>${esc(l.name)} × ${l.qty}</span><span>${l.from ? "від " : ""}${money(l.sum)}</span></li>`).join("")
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
        ? `До безкоштовної доставки ще ${money(free - total)}`
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

  function plural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
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
      <img src="${state.ref.image}" alt="" loading="lazy">
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

  function initBuilder() {
    renderBuilder();

    $("#occasions").addEventListener("change", (e) => (state.occasion = e.target.value));

    $(".builder__steps").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-step]");
      if (btn) {
        const row = btn.closest(".item");
        const { group, id } = row.dataset;
        state[group][id] = Math.max(0, Math.min(MAX_QTY, state[group][id] + Number(btn.dataset.step)));
        syncRow(group, id);
        updateSummary();
        return;
      }
      if (e.target.closest("[data-ref-clear]")) {
        state.ref = null;
        renderRef();
      }
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
      const deliveryNote = total >= SHOP.freeDeliveryFrom ? "Доставка по Троєщині безкоштовна." : "";
      openOrder({
        items,
        total: `${hasFrom ? "від " : ""}${money(total)}`,
        note: [deliveryNote, hasFrom ? "Точну суму підтвердить менеджер." : ""].filter(Boolean).join(" "),
      });
    });

    updateDigits();
    updateSummary();
  }

  /* ---------- Форма замовлення ---------- */
  const modal = $("#order-modal");
  const form = $("#order-form");

  function todayISO() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  function openOrder({ items, total, note = "" }) {
    $("#order-items").innerHTML = items.map((i) => `<li>${esc(i)}</li>`).join("");
    $("#order-total").textContent = total;
    $("#order-note").textContent = note;
    form.hidden = false;
    $("#order-success").hidden = true;
    $$(".field.is-invalid", form).forEach((f) => f.classList.remove("is-invalid"));
    form.date.min = todayISO();
    modal.showModal();
    modal.scrollTop = 0;
  }

  function toggleAddress() {
    const isDelivery = form.delivery.value === "delivery";
    $("#address-field").hidden = !isDelivery;
    form.address.required = isDelivery;
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

  function initOrder() {
    form.addEventListener("change", (e) => {
      if (e.target.name === "delivery") toggleAddress();
    });
    form.addEventListener("input", (e) => {
      const field = e.target.closest(".field.is-invalid");
      if (field) field.classList.remove("is-invalid");
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validate()) return;
      // Демо: дані нікуди не надсилаються
      form.reset();
      toggleAddress();
      form.hidden = true;
      $("#order-success").hidden = false;
      modal.scrollTop = 0;
    });
    toggleAddress();
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

  initContacts();
  initSets();
  initBuilder();
  initOrder();
  initDialogs();
})();
