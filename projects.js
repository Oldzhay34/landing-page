/* ══════════════════════════════════════════════════
   Odyssey — proje kataloğu
   Tek veri kaynağı. Yeni proje eklemek için PROJECTS
   dizisine bir nesne ekleyin; sayfa kendini günceller.
   ══════════════════════════════════════════════════ */

/**
 * ADRESLER
 * ────────
 * Her proje için iki adres tutulur:
 *
 *   prod → yayındaki gerçek adres
 *   dev  → geliştiricinin kendi makinesindeki adres (test)
 *
 * Sayfa hangi sunucudan açıldığına bakarak doğru adresi seçer:
 * localhost/127.0.0.1 ise dev, aksi hâlde prod.
 *
 * "/" ile BAŞLAYAN adresler aynı origin'de, yani Odyssey'in kendi sunucusu
 * üzerinden servis edilir (bkz. nginx.conf, yerelde dev-server.js). Bu bilerek
 * böyle: oturum çerezi Odyssey'in origin'ine yazılıyor ve iframe içindeki
 * uygulama da aynı origin'de olduğu için çerez first-party kalıyor - ayrı bir
 * *.up.railway.app alt alan adı olsaydı tarayıcı onu üçüncü taraf sayıp
 * oturumu iframe içinde düşürürdü.
 */
const ADRESLER = {
  "sunum-editoru": {
    prod: "https://presentation-layout-production-feb6.up.railway.app",
    dev: "http://localhost:3000",
  },
  "po-sunum": {
    // Odyssey nginx'i /kapasite/ yolunu uygulamanın frontend'ine proxy'ler -
    // ayrı bir alan adı KULLANILMAZ (bkz. yukarıdaki not).
    prod: "/kapasite/",
    // Yerelde de aynı yol geçerli: dev-server.js bu öneki uzak (ya da
    // KAPASITE_HOST ile gösterilen yerel) uygulamaya proxy'ler, böylece kabuk
    // yayındakiyle aynı şekilde tek origin üzerinden denenebilir.
    dev: "/kapasite/",
  },
  "aksa-board": {
    prod: "https://aksa-board-production.up.railway.app",
    dev: "http://localhost:3010",
  },
  "izin-takvimi": {
    prod: "https://izin-takvimi-production.up.railway.app",
    dev: "https://izin-takvimi-production.up.railway.app",
  },
  retroinsight: {
    prod: "https://retroinsight.aksa.com.tr/",
    dev: "https://retroinsight.aksa.com.tr/",
  },
};

const YEREL_MI = ["localhost", "127.0.0.1", ""].includes(location.hostname);

function adres(id) {
  const a = ADRESLER[id];
  if (!a) return "";
  return (YEREL_MI ? a.dev : a.prod) || "";
}

/**
 * status: "live" (yayında) | "dev" (geliştiriliyor) | "soon" (planlanıyor)
 * accent: blue | green | violet | amber | teal
 * icon:   presentation | dashboard | board | calendar | spark | plus
 * slug:   Odyssey içindeki rota - /uygulama/<slug> (bkz. shell.js). Adres
 *         çubuğunda görünür; geri tuşu bu rotadan merkeze döner.
 * intranet: true ise uygulama yalnızca Aksa şirket ağından erişilebilir.
 *         iframe'i kullanıcının TARAYICISI çeker (Odyssey sunucusu değil),
 *         yani şirket ağındaki kullanıcıda çalışır, dışarıdakinde çalışmaz -
 *         shell.js bu bayrağa bakıp önce erişim yoklaması yapar ve
 *         erişilemiyorsa boş çerçeve yerine açıklayıcı bir ekran gösterir.
 * preview: kartın içindeki küçük, temsili arayüz önizlemesi (inline SVG,
 *   gerçek ekran görüntüsü değil) - currentColor kullanır, kartın accent
 *   rengini otomatik alır (bkz. styles.css .slide__preview).
 */
