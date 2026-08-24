/* ══════════════════════════════════════════════════
   Odyssey — kayar pencere (coverflow)
   ══════════════════════════════════════════════════ */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ACCENT_RENK = {
  blue: "#2f9ce0",
  green: "#9bcd65",
  violet: "#9b7cf6",
  amber: "#f2b544",
  teal: "#2fd3c4",
};

/* ────────── 1. Kartları üret ────────── */

function slideHTML(p, i) {
  const st = STATUS_META[p.status];
  const acilir = Boolean(p.url);

  // Ayri sekme YOK: karta tiklaninca Odyssey icinde /uygulama/<slug>
  // rotasina gidilir ve uygulama iframe icinde acilir (bkz. shell.js).
  const cta = acilir
    ? `<a class="slide__cta" href="/uygulama/${p.slug}" data-slug="${p.slug}" data-cta>
         Uygulamayı Aç
         <svg viewBox="0 0 16 16" fill="none"><path d="M6 3h7v7M13 3 4 12" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
       </a>`
    : `<span class="slide__cta slide__cta--off">Çok Yakında</span>`;

  return `
  <article class="slide" data-accent="${p.accent}" data-index="${i}" aria-label="${p.name}">
    <div class="slide__top">
      <span class="slide__icon"><svg viewBox="0 0 24 24">${ICONS[p.icon] || ICONS.spark}</svg></span>
      <span class="badge badge--${st.tone}"><i></i>${st.label}</span>
    </div>

    <div class="slide__body">
      <h2 class="slide__name">${p.name}</h2>
      <p class="slide__tagline">${p.tagline}</p>
      <p class="slide__desc">${p.description}</p>
      <div class="slide__preview" aria-hidden="true">${p.preview || ""}</div>
      ${cta}
    </div>
  </article>`;
}

const track = document.getElementById("track");
const carousel = document.getElementById("carousel");
track.innerHTML = PROJECTS.map(slideHTML).join("");

const slides = [...track.querySelectorAll(".slide")];
const N = slides.length;

/* Noktalar */
const dotsEl = document.getElementById("dots");
dotsEl.innerHTML = PROJECTS.map(
  (p, i) => `<button class="dot" data-go="${i}" role="tab" aria-label="${p.name}"></button>`
).join("");
const dots = [...dotsEl.querySelectorAll(".dot")];

document.getElementById("totalNum").textContent = String(N).padStart(2, "0");
document.getElementById("liveCount").textContent =
  PROJECTS.filter((p) => p.status === "live").length;

/* ────────── 2. Yerleşim motoru ────────── */

let active = 0;
let dragFrac = 0;          // sürükleme sırasındaki kesirli kayma
let kartGenislik = 340;

function olcumleriAl() {
  kartGenislik = slides[0]?.offsetWidth || 340;
}

function yerlestir() {
  slides.forEach((el, i) => {
    // merkeze göre konum (kesirli). Döngüsel: son karttan sonra ilk kart
    // en kısa yoldan gelsin diye offset [-N/2, N/2] aralığına sarılır.
    let o = i - active - dragFrac;
    if (N > 2) {
      if (o > N / 2) o -= N;
      else if (o < -N / 2) o += N;
    }
    const a = Math.abs(o);

    if (a > 2.7) {
      el.style.display = "none";
      return;
    }
    el.style.display = "";

    const kapali = Math.min(a, 2);
    const x = o * kartGenislik * 0.86;
    const z = -kapali * 130;
    const dy = kapali * 8;                                 // hafif aşağı kayma
    const rot = Math.max(-26, Math.min(26, -o * 18));
    const olcek = 1 - kapali * 0.13;

    el.style.transform =
      `translate3d(${x}px, ${dy}px, ${z}px) rotateY(${rot}deg) scale(${olcek})`;
    el.style.filter = reduceMotion
      ? "none"
      : `blur(${Math.min(a * 3.2, 6.5).toFixed(2)}px) saturate(${(1 - kapali * 0.14).toFixed(2)}) brightness(${(1 - kapali * 0.13).toFixed(2)})`;
    el.style.opacity = a < 0.5 ? 1 : Math.max(1 - (a - 0.5) * 0.34, 0.34).toFixed(2);
    el.style.zIndex = String(100 - Math.round(a * 10));
    el.style.pointerEvents = a > 2.2 ? "none" : "auto";
  });
}

function durumuYaz() {
  slides.forEach((el, i) => {
    let o = i - active;
    if (N > 2) {
      if (o > N / 2) o -= N;
      else if (o < -N / 2) o += N;
    }
    const a = Math.abs(o);
    el.classList.toggle("slide--active", a === 0);
    el.classList.toggle("slide--side", a === 1);
    el.classList.toggle("slide--far", a >= 2);
    el.setAttribute("aria-hidden", a === 0 ? "false" : "true");
  });

  dots.forEach((d, i) => d.classList.toggle("is-on", i === active));
  document.getElementById("curNum").textContent = String(active + 1).padStart(2, "0");

  // arka plan ışığı etkin projenin rengini alsın
  document.documentElement.style.setProperty(
    "--active",
    ACCENT_RENK[PROJECTS[active].accent] || ACCENT_RENK.blue
  );
}

function git(i, kullanici = true) {
  active = (i + N) % N;
  dragFrac = 0;
  yerlestir();
  durumuYaz();
  if (kullanici) otomatikGecikmeSifirla();
}

const sonraki = () => git(active + 1);
const onceki = () => git(active - 1);

/* ────────── 3. Kontroller ────────── */

document.getElementById("next").addEventListener("click", sonraki);
document.getElementById("prev").addEventListener("click", onceki);
dots.forEach((d) => d.addEventListener("click", () => git(Number(d.dataset.go))));

