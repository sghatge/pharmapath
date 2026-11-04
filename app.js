/* Pharmapath Pathology Lab — app logic. Content lives in data.js */
(function () {
  "use strict";
  const L = window.LAB, P = window.PACKAGES || [], T = window.TESTS || [], H = window.HOMECARE || [];
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const inr = n => "₹" + Number(n).toLocaleString("en-IN");
  const picked = new Set();
  const CATS = { all: "All", blood: "Blood", sugar: "Diabetes", heart: "Heart", organ: "Liver & Kidney", hormone: "Thyroid & Vitamins", urine: "Urine" };
  let cat = "all";

  /* WhatsApp — always URL-encode; fall back to same tab if popup blocked */
  function openWA(lines) {
    const url = "https://wa.me/" + L.whatsapp + "?text=" + encodeURIComponent(lines.filter(Boolean).join("\n"));
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

  /* Packages */
  function pkgCard(p) {
    const price = p.price == null ? '<span class="price" style="font-size:1.2rem">Price on request</span>'
      : `<span class="price">${inr(p.price)}</span>${p.mrp ? `<s class="mrp">${inr(p.mrp)}</s>` : ""}`;
    return `${p.tag ? `<span class="tag${p.price == null ? " soon" : ""}">${esc(p.tag)}</span>` : ""}
      <h3>${esc(p.name)}</h3><p class="who">${esc(p.who)}</p><div>${price}</div>
      <ul>${p.tests.map(t => `<li>${esc(t)}</li>`).join("")}</ul>
      ${p.fasting ? '<p class="fast">10–12 hrs fasting required</p>' : ""}
      <button class="btn ${p.price == null ? "btn-ghost" : "btn-wa"}" type="button" data-pkg="${esc(p.id)}">${p.price == null ? "Ask on WhatsApp" : "Book this package"}</button>`;
  }
  $("#pkgGrid").innerHTML = P.map(p => `<article class="card pkg">${pkgCard(p)}</article>`).join("");
  const feat = P.find(p => p.tag === "Most booked") || P[0];
  if (feat) $("#heroOffer").innerHTML = pkgCard(feat);

  const sel = $("#bPkg");
  P.forEach(p => { const o = document.createElement("option"); o.value = p.id; o.textContent = p.name + (p.price != null ? " — " + inr(p.price) : " — price on request"); sel.appendChild(o); });

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-pkg]");
    if (!b) return;
    const p = P.find(x => x.id === b.dataset.pkg);
    if (p && p.price == null) { openWA(["Hi Pharmapath Lab,", "Please share details and price of the " + p.name + "."]); return; }
    sel.value = b.dataset.pkg;
    location.hash = "book";
    $("#bName").focus({ preventScroll: true });
  });

  /* Tests */
  $("#chips").innerHTML = Object.entries(CATS).map(([k, v]) => `<button type="button" class="chip" data-cat="${k}" aria-pressed="${k === cat}">${v}</button>`).join("");
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
      const on = picked.has(t.n);
      return `<li class="test"><div><b>${esc(t.n)}</b><small>${t.price != null ? inr(t.price) : "Price on request"}</small>${t.fasting ? ' · <small class="f">Fasting</small>' : ""}</div>
        <button type="button" class="add" data-test="${esc(t.n)}" aria-pressed="${on}" aria-label="${on ? "Remove" : "Add"} ${esc(t.n)}">${on ? "Added ✓" : "Add"}</button></li>`;
    }).join("") : '<li class="empty">No test found. Ask us on WhatsApp — we run many more tests.</li>';
  }
  $("#testList").addEventListener("click", e => {
    const b = e.target.closest("[data-test]"); if (!b) return;
    const n = b.dataset.test;
    picked.has(n) ? picked.delete(n) : picked.add(n);
    renderTests(); renderPicked();
  });
  function renderPicked() {
    const n = picked.size;
    $("#pickedBar").hidden = n === 0;
    $("#pickedCount").textContent = n + (n === 1 ? " test selected" : " tests selected");
    const box = $("#bTests");
    box.textContent = n ? [...picked].join(", ") : "None — add from the Tests section above (optional)";
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

  $("#bookForm").addEventListener("submit", e => {
    e.preventDefault();
    const err = $("#bErr"); err.textContent = "";
    const name = val("bName"), phone = val("bPhone").replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
    const mode = $('input[name="mode"]:checked').value, addr = val("bAddr");
    const p = P.find(x => x.id === sel.value);
    if (!name) return fail(err, "Please enter the patient's name.", "bName");
    if (!/^[6-9]\d{9}$/.test(phone)) return fail(err, "Please enter a valid 10-digit mobile number.", "bPhone");
    if (!p && !picked.size) return fail(err, "Please choose a package or add at least one test.", "bPkg");
    if (mode === "Home sample collection" && !addr) return fail(err, "Please enter the collection address.", "bAddr");
    if (!val("bDate")) return fail(err, "Please choose a date.", "bDate");
    if (!$("#bConsent").checked) return fail(err, "Please tick the consent box to continue.", "bConsent");
    openWA([
      "Hi Pharmapath Lab, I want to book a test.",
      "Name: " + name + (val("bAge") ? " (Age " + val("bAge") + ")" : ""),
      "Mobile: " + phone,
      p ? "Package: " + p.name + (p.price != null ? " (" + inr(p.price) + ")" : "") : "",
      picked.size ? "Tests: " + [...picked].join(", ") : "",
      "Type: " + mode,
      mode === "Home sample collection" ? "Address: " + addr : "",
      "Preferred: " + fmtDate(val("bDate")) + ", " + val("bSlot")
    ]);
  });

  $("#storeForm").addEventListener("submit", e => {
    e.preventDefault();
    const err = $("#sErr"); err.textContent = "";
    if (!val("sName")) return fail(err, "Please enter your name.", "sName");
    if (!val("sNeed")) return fail(err, "Please tell us what you need.", "sNeed");
    if (!val("sAddr")) return fail(err, "Please enter the delivery address.", "sAddr");
    openWA(["Hi Pharmapath, medicine delivery enquiry.", "Name: " + val("sName"), "Need: " + val("sNeed"), "Address: " + val("sAddr"), "(I will attach the prescription photo.)"]);
  });

  $("#reportForm").addEventListener("submit", e => {
    e.preventDefault();
    const err = $("#rErr"); err.textContent = "";
    if (!val("rName")) return fail(err, "Please enter the patient's name.", "rName");
    if (!val("rDate")) return fail(err, "Please enter the test date.", "rDate");
    openWA(["Hi Pharmapath Lab, please send my report.", "Patient: " + val("rName"), "Test date: " + fmtDate(val("rDate")), val("rId") ? "Receipt no: " + val("rId") : ""]);
  });

  function fail(el, msg, id) { el.textContent = msg; const f = document.getElementById(id); if (f) f.focus(); }

  /* Home care */
  $("#careGrid").innerHTML = H.map(s => `<div class="card"><h3>${esc(s)}</h3><button class="btn btn-ghost" type="button" data-care="${esc(s)}">Request</button></div>`).join("");
  $("#careGrid").addEventListener("click", e => {
    const b = e.target.closest("[data-care]"); if (!b) return;
    openWA(["Hi Pharmapath, I need a home care visit.", "Service: " + b.dataset.care, "Name: ", "Address: "]);
  });

  /* Contact */
  const mapsQ = encodeURIComponent(L.mapsQuery);
  $("#cAddr").textContent = L.address; $("#fAddr").textContent = L.address;
  $("#cPhone").textContent = L.phoneDisplay; $("#cPhone").href = "tel:+" + L.whatsapp;
  $("#cHours").textContent = L.hours; $("#heroHours").textContent = L.hours + ".";
  $("#cWa").href = $("#waFloat").href = "https://wa.me/" + L.whatsapp;
  $("#cDir").href = "https://www.google.com/maps/search/?api=1&query=" + mapsQ;
  $("#mapFrame").src = "https://www.google.com/maps?q=" + mapsQ + "&output=embed";
  $("#copyBtn").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(L.phoneDisplay); $("#copyBtn").textContent = "Copied"; }
    catch (_) { $("#copyBtn").textContent = L.phoneDisplay; }
    setTimeout(() => $("#copyBtn").textContent = "Copy", 2000);
  });
  $("#yr").textContent = new Date().getFullYear();

  renderTests(); renderPicked();

  /* PWA: service worker + install prompt */
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
  let deferred;
  const dismissed = () => { try { return localStorage.getItem("pp-install-x") === "1"; } catch (_) { return false; } };
  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault(); deferred = e;
    if (!dismissed()) $("#installBar").hidden = false;
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
