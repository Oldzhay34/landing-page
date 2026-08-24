/* ══════════════════════════════════════════════════
   Odyssey — oturum katmanı
   ──────────────────────────────────────────────────
   Kimlik doğrulama artık alt uygulamaların içinde DEĞİL, bu dış kabukta.
   İstekler aynı origin'deki /api/auth/... adresine gider; Odyssey'in nginx'i
   bunu Capacity Planner backend'ine proxy'ler (bkz. nginx.conf). Bu sayede
   backend'in yazdığı httpOnly çerezler tarayıcı gözünde first-party kalır ve
   iframe içinde açılan alt uygulamalar da aynı çerezi kullanabilir.
   ══════════════════════════════════════════════════ */

const AUTH = (() => {
  function cerezOku(ad) {
    const m = document.cookie.match(new RegExp("(?:^|; )" + ad + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : null;
  }

  /**
   * Backend çift-gönderim (double-submit) CSRF deseni kullanıyor: httpOnly
   * OLMAYAN XSRF-TOKEN çerezini okuyup aynı değeri başlıkta geri yolluyoruz
   * (bkz. backend CsrfCookieFilter).
   */
  function csrfBasliklari() {
    const t = cerezOku("XSRF-TOKEN");
    return t ? { "X-CSRF-Token": t } : {};
  }

  /**
   * Erişim çerezinin (access_token) ömrü kısa; süresi dolmuşsa refresh_token
   * hâlâ geçerliyken bir kez sessizce yenilemeyi dener. Yenileme de başarısızsa
   * oturum gerçekten yok demektir → çağıran taraf giriş ekranını gösterir.
   */
  async function yenile() {
    try {
      const r = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: csrfBasliklari(),
      });
      return r.ok;
    } catch {
      return false;
    }
  }

  async function ben({ yenilemeDenendi = false } = {}) {
    let r;
    try {
      r = await fetch("/api/auth/me", { credentials: "include" });
    } catch {
      return { hata: "ag" };
    }
    if (r.ok) return { kullanici: await r.json() };
    if (r.status === 401 && !yenilemeDenendi && (await yenile())) {
      return ben({ yenilemeDenendi: true });
    }
    return { kullanici: null };
  }

  async function giris(sicil, sifre) {
    let r;
    try {
      r = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sicil, password: sifre }),
      });
    } catch {
      throw new Error("Sunucuya ulaşılamadı. Bağlantınızı kontrol edip tekrar deneyin.");
    }

    if (r.status === 401) throw new Error("Sicil no veya şifre hatalı.");
    if (!r.ok) {
      let mesaj = "Giriş yapılamadı (HTTP " + r.status + ").";
      try {
        const govde = await r.json();
        if (govde && govde.message) mesaj = govde.message;
      } catch {
        /* gövde JSON değilse varsayılan mesaj kalsın */
      }
      throw new Error(mesaj);
    }
    return r.json();
  }

  async function cikis() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: csrfBasliklari(),
      });
    } catch {
      /* çerezler yine de sunucu tarafında geçersiz kılınmış olabilir */
    }
  }

  return { ben, giris, cikis };
})();