const PROJECTS = [
  {
    id: "sunum-editoru",
    slug: "sunum",
    name: "Proje Sunum Editörü",
    tagline: "Excel portföyünden yönetim sunumu",
    description:
      "Proje portföyünü sunuma hazır statü kartlarına çevirir, tek tıkla PPTX olarak indirir.",
    status: "live",
    url: adres("sunum-editoru"),
    accent: "blue",
    icon: "presentation",
    preview: `<svg viewBox="0 0 260 78" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="16" width="70" height="8" rx="4" fill="currentColor" opacity=".55"/>
      <rect x="16" y="32" width="120" height="5" rx="2.5" fill="currentColor" opacity=".3"/>
      <rect x="16" y="43" width="95" height="5" rx="2.5" fill="currentColor" opacity=".3"/>
      <rect x="16" y="54" width="60" height="5" rx="2.5" fill="currentColor" opacity=".3"/>
      <rect x="170" y="46" width="12" height="24" rx="2" fill="currentColor" opacity=".35"/>
      <rect x="188" y="34" width="12" height="36" rx="2" fill="currentColor" opacity=".55"/>
      <rect x="206" y="24" width="12" height="46" rx="2" fill="currentColor" opacity=".75"/>
      <rect x="224" y="40" width="12" height="30" rx="2" fill="currentColor" opacity=".45"/>
    </svg>`,
  },
  {
    id: "po-sunum",
    slug: "kapasite",
    name: "PO Sprint Sunumu Hazırlayıcı",
    tagline: "Sprint sunumu ve ekip kapasite panosu",
    description:
      "Sprint içeriğini ve ekip kapasite dağılımını hazırlar, sunuma hazır slaytları tek tıkla üretir.",
    status: "live",
    url: adres("po-sunum"),
    accent: "green",
    icon: "dashboard",
    preview: `<svg viewBox="0 0 260 78" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="16" y1="30" x2="164" y2="30" stroke="currentColor" stroke-opacity=".35" stroke-dasharray="4 4"/>
      <rect x="24" y="38" width="16" height="32" rx="3" fill="currentColor" opacity=".4"/>
      <rect x="52" y="20" width="16" height="50" rx="3" fill="currentColor" opacity=".8"/>
      <rect x="80" y="44" width="16" height="26" rx="3" fill="currentColor" opacity=".35"/>
      <rect x="108" y="14" width="16" height="56" rx="3" fill="currentColor" opacity=".85"/>
      <rect x="136" y="34" width="16" height="36" rx="3" fill="currentColor" opacity=".5"/>
      <circle cx="196" cy="30" r="15" stroke="currentColor" stroke-opacity=".4" stroke-width="4"/>
      <path d="M196 30 L196 17 A13 13 0 0 1 207 36 Z" fill="currentColor" opacity=".7"/>
      <rect x="182" y="54" width="46" height="6" rx="3" fill="currentColor" opacity=".3"/>
      <rect x="182" y="64" width="30" height="6" rx="3" fill="currentColor" opacity=".22"/>
    </svg>`,
  },
  {
    id: "aksa-board",
    slug: "board",
    name: "Aksa Board",
    tagline: "Jira takım panosu",
    description:
      "Ekiplerin Jira sprint durumunu, doluluk ve KPI'larını tek panoda canlı gösterir.",
    status: "live",
    url: adres("aksa-board"),
    accent: "teal",
    icon: "board",
    preview: `<svg viewBox="0 0 260 78" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="12" width="68" height="54" rx="6" stroke="currentColor" stroke-opacity=".35"/>
      <rect x="26" y="20" width="52" height="9" rx="3" fill="currentColor" opacity=".55"/>
      <rect x="26" y="34" width="52" height="9" rx="3" fill="currentColor" opacity=".3"/>
      <rect x="96" y="12" width="68" height="54" rx="6" stroke="currentColor" stroke-opacity=".35"/>
      <rect x="104" y="20" width="52" height="9" rx="3" fill="currentColor" opacity=".75"/>
      <rect x="104" y="34" width="52" height="9" rx="3" fill="currentColor" opacity=".3"/>
      <rect x="104" y="48" width="34" height="9" rx="3" fill="currentColor" opacity=".22"/>
      <rect x="174" y="12" width="68" height="54" rx="6" stroke="currentColor" stroke-opacity=".35"/>
      <rect x="182" y="20" width="52" height="9" rx="3" fill="currentColor" opacity=".4"/>
      <circle cx="208" cy="46" r="11" stroke="currentColor" stroke-opacity=".45" stroke-width="3"/>
      <path d="M208 46 L208 35 A11 11 0 0 1 217 51 Z" fill="currentColor" opacity=".7"/>
    </svg>`,
  },
  {
    id: "retroinsight",
    slug: "retroinsight",
    name: "RetroInsight",
    tagline: "Sprint retrospektif içgörüleri",
    description:
      "Retrospektif çıktılarını toplayıp ekiplerin gelişim eğilimini gösterir. Yalnızca Aksa şirket ağından erişilebilir.",
    status: "live",
    url: adres("retroinsight"),
    intranet: true,
    accent: "amber",
    icon: "spark",
    preview: `<svg viewBox="0 0 260 78" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 62 L58 44 L96 52 L134 26 L172 34 L212 14" stroke="currentColor" stroke-opacity=".75" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="58" cy="44" r="4" fill="currentColor" opacity=".7"/>
      <circle cx="134" cy="26" r="4" fill="currentColor" opacity=".7"/>
      <circle cx="212" cy="14" r="5" fill="currentColor" opacity=".9"/>
      <rect x="18" y="68" width="46" height="5" rx="2.5" fill="currentColor" opacity=".28"/>
      <rect x="72" y="68" width="34" height="5" rx="2.5" fill="currentColor" opacity=".2"/>
      <rect x="114" y="68" width="42" height="5" rx="2.5" fill="currentColor" opacity=".2"/>
    </svg>`,
  },
  {
    id: "izin-takvimi",
    slug: "izin",
    name: "Aksa İzin Takvimi",
    tagline: "Departman izin planlaması",
    description:
      "Yıllık izin takvimi - kimin ne zaman izinde olduğunu tek ekranda gösterir.",
    status: "live",
    url: adres("izin-takvimi"),
    accent: "violet",
    icon: "calendar",
    preview: `<svg viewBox="0 0 260 78" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="16" width="220" height="12" rx="4" fill="currentColor" opacity=".16"/>
      <circle cx="30" cy="22" r="3" fill="currentColor" opacity=".5"/>
      <rect x="20" y="38" width="24" height="18" rx="3" fill="currentColor" opacity=".16"/>
      <rect x="48" y="38" width="24" height="18" rx="3" fill="currentColor" opacity=".16"/>
      <rect x="76" y="38" width="24" height="18" rx="3" fill="currentColor" opacity=".55"/>
      <rect x="104" y="38" width="24" height="18" rx="3" fill="currentColor" opacity=".55"/>
      <rect x="132" y="38" width="24" height="18" rx="3" fill="currentColor" opacity=".16"/>
      <rect x="160" y="38" width="24" height="18" rx="3" fill="currentColor" opacity=".16"/>
      <rect x="188" y="38" width="24" height="18" rx="3" fill="currentColor" opacity=".16"/>
      <rect x="20" y="60" width="24" height="18" rx="3" fill="currentColor" opacity=".16"/>
      <rect x="48" y="60" width="24" height="18" rx="3" fill="currentColor" opacity=".16"/>
      <rect x="76" y="60" width="24" height="18" rx="3" fill="currentColor" opacity=".16"/>
      <rect x="104" y="60" width="24" height="18" rx="3" fill="currentColor" opacity=".16"/>
      <rect x="132" y="60" width="24" height="18" rx="3" fill="currentColor" opacity=".16"/>
      <rect x="160" y="60" width="24" height="18" rx="3" fill="currentColor" opacity=".16"/>
      <rect x="188" y="60" width="24" height="18" rx="3" fill="currentColor" opacity=".16"/>
    </svg>`,
  },
];

