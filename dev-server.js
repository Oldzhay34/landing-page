/* ══════════════════════════════════════════════════
   Odyssey — YEREL geliştirme sunucusu (bağımlılık yok)
   ──────────────────────────────────────────────────
   Yayında bu işi nginx yapıyor (bkz. nginx.conf); burada aynı yönlendirmeleri
   Node ile taklit ediyoruz ki kabuğu (giriş + rota + iframe) yerelde tek
   origin üzerinden, gerçek backend'e karşı deneyebilelim:

     /api/auth/...  → AUTH_HOST         (odyssey-auth: giriş / oturum)
     /api/...       → BACKEND_HOST      (Capacity Planner API)
     /kapasite/...  → KAPASITE_HOST     (PO Sprint Sunumu Hazırlayıcı)
     diğer          → bu klasördeki statik dosyalar, bulunamazsa index.html

   Çalıştırma:  node dev-server.js        (varsayılan port 4173)
   ══════════════════════════════════════════════════ */

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 4173);
const BACKEND_HOST = process.env.BACKEND_HOST || "backend-production-4113.up.railway.app";
const AUTH_HOST = process.env.AUTH_HOST || "odyssey-auth-production.up.railway.app";
const KAPASITE_HOST = process.env.KAPASITE_HOST || "frontend-production-34b01.up.railway.app";
const KOK = __dirname;

const TIPLER = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
};

function proxy(req, res, host, yol) {
  const istek = https.request(
    {
      host,
      port: 443,
      path: yol,
      method: req.method,
      headers: { ...req.headers, host },
    },
    (yanit) => {
      res.writeHead(yanit.statusCode || 502, yanit.headers);
      yanit.pipe(res);
    }
  );
  istek.on("error", (err) => {
    res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Proxy hatası (" + host + "): " + err.message);
  });
  req.pipe(istek);
}

function statik(res, dosya) {
  fs.readFile(dosya, (err, veri) => {
    if (err) {
      // Rota (örn. /uygulama/kapasite) dosya değil - kabuk index.html'i çözer.
      fs.readFile(path.join(KOK, "index.html"), (e2, html) => {
        if (e2) {
          res.writeHead(404).end("Bulunamadı");
          return;
        }
        res.writeHead(200, { "Content-Type": TIPLER[".html"], "Cache-Control": "no-store" });
        res.end(html);
      });
      return;
    }
    res.writeHead(200, {
      "Content-Type": TIPLER[path.extname(dosya)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(veri);
  });
}

http
  .createServer((req, res) => {
    const url = req.url || "/";

    // ODYSSEY_STUB_AUTH=1 → oturum sorgusuna sahte kullanıcı döner. Yalnızca
    // kabuğu (rota, iframe, geri tuşu) backend'e hiç bağlanmadan denemek için;
    // gerçek giriş yine backend'e gider.
    if (process.env.ODYSSEY_STUB_AUTH === "1" && url === "/api/auth/me") {
      res.writeHead(200, { "Content-Type": TIPLER[".json"] });
      res.end(JSON.stringify({ sicil: "00000", fullName: "Yerel Deneme", role: "PO", teamId: 1 }));
      return;
    }

    // /api/auth/... → odyssey-auth servisi. Yayindaki nginx.conf'ta bu kural
    // ZATEN vardi (location /api/auth/ → $auth_ust); bu dosya ise kimlik
    // dogrulama Capacity Planner backend'inden ayrilmadan once yazildigi icin
    // TUM /api'yi backend'e gonderiyordu. Backend'de artik /api/auth/** yok
    // (bkz. SecurityConfig: "Odyssey o yolu odyssey-auth servisine
    // proxy'liyor"), bu yuzden yerelde giris denemesi 401 donup "Sicil no veya
    // sifre hatali" gorunuyordu. Sira ONEMLI: bu kural genel /api kuralindan
    // ONCE gelmeli.
    if (url.startsWith("/api/auth/")) {
      proxy(req, res, AUTH_HOST, url);
      return;
    }
    if (url.startsWith("/api/")) {
      proxy(req, res, BACKEND_HOST, url);
      return;
    }
    if (url === "/kapasite") {
      res.writeHead(301, { Location: "/kapasite/" }).end();
      return;
    }
    if (url.startsWith("/kapasite/")) {
      proxy(req, res, KAPASITE_HOST, url.slice("/kapasite".length));
      return;
    }

    const temiz = decodeURIComponent(url.split("?")[0]);
    const dosya = path.join(KOK, temiz === "/" ? "index.html" : temiz);
    // Klasör dışına çıkmayı engelle (../ ile).
    if (!dosya.startsWith(KOK)) {
      res.writeHead(403).end("Yasak");
      return;
    }
    statik(res, dosya);
  })
  .listen(PORT, () => {
    console.log("Odyssey (yerel): http://localhost:" + PORT);
    console.log("  /api/auth → " + AUTH_HOST);
    console.log("  /api      → " + BACKEND_HOST);
    console.log("  /kapasite → " + KAPASITE_HOST);
  });