/* Yan karta tıklayınca ortaya al */
slides.forEach((el, i) => {
  el.addEventListener("click", (e) => {
    if (i === active) return;              // etkin kartta CTA kendi işini yapsın
    e.preventDefault();
    git(i);
  });
});

/* Klavye */
document.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  // Uygulama gorunumundeyken (iframe acikken) karusel tuslari calismasin.
  if (document.getElementById("hubView").hidden) return;

  if (e.key === "ArrowRight") { e.preventDefault(); sonraki(); return; }
  if (e.key === "ArrowLeft")  { e.preventDefault(); onceki();  return; }

  if (e.key === "Enter") {
    ODYSSEY.ac(PROJECTS[active]);
    return;
  }

  const n = Number(e.key);
  if (Number.isInteger(n) && n >= 1 && n <= N) git(n - 1);
});

/* Fare tekerleği / trackpad yatay kaydırma */
let tekerKilit = false;
carousel.addEventListener(
  "wheel",
  (e) => {
    const yatay = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    const delta = yatay ? e.deltaX : e.shiftKey ? e.deltaY : 0;
    if (!delta || tekerKilit) return;

    e.preventDefault();
    tekerKilit = true;
    setTimeout(() => (tekerKilit = false), 420);
    delta > 0 ? sonraki() : onceki();
  },
  { passive: false }
);

/* ────────── 4. Sürükleme / kaydırma ────────── */

let suruklemeAktif = false;
let baslangicX = 0;
let sonDx = 0;

carousel.addEventListener("pointerdown", (e) => {
  if (e.target.closest("[data-cta]") || e.target.closest(".arrow") || e.target.closest(".dot")) return;

  suruklemeAktif = true;
  baslangicX = e.clientX;
  sonDx = 0;
  carousel.classList.add("is-dragging");
  slides.forEach((s) => (s.style.transition = "none"));
  carousel.setPointerCapture(e.pointerId);
  otomatikDurdur();
});

carousel.addEventListener("pointermove", (e) => {
  if (!suruklemeAktif) return;
  sonDx = e.clientX - baslangicX;
  dragFrac = -sonDx / (kartGenislik * 0.86);   // döngüsel: kenar direnci yok
  yerlestir();
});

function suruklemeBitir() {
  if (!suruklemeAktif) return;
  suruklemeAktif = false;
  carousel.classList.remove("is-dragging");
  slides.forEach((s) => (s.style.transition = ""));

  // Eşiği aşan her sürükleme en az bir kart ilerletir
  const esik = 0.2;
  let adim = 0;
  if (dragFrac > esik) adim = Math.max(1, Math.round(dragFrac));
  else if (dragFrac < -esik) adim = Math.min(-1, Math.round(dragFrac));

  dragFrac = 0;
  git(active + adim);   // git() modulo ile sarar
}

carousel.addEventListener("pointerup", suruklemeBitir);
carousel.addEventListener("pointercancel", suruklemeBitir);

/* Sürükleme sonrası istemsiz tıklamayı engelle */
carousel.addEventListener(
  "click",
  (e) => {
    if (Math.abs(sonDx) > 8) {
      e.preventDefault();
      e.stopPropagation();
      sonDx = 0;
    }
  },
  true
);

/* ────────── 5. Otomatik geçiş ────────── */

const OTOMATIK_MS = 7000;
let otomatikId = null;

function otomatikBaslat() {
  if (reduceMotion || otomatikId) return;
  otomatikId = setInterval(() => git(active + 1, false), OTOMATIK_MS);
}
function otomatikDurdur() {
  clearInterval(otomatikId);
  otomatikId = null;
}
function otomatikGecikmeSifirla() {
  otomatikDurdur();
  otomatikBaslat();
}

carousel.addEventListener("pointerenter", otomatikDurdur);
carousel.addEventListener("pointerleave", otomatikBaslat);
document.addEventListener("visibilitychange", () =>
  document.hidden ? otomatikDurdur() : otomatikBaslat()
);

/* ────────── 6. Başlat ────────── */

olcumleriAl();
git(0, false);
otomatikBaslat();

window.addEventListener("resize", () => {
  olcumleriAl();
  yerlestir();
});

/* ────────── 7. Saat ────────── */

const clock = document.getElementById("clock");
function saatiYaz() {
  clock.textContent = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}
saatiYaz();
setInterval(saatiYaz, 10000);
document.getElementById("year").textContent = new Date().getFullYear();

/* ────────── 8. Arka plan: bağlantılı nokta ağı ────────── */

(function mesh() {
  const canvas = document.getElementById("mesh");
  if (!canvas || reduceMotion) return;

  const ctx = canvas.getContext("2d");
  let w, h, dpr, nodes = [];
  const pointer = { x: -999, y: -999 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const density = Math.min(Math.round((w * h) / 20000), 100);
    nodes = Array.from({ length: density }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      r: Math.random() * 1.4 + 0.6,
      green: Math.random() > 0.74,
    }));
  }

  window.addEventListener("pointermove", (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  });
  window.addEventListener("pointerleave", () => { pointer.x = pointer.y = -999; });

  const LINK = 128;

  function frame() {
    ctx.clearRect(0, 0, w, h);

    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;

      const dx = n.x - pointer.x;
      const dy = n.y - pointer.y;
      const d = Math.hypot(dx, dy);
      if (d < 120 && d > 0.1) {
        n.x += (dx / d) * 0.55;
        n.y += (dy / d) * 0.55;
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist > LINK) continue;
        ctx.strokeStyle = `rgba(47,156,224,${(1 - dist / LINK) * 0.26})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    for (const n of nodes) {
      ctx.fillStyle = n.green ? "rgba(155,205,101,.7)" : "rgba(116,196,244,.6)";
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);
  frame();
})();