const STATUS_META = {
  live: { label: "Yayında", tone: "live" },
  dev: { label: "Geliştiriliyor", tone: "dev" },
  soon: { label: "Planlanıyor", tone: "soon" },
};

const ICONS = {
  presentation:
    '<rect x="3" y="4" width="18" height="13" rx="1.6"/><path d="M8 21h8M12 17v4M7.5 13.5l3-3.5 2.5 2.5 3.5-4.5" stroke-linecap="round" stroke-linejoin="round"/>',
  dashboard:
    '<rect x="3" y="3" width="8" height="9" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5"/><rect x="3" y="14" width="8" height="7" rx="1.5"/>',
  board:
    '<rect x="3" y="4" width="5.5" height="16" rx="1.4"/><rect x="9.25" y="4" width="5.5" height="11" rx="1.4"/><rect x="15.5" y="4" width="5.5" height="14" rx="1.4"/>',
  spark: '<path d="M12 3l2.2 5.6L20 11l-5.8 2.4L12 19l-2.2-5.6L4 11l5.8-2.4L12 3Z" stroke-linejoin="round"/>',
  plus: '<circle cx="12" cy="12" r="9"/><path d="M12 8.2v7.6M8.2 12h7.6" stroke-linecap="round"/>',
  calendar:
    '<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4" stroke-linecap="round"/><rect x="7.3" y="12.5" width="3" height="3" rx=".6" fill="currentColor" stroke="none"/><rect x="13.7" y="12.5" width="3" height="3" rx=".6" fill="currentColor" stroke="none"/>',
};

/** slug → proje (shell.js rota çözümü için). */
function projeBul(slug) {
  return PROJECTS.find((p) => p.slug === slug) || null;
}
