/* Pharmapath Pathology Lab — app logic. Content lives in data.js */
(function () {
  "use strict";
  const L = window.LAB, P = window.PACKAGES || [], T = window.TESTS || [], H = window.HOMECARE || [];
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const inr = n => "₹" + Number(n).toLocaleString("en-IN");
  const picked = new Set();
  /* Category colours follow real collection-tube caps */
  const CATS = {
    all: ["All", ""], blood: ["Blood", "#8E6CCF"], sugar: ["Diabetes", "#8C979E"], heart: ["Heart", "#E0A526"],
    organ: ["Liver and kidney", "#D2463C"], hormone: ["Thyroid and vitamins", "#4FA7DA"], urine: ["Urine", "#E8C547"]
  };
  let cat = "all";

  /* WhatsApp — always URL-encode; fall back to same tab if popup blocked */
  const waURL = lines => "https://wa.me/" + L.whatsapp + "?text=" + encodeURIComponent(lines.filter(Boolean).join("\n"));
  function openWA(lines) {
    const url = waURL(lines);
    const w = window.open(url, "_blank", "noopener");
    if (!w) window.location.href = url;
  }
  const val = id => { const el = document.getElementById(id); return el ? el.value.trim() : ""; };
  const fmtDate = d => d ? new Date(d + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

  /* Mobile menu */
  const btn = $("#menuBtn"), nav = $("#nav");
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  nav.addEventListener("click", e => { if (e.target.tagName === "A") { nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); } });

  /* Hero tube rack */
  const rack = $("#rack");
  const maxPrice = Math.max(...P.map(p => p.price || 0)) || 1;
  rack.innerHTML = P.map(p => {
    const lvl = p.price ? Math.round(38 + 50 * (p.price / maxPrice)) : 22;
    const label = p.price ? inr(p.price) : "Soon";
    return `<button type="button" role="listitem" class="tube${p.tag === "Most booked" ? " feat" : ""}" data-pkg="${esc(p.id)}" style="--c:${p.cap};--lvl:${lvl}%"
      aria-label="${esc(p.name)}, ${p.price ? inr(p.price) : "price coming soon"}. Book this package">
      <span class="cap"></span><span class="glass"><span class="fill"></span><span class="label">${label}<small>${p.tests.length > 1 ? p.tests.length + " tests" : "Ask us"}</small></span></span>
      <span class="name">${esc(p.short || p.name)}</span></button>`;
  }).join("");
  rack.classList.add("pre");
  requestAnimationFrame(() => requestAnimationFrame(() => rack.classList.remove("pre")));

  /* Packages: featured package gets the wide card */
  function pkgCard(p) {
    const feat = p.tag === "Most booked";
    const price = p.price == null ? '<span class="price ask">Price on request</span>'
      : `<span class="price">${inr(p.price)}</span>${p.mrp ? `<s class="mrp">${inr(p.mrp)}</s><span class="save">Save ${Math.round(100 - 100 * p.price / p.mrp)}%</span>` : ""}`;
    return `<article class="pkg${feat ? " feat" : ""}" style="--c:${p.cap}">
      ${p.tag ? `<span class="tag${p.price == null ? " soon" : ""}">${esc(p.tag)}</span>` : ""}
      <div class="pkg-top"><span class="dot" aria-hidden="true"></span><h3>${esc(p.name)}</h3></div>
      <p class="who">${esc(p.who)}</p>
      <div class="price-row">${price}</div>
      <ul class="incl" aria-label="Tests included">${p.tests.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
      ${p.fasting ? '<p class="fast">Fasting 10–12 hours</p>' : ""}
      <button class="btn ${p.price == null ? "btn-ghost" : "btn-wa"}" type="button" data-pkg="${esc(p.id)}">${p.price == null ? "Ask on WhatsApp" : "Book this package"}</button>
    </article>`;
  }
  const ordered = [...P].sort((a, b) => (b.tag === "Most booked") - (a.tag === "Most booked"));
  $("#pkgGrid").innerHTML = ordered.map(pkgCard).join("");

  const sel = $("#bPkg");
  P.forEach(p => { const o = document.createElement("option"); o.value = p.id; o.textContent = p.name + (p.price != null ? " — " + inr(p.price) : " — price on request"); sel.appendChild(o); });

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-pkg]");
    if (!b) return;
    const p = P.find(x => x.id === b.dataset.pkg);
    if (p && p.price == null) { openWA(["Hi Pharmapath Lab,", "Please share details and price of the " + p.name + "."]); return; }
    sel.value = b.dataset.pkg;
    updatePreview();
    location.hash = "book";
    $("#bName").focus({ preventScroll: true });
  });

  /* Tests */
  $("#chips").innerHTML = Object.entries(CATS).map(([k, [v, c]]) =>
    `<button type="button" class="chip" data-cat="${k}" aria-pressed="${k === cat}"${c ? ` style="--c:${c}"` : ""}>${c ? "<i aria-hidden=\"true\"></i>" : ""}${v}</button>`).join("");
  $("#chips").addEventListener("click", e => {
    const c = e.target.closest(".chip"); if (!c) return;
    cat = c.dataset.cat;
    document.querySelectorAll(".chip").forEach(x => x.setAttribute("aria-pressed", x === c));
    renderTests();
  });
  $("#testSearch").addEventListener("input", () => {
    if (cat !== "all" && $("#testSearch").value.trim()) {   // search always looks across all tests
      cat = "all";
      document.querySelectorAll(".chip").forEach(x => x.setAttribute("aria-pressed", x.dataset.cat === "all"));
    }
    renderTests();
  });
  function renderTests() {
    const q = $("#testSearch").value.toLowerCase().trim();
    const list = T.filter(t => (cat === "all" || t.cat === cat) && (!q || t.n.toLowerCase().includes(q)));
    $("#testList").innerHTML = list.length ? list.map(t => {
      const on = picked.has(t.n), c = (CATS[t.cat] || [])[1] || "";
      return `<li class="test" style="--c:${c}"><div><b>${esc(t.n)}</b><small>${t.price != null ? inr(t.price) : "Price on request"}</small>${t.fasting ? ' · <small class="f">Fasting</small>' : ""}</div>
        <button type="button" class="add" data-test="${esc(t.n)}" aria-pressed="${on}" aria-label="${on ? "Remove" : "Add"} ${esc(t.n)}">${on ? "Added ✓" : "Add"}</button></li>`;
    }).join("") : '<li class="empty">No test matches that search. Ask us on WhatsApp; we run many more tests.</li>';
  }
  $("#testList").addEventListener("click", e => {
    const b = e.target.closest("[data-test]"); if (!b) return;
    const n = b.dataset.test;
    picked.has(n) ? picked.delete(n) : picked.add(n);
    renderTests(); renderPicked(); updatePreview();
  });
  function renderPicked() {
    const n = picked.size;
    $("#pickedBar").hidden = n === 0;
    $("#pickedCount").textContent = n + (n === 1 ? " test selected" : " tests selected");
    const box = $("#bTests");
    box.textContent = n ? [...picked].join(", ") : "None added yet. Pick them in the tests list above.";
    box.classList.toggle("muted", !n);
  }

  /* Booking */
  const addrWrap = $("#addrWrap");
  document.querySelectorAll('input[name="mode"]').forEach(r => r.addEventListener("change", () => {
    addrWrap.hidden = $('input[name="mode"]:checked').value !== "Home sample collection";
  }));
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  $("#bDate").value = iso(tomorrow); $("#bDate").min = iso(new Date());
  $("#rDate").max = iso(new Date());

  const cleanPhone = () => val("bPhone").replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
  function bookingLines(forPreview) {
    const mode = $('input[name="mode"]:checked').value, p = P.find(x => x.id === sel.value);
    const blank = forPreview ? "…" : "";
    return [
      "Hi Pharmapath Lab, I want to book a test.",
      "Name: " + (val("bName") || blank) + (val("bAge") ? " (Age " + val("bAge") + ")" : ""),
      "Mobile: " + (cleanPhone() || blank),
      p ? "Package: " + p.name + (p.price != null ? " (" + inr(p.price) + ")" : "") : "",
      picked.size ? "Tests: " + [...picked].join(", ") : "",
      forPreview && !p && !picked.size ? "Package: …" : "",
      "Type: " + mode,
      mode === "Home sample collection" ? "Address: " + (val("bAddr") || blank) : "",
      "Preferred: " + fmtDate(val("bDate")) + ", " + val("bSlot")
    ].filter(Boolean);
  }
  function updatePreview() { $("#preview").textContent = bookingLines(true).join("\n"); }
  $("#bookForm").addEventListener("input", updatePreview);
  $("#bookForm").addEventListener("change", updatePreview);

  $("#bookForm").addEventListener("submit", e => {
    e.preventDefault();
    const err = $("#bErr"); err.textContent = "";
    const mode = $('input[name="mode"]:checked').value;
    if (!val("bName")) return fail(err, "Enter the patient's name.", "bName");
    if (!/^[6-9]\d{9}$/.test(cleanPhone())) return fail(err, "Enter a 10-digit mobile number starting with 6, 7, 8 or 9.", "bPhone");
    if (!sel.value && !picked.size) return fail(err, "Choose a package, or add at least one test from the list.", "bPkg");
    if (mode === "Home sample collection" && !val("bAddr")) return fail(err, "Enter the address where we should collect the sample.", "bAddr");
    if (!val("bDate")) return fail(err, "Choose a date.", "bDate");
    if (!$("#bConsent").checked) return fail(err, "Tick the consent box so we can contact you.", "bConsent");
    openWA(bookingLines(false));
  });

  $("#storeForm").addEventListener("submit", e => {
    e.preventDefault();
    const err = $("#sErr"); err.textContent = "";
    if (!val("sName")) return fail(err, "Enter your name.", "sName");
    if (!val("sNeed")) return fail(err, "Tell us which medicines or products you need.", "sNeed");
    if (!val("sAddr")) return fail(err, "Enter the delivery address.", "sAddr");
    openWA(["Hi Pharmapath, medicine delivery enquiry.", "Name: " + val("sName"), "Need: " + val("sNeed"), "Address: " + val("sAddr"), "(I will attach the prescription photo.)"]);
  });

  $("#reportForm").addEventListener("submit", e => {
    e.preventDefault();
    const err = $("#rErr"); err.textContent = "";
    if (!val("rName")) return fail(err, "Enter the patient's name.", "rName");
    if (!val("rDate")) return fail(err, "Enter the date of the test.", "rDate");
    openWA(["Hi Pharmapath Lab, please send my report.", "Patient: " + val("rName"), "Test date: " + fmtDate(val("rDate")), val("rId") ? "Bill no: " + val("rId") : ""]);
  });

  function fail(el, msg, id) { el.textContent = msg; const f = document.getElementById(id); if (f) f.focus(); }

  /* Home care */
  $("#careGrid").innerHTML = H.map(s => `<button type="button" data-care="${esc(s)}">${esc(s)}</button>`).join("");
  $("#careGrid").addEventListener("click", e => {
    const b = e.target.closest("[data-care]"); if (!b) return;
    openWA(["Hi Pharmapath, I need a home care visit.", "Service: " + b.dataset.care, "Name: ", "Address: "]);
  });

  /* Contact */
  const mapsQ = encodeURIComponent(L.mapsQuery);
  $("#cAddr").textContent = L.address; $("#fAddr").textContent = L.address;
  $("#cPhone").textContent = L.phoneDisplay; $("#cPhone").href = "tel:+" + L.whatsapp;
  $("#heroCall").href = "tel:+" + L.whatsapp;
  $("#cHours").textContent = L.hours; $("#heroHours").textContent = L.hours;
  $("#cWa").href = $("#waFloat").href = "https://wa.me/" + L.whatsapp;
  $("#cDir").href = "https://www.google.com/maps/search/?api=1&query=" + mapsQ;
  $("#mapFrame").src = "https://www.google.com/maps?q=" + mapsQ + "&output=embed";
  $("#copyBtn").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(L.phoneDisplay); $("#copyBtn").textContent = "Copied"; }
    catch (_) { $("#copyBtn").textContent = L.phoneDisplay; }
    setTimeout(() => $("#copyBtn").textContent = "Copy", 2000);
  });
  $("#yr").textContent = new Date().getFullYear();

  renderTests(); renderPicked(); updatePreview();

  /* PWA: service worker + install prompt */
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
  let deferred;
  const dismissed = () => { try { return localStorage.getItem("pp-install-x") === "1"; } catch (_) { return false; } };
  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault(); deferred = e;
    if (!dismissed()) setTimeout(() => { $("#installBar").hidden = false; }, 6000);
  });
  $("#installBtn").addEventListener("click", async () => {
    $("#installBar").hidden = true;
    if (deferred) { deferred.prompt(); await deferred.userChoice; deferred = null; }
  });
  $("#installClose").addEventListener("click", () => {
    $("#installBar").hidden = true;
    try { localStorage.setItem("pp-install-x", "1"); } catch (_) {}
  });
})();
