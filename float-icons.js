/* ══════════════════════════════════════════════════
   Odyssey — giriş ekranındaki zıplayan rozetler
   ──────────────────────────────────────────────────
   Eski giriş ekranındaki (Capacity Planner / LoginPage.jsx useBouncingIcons)
   "köşelere çarpan toplar" - her rozetin kendi konumu ve hızı var, ekran
   kenarına gelince yansır. Konum her karede doğrudan DOM transform'una
   yazılır (state güncellemesi yok, akıcı kalsın diye).

   İkonlar burada satır içi SVG: özgün ekranda dört tanesi PPTX çıktısıyla
   paylaşılan PNG (base64) varlıklardı; Odyssey'e o dev base64 blob'ları
   taşımak yerine aynı anlamı taşıyan vektör karşılıkları çizildi. Renkler ve
   boyutlar özgün tanımla birebir aynı (bkz. FLOAT_ICONS).
   ══════════════════════════════════════════════════ */

const ZIPLAYAN = (() => {
  const CIZ = 'stroke="currentColor" stroke-width="2" fill="none"';

  const IKONLAR = [
    {
      // onay (özgün: icon_check.png)
      accent: "16a34a",
      size: 80,
      svg: `<path d="M5 12.5l4.5 4.5L19 7" ${CIZ} stroke-linecap="round" stroke-linejoin="round"/>`,
    },
    {
      // roket (özgün: icon_rocket.png)
      accent: "2563eb",
      size: 96,
      svg: `<path d="M12 3c3.1 2.3 4.9 5.5 4.9 9l-2 2.1H9.1l-2-2.1c0-3.5 1.8-6.7 4.9-9Z" ${CIZ} stroke-linejoin="round"/>
            <circle cx="12" cy="9.6" r="1.7" ${CIZ}/>
            <path d="M9.1 14.6 7 19l3.1-1.2M14.9 14.6 17 19l-3.1-1.2" ${CIZ} stroke-linecap="round" stroke-linejoin="round"/>`,
    },
    {
      // uyarı (özgün: icon_warn.png)
      accent: "e0761f",
      size: 86,
      svg: `<path d="M12 4.2 20.6 19H3.4L12 4.2Z" ${CIZ} stroke-linejoin="round"/>
            <path d="M12 10v3.6" ${CIZ} stroke-linecap="round"/>
            <circle cx="12" cy="16.3" r="1" fill="currentColor" stroke="none"/>`,
    },
    {
      // saat (özgün: icon_clock.png)
      accent: "7c3aed",
      size: 74,
      svg: `<circle cx="12" cy="12" r="8.4" ${CIZ}/>
            <path d="M12 7.2v5.1l3.2 1.9" ${CIZ} stroke-linecap="round" stroke-linejoin="round"/>`,
    },
    {
      // IconCheckCircle
      accent: "16a34a",
      size: 68,
      svg: `<circle cx="12" cy="12" r="9" ${CIZ}/>
            <path d="M8 12.3l2.6 2.6L16 9.5" ${CIZ} stroke-linecap="round" stroke-linejoin="round"/>`,
    },
    {
      // IconPlusCircle
      accent: "2563eb",
      size: 78,
      svg: `<circle cx="12" cy="12" r="9" ${CIZ}/>
            <path d="M12 8v8M8 12h8" ${CIZ} stroke-linecap="round"/>`,
    },
    {
      // IconGauge
      accent: "0d5ea8",
      size: 70,
      svg: `<path d="M4 14a8 8 0 1 1 16 0" ${CIZ} stroke-linecap="round"/>
            <path d="M12 14 16 9" ${CIZ} stroke-linecap="round"/>
            <circle cx="12" cy="14" r="1.4" fill="currentColor" stroke="none"/>`,
    },
    {
      // IconUsers
      accent: "c2570f",
      size: 64,
      svg: `<circle cx="9" cy="8" r="3.2" ${CIZ}/>
            <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" ${CIZ} stroke-linecap="round"/>
            <path d="M15.5 5.5a3.2 3.2 0 0 1 0 6.4M18.5 20c0-2.8-1.9-5.1-4.5-5.8" ${CIZ} stroke-linecap="round" stroke-linejoin="round"/>`,
    },
  ];

  const azHareket = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let cisimler = [];
  let raf = null;

  function rozetYap(tanim) {
    const sarmal = document.createElement("div");
    sarmal.className = "login__float";
    sarmal.setAttribute("aria-hidden", "true");
    sarmal.style.width = tanim.size + "px";
    sarmal.style.height = tanim.size + "px";

    const rozet = document.createElement("div");
    rozet.className = "login__float-badge";
    rozet.style.background =
      `radial-gradient(circle at 30% 28%, #ffffffb0, transparent 42%),` +
      ` linear-gradient(135deg, #${tanim.accent}, #${tanim.accent}90)`;
    rozet.style.boxShadow = `0 0 30px #${tanim.accent}b0, 0 0 12px #${tanim.accent}`;
    rozet.innerHTML = `<svg viewBox="0 0 24 24">${tanim.svg}</svg>`;

    sarmal.appendChild(rozet);
    return sarmal;
  }

  function kare() {
    for (const c of cisimler) {
      c.x += c.vx;
      c.y += c.vy;

      const enBuyukX = window.innerWidth - c.size;
      const enBuyukY = window.innerHeight - c.size;

      // Kenara çarpınca yansı - hız işaretini mutlak değerle veriyoruz ki
      // pencere küçültülüp rozet dışarıda kaldığında takılıp kalmasın.
      if (c.x <= 0) { c.x = 0; c.vx = Math.abs(c.vx); }
      else if (c.x >= enBuyukX) { c.x = enBuyukX; c.vx = -Math.abs(c.vx); }
      if (c.y <= 0) { c.y = 0; c.vy = Math.abs(c.vy); }
      else if (c.y >= enBuyukY) { c.y = enBuyukY; c.vy = -Math.abs(c.vy); }

      c.el.style.transform = `translate(${c.x}px, ${c.y}px)`;
    }
    raf = requestAnimationFrame(kare);
  }

  return {
    /** Rozetleri kapsayıcıya ekler ve hareketi başlatır (tekrar çağrılırsa yok sayılır). */
    baslat(kapsayici) {
      if (azHareket || cisimler.length) return;

      cisimler = IKONLAR.map((tanim) => {
        const el = rozetYap(tanim);
        kapsayici.appendChild(el);

        const hiz = 0.5 + Math.random() * 0.5;
        const aci = Math.random() * Math.PI * 2;
        return {
          el,
          size: tanim.size,
          x: Math.random() * Math.max(0, window.innerWidth - tanim.size),
          y: Math.random() * Math.max(0, window.innerHeight - tanim.size),
          vx: Math.cos(aci) * hiz,
          vy: Math.sin(aci) * hiz,
        };
      });

      raf = requestAnimationFrame(kare);
    },

    /** Giriş yapılınca çağrılır - rozetleri kaldırıp döngüyü kapatır. */
    durdur() {
      cancelAnimationFrame(raf);
      raf = null;
      for (const c of cisimler) c.el.remove();
      cisimler = [];
    },
  };
})();
