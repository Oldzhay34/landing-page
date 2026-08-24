/* ══════════════════════════════════════════════════
   Odyssey — kabuk: oturum kapısı + rota + uygulama çerçevesi
   ──────────────────────────────────────────────────
   Üç görünüm var ve hepsi AYNI sekmede yaşar:
     /                     → giriş (oturum yoksa) veya uygulama merkezi
     /uygulama/<slug>      → seçilen uygulama, iframe içinde
   Rota geçişleri history.pushState ile yapıldığı için tarayıcının geri
   tuşu doğal olarak merkeze (hub) döner - ayrı sekme hiç açılmaz.
   ══════════════════════════════════════════════════ */

const ROTA_ONEKI = "/uygulama/";

const ODYSSEY = (() => {
  const splash = document.getElementById("splash");
  const loginView = document.getElementById("loginView");
  const hubView = document.getElementById("hubView");
  const appView = document.getElementById("appView");

  const loginForm = document.getElementById("loginForm");
  const loginSicil = document.getElementById("loginSicil");
  const loginPassword = document.getElementById("loginPassword");
  const loginError = document.getElementById("loginError");
  const loginSubmit = document.getElementById("loginSubmit");

  const userBadge = document.getElementById("userBadge");
  const userName = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");

  const appFrame = document.getElementById("appFrame");
  const appTitle = document.getElementById("appTitle");
  const appExternal = document.getElementById("appExternal");
  const appBack = document.getElementById("appBack");
  const appLoading = document.getElementById("appLoading");
  const appLoadingText = document.getElementById("appLoadingText");
  const appError = document.getElementById("appError");
  const appErrorTitle = document.getElementById("appErrorTitle");
  const appErrorText = document.getElementById("appErrorText");
  const appErrorOpen = document.getElementById("appErrorOpen");
  const appErrorBack = document.getElementById("appErrorBack");

  const BASLIK = "Odyssey · Aksa";

  let kullanici = null;
  // Giriş yapılmadan istenen rota - giriş başarılı olunca oraya devam edilir
  // (örn. e-postadaki /uygulama/kapasite bağlantısına tıklayan kullanıcı).
  let hedefRota = location.pathname;
  let acikProje = null;
  let yuklemeZamanlayici = null;

  /* ────────── Görünüm anahtarı ────────── */

  function gorunum(ad) {
    splash.hidden = ad !== "splash";
    loginView.hidden = ad !== "login";
    hubView.hidden = ad !== "hub";
    appView.hidden = ad !== "app";
    document.body.classList.toggle("is-app", ad === "app");

    // Zıplayan rozetler yalnızca giriş ekranı görünürken dönsün - giriş
    // yapıldıktan sonra rAF döngüsü boşuna çalışmasın (bkz. float-icons.js).
    if (ad === "login") ZIPLAYAN.baslat(loginView);
    else ZIPLAYAN.durdur();

    // Karusel animasyonu yalnızca hub görünürken dönsün (bkz. main.js).
    if (ad === "hub") otomatikBaslat();
    else otomatikDurdur();
  }

  /* ────────── Rota ────────── */

  function rotaninSlugu(yol) {
    if (!yol.startsWith(ROTA_ONEKI)) return null;
    const slug = yol.slice(ROTA_ONEKI.length).replace(/\/+$/, "");
    return slug || null;
  }

  /** Adres çubuğundaki yola göre doğru görünümü çizer. */
  function ciz(yol) {
    if (!kullanici) {
      hedefRota = yol;
      gorunum("login");
      document.title = "Giriş · " + BASLIK;
      loginSicil.focus();
      return;
    }

    const slug = rotaninSlugu(yol);
    const proje = slug ? projeBul(slug) : null;

    if (!proje || !proje.url) {
      cerceveyiTemizle();
      acikProje = null;
      gorunum("hub");
      document.title = BASLIK;
      return;
    }

    uygulamayiGoster(proje);
  }

  function rotayaGit(yol) {
    if (location.pathname === yol) {
      ciz(yol);
      return;
    }
    history.pushState({ odyssey: true }, "", yol);
    ciz(yol);
  }

  /* ────────── Uygulama çerçevesi ────────── */

  function cerceveyiTemizle() {
    clearTimeout(yuklemeZamanlayici);
    // iframe'i her seferinde SIFIRDAN kuruyoruz: yeni bir iframe'in ilk
    // yüklemesi tarayıcı geçmişine kayıt EKLEMEZ, oysa var olan bir iframe'in
    // src'sini değiştirmek ekler - geri tuşu böylece hub'a temiz döner.
    appFrame.replaceChildren();
    appLoading.hidden = true;
    appError.hidden = true;
  }

  /**
   * cerceveyiKaldir=false: iframe DOM'da kalır. Zaman aşımında bilerek böyle
   * çağrılıyor - uygulama geç de olsa yüklenirse load olayı hata ekranını
   * kaldırıp içeriği gösterebilsin (bkz. uygulamayiGoster).
   */
  function hataGoster(baslik, metin, url, cerceveyiKaldir = true) {
    clearTimeout(yuklemeZamanlayici);
    appLoading.hidden = true;
    if (cerceveyiKaldir) appFrame.replaceChildren();
    appErrorTitle.textContent = baslik;
    appErrorText.textContent = metin;
    appErrorOpen.href = url;
    appError.hidden = false;
  }

  /**
   * Şirket ağı gerektiren uygulamalar (bkz. projects.js "intranet") için ön
   * yoklama. iframe'i kullanıcının tarayıcısı çektiği için sunucunun ağa
   * erişmesi gerekmez; kullanıcı şirket ağında değilse istek ağ hatasıyla
   * düşer ve iframe sessizce boş kalırdı - onun yerine açıklayıcı ekran.
   */
  async function erisimVarMi(url) {
    const durdurucu = new AbortController();
    const zaman = setTimeout(() => durdurucu.abort(), 7000);
    try {
      await fetch(url, { mode: "no-cors", cache: "no-store", signal: durdurucu.signal });
      return true;
    } catch {
      return false;
    } finally {
      clearTimeout(zaman);
    }
  }

  async function uygulamayiGoster(proje) {
    acikProje = proje;
    cerceveyiTemizle();

    appTitle.textContent = proje.name;
    appExternal.href = proje.url;
    appErrorOpen.href = proje.url;
    document.title = proje.name + " · Odyssey";
    document.documentElement.style.setProperty(
      "--active",
      ACCENT_RENK[proje.accent] || ACCENT_RENK.blue
    );

    appLoadingText.textContent = proje.name + " açılıyor…";
    appLoading.hidden = false;
    gorunum("app");

    if (proje.intranet && !(await erisimVarMi(proje.url))) {
      // Kullanıcı bu arada başka bir uygulamaya geçtiyse sonucu yok say.
      if (acikProje !== proje) return;
      hataGoster(
        "Şirket ağı gerekiyor",
        proje.name + " yalnızca Aksa şirket ağından (ofis ağı veya VPN) açılabiliyor. " +
          "Şu an bu ağda görünmüyorsunuz; bağlandıktan sonra tekrar deneyin.",
        proje.url
      );
      return;
    }
    if (acikProje !== proje) return;

    const frame = document.createElement("iframe");
    frame.className = "appframe__el";
    frame.title = proje.name;
    frame.src = proje.url;
    frame.setAttribute("allow", "clipboard-read; clipboard-write; fullscreen; downloads");
    frame.setAttribute("allowfullscreen", "");
    frame.addEventListener("load", () => {
      clearTimeout(yuklemeZamanlayici);
      appLoading.hidden = true;
      // Uygulama gec de olsa geldiyse (orn. Railway konteyneri soguktan
      // uyaniyorsa) "acilamadi" ekrani kendiliginden kalksin.
      appError.hidden = true;
    });
    appFrame.replaceChildren(frame);

    yuklemeZamanlayici = setTimeout(() => {
      if (appLoading.hidden) return;
      hataGoster(
        "Uygulama açılamadı",
        proje.name + " beklenen sürede yüklenmedi. Uygulama geçici olarak kapalı olabilir " +
          "ya da çerçeve içinde gösterilmesine izin vermiyor olabilir.",
        proje.url,
        false
      );
    }, 30000); // soguk baslayan konteynerler icin comert - gec gelirse load olayi hatayi kaldirir
  }

  /* ────────── Oturum ────────── */

  function kullaniciyiYaz(k) {
    kullanici = k;
    if (!k) {
      userBadge.hidden = true;
      return;
    }
    userName.textContent = k.fullName || k.sicil || "";
    userBadge.hidden = false;
  }

  async function baslat() {
    gorunum("splash");
    const sonuc = await AUTH.ben();

    if (sonuc.hata === "ag") {
      kullaniciyiYaz(null);
      ciz(location.pathname);
      loginError.textContent = "Sunucuya ulaşılamadı. Bağlantınızı kontrol edin.";
      loginError.hidden = false;
      return;
    }

    kullaniciyiYaz(sonuc.kullanici);
    ciz(location.pathname);
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const sicil = loginSicil.value.trim();
    const sifre = loginPassword.value;
    if (!sicil || !sifre) {
      loginError.textContent = "Sicil no ve şifre alanları zorunludur.";
      loginError.hidden = false;
      return;
    }

    loginError.hidden = true;
    loginSubmit.disabled = true;
    loginSubmit.textContent = "Giriş yapılıyor…";
    try {
      kullaniciyiYaz(await AUTH.giris(sicil, sifre));
      loginPassword.value = "";
      const yol = hedefRota && hedefRota !== "/" ? hedefRota : "/";
      history.replaceState({ odyssey: true }, "", yol);
      ciz(yol);
    } catch (err) {
      loginError.textContent = err.message || "Giriş yapılamadı.";
      loginError.hidden = false;
    } finally {
      loginSubmit.disabled = false;
      loginSubmit.textContent = "Giriş Yap";
    }
  });

  logoutBtn.addEventListener("click", async () => {
    await AUTH.cikis();
    kullaniciyiYaz(null);
    cerceveyiTemizle();
    acikProje = null;
    hedefRota = "/";
    history.replaceState({ odyssey: true }, "", "/");
    ciz("/");
  });

  /* ────────── Bağlantılar ve tuşlar ────────── */

  // Kart üzerindeki "Uygulamayı Aç" (bkz. main.js slideHTML) - ayrı sekme
  // AÇMAZ, aynı sekmede rota değiştirir.
  document.addEventListener("click", (e) => {
    // Yan karta tıklandığında main.js kartı ortaya alır ve olayı iptal eder -
    // o tıklama uygulamayı AÇMAMALI, sadece kartı seçmeli.
    if (e.defaultPrevented) return;

    const cta = e.target.closest("a[data-slug]");
    if (cta) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // yeni sekme isteği kullanıcının
      e.preventDefault();
      rotayaGit(cta.getAttribute("href"));
      return;
    }
    const eve = e.target.closest("a[data-home]");
    if (eve) {
      e.preventDefault();
      rotayaGit("/");
    }
  });

  appBack.addEventListener("click", () => rotayaGit("/"));
  appErrorBack.addEventListener("click", () => rotayaGit("/"));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !appView.hidden) rotayaGit("/");
  });

  window.addEventListener("popstate", () => ciz(location.pathname));

  baslat();

  return {
    ac(proje) {
      if (proje && proje.url) rotayaGit(ROTA_ONEKI + proje.slug);
    },
    hubdaMi() {
      return !hubView.hidden;
    },
  };
})();
