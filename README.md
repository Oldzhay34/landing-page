# Odyssey

Aksa'nın kurum içi uygulamalarına tek noktadan erişim sağlayan **dış kabuk**.
Kimlik doğrulama burada yapılır; uygulamalar aynı sekmede, iframe içinde açılır.

Tasarım kararı: **kaydırma yok**. Sayfa tek ekrana sığar; uygulamalar ortada odaklanan,
sağa sola kayan bir vitrinde (coverflow) durur. Ortadaki kart net, yandakiler hafif blurlu.

## Nasıl çalışıyor?

```
                    ┌──────────────────────────────────────────┐
  tarayıcı  ───────▶│  Odyssey (nginx)                         │
                    │   /            → giriş + uygulama merkezi │
                    │   /uygulama/…  → iframe görünümü          │
                    │   /api/…       → proxy: backend           │
                    │   /kapasite/…  → proxy: PO Sprint Sunumu  │
                    └──────────────────────────────────────────┘
```

Üç kural:

1. **Ayrı sekme yok.** Karttaki "Uygulamayı Aç" `history.pushState` ile
   `/uygulama/<slug>` rotasına geçer, uygulama iframe içinde açılır. Tarayıcının
   geri tuşu merkeze (hub) döndürür.
2. **Giriş dışarıda.** Sicil/şifre ekranı artık alt uygulamaların içinde değil,
   burada (`index.html` + [`auth.js`](auth.js)). Backend'in yazdığı httpOnly çerez
   Odyssey'in origin'ine düşer.
3. **Tek origin.** Bu yüzden `/api` ve `/kapasite` ayrı alan adlarına değil, bu
   nginx üzerinden proxy'lenir (bkz. [`nginx.conf`](nginx.conf)). Alt uygulama
   iframe içinde başka bir `*.up.railway.app` adresinden gelseydi tarayıcı çerezi
   "üçüncü taraf" sayıp oturumu düşürürdü.

## Uygulama adresleri (önemli)

Adresler tek yerden yönetilir: [`projects.js`](projects.js) içindeki `ADRESLER` nesnesi.
Her uygulama için `prod` ve `dev` adresi tutulur; sayfa `localhost` üzerinden açıldıysa
`dev`, aksi hâlde `prod` kullanılır.

`/` ile başlayan adresler **aynı origin** demektir; nginx (yayında) veya
`dev-server.js` (yerelde) onları ilgili uygulamaya proxy'ler.

| Uygulama | Adres | Nasıl gömülü |
|---|---|---|
| Proje Sunum Editörü | `presentation-layout-…up.railway.app` | çapraz origin iframe |
| PO Sprint Sunumu Hazırlayıcı | `/kapasite/` | aynı origin (proxy) |
| RetroInsight | `retroinsight.aksa.com.tr` | çapraz origin iframe, **şirket ağı gerekir** |
| Aksa İzin Takvimi | — | henüz yayında değil |

### Şirket ağı gerektiren uygulamalar

`intranet: true` işaretli kartlarda iframe'i **kullanıcının tarayıcısı** çeker; Odyssey
sunucusunun şirket ağına erişmesi gerekmez. Kullanıcı ofis ağında/VPN'de değilse
[`shell.js`](shell.js) önce kısa bir erişim yoklaması yapar ve boş çerçeve yerine
"Şirket ağı gerekiyor" ekranını gösterir.

## Ortam değişkenleri (Railway)

| Değişken | Örnek | Ne işe yarar |
|---|---|---|
| `BACKEND_HOST` | `backend-production-4113.up.railway.app` | `/api/…` proxy hedefi |
| `KAPASITE_HOST` | `frontend-production-34b01.up.railway.app` | `/kapasite/…` proxy hedefi |

Bu değerler konteyner açılırken `envsubst` ile `nginx.conf` şablonuna yazılır
(bkz. [`Dockerfile`](Dockerfile)).

Backend tarafında ayrıca **Odyssey alan adının** `APP_CORS_ALLOWED_ORIGINS` listesinde
olması gerekir: proxy, tarayıcının gönderdiği `Origin` başlığını (Odyssey alan adı)
backend'e iletir; listede değilse `POST /api/auth/login` 403 döner.

## Yerelde çalıştırma

```bash
node dev-server.js
```

`http://localhost:4173` — statik dosyaları servis eder, `/api` ve `/kapasite`
isteklerini yayındaki servislere proxy'ler (yayındaki nginx davranışının aynısı).
Farklı hedefler için `BACKEND_HOST` / `KAPASITE_HOST` değişkenlerini verin.

## Gezinme yolları

| Yol | Ne yapar |
|---|---|
| Sürükle / kaydır | Kartları çevirir (fare veya dokunmatik) |
| `←` `→` | Önceki / sonraki uygulama |
| `Enter` | Ortadaki uygulamayı açar |
| `1`–`4` | Doğrudan o uygulamaya atlar |
| `Esc` | Açık uygulamadan merkeze döner |
| Yan karta tıklama | O kartı ortaya alır |
| Shift + tekerlek | Kartları çevirir |

Vitrin döngüseldir ve 7 saniyede bir kendiliğinden ilerler; fare üzerine gelince ve
uygulama görünümündeyken durur.

## Dosyalar

| Dosya | İçerik |
|---|---|
| `index.html` | Üç görünümün iskeleti: giriş, uygulama merkezi, iframe çerçevesi |
| `projects.js` | **Uygulama kataloğu ve adresler** — tek veri kaynağı |
| `auth.js` | Oturum katmanı (`/api/auth` login / me / refresh / logout) |
| `shell.js` | Oturum kapısı, rota (`/uygulama/<slug>`), iframe yönetimi |
| `main.js` | Vitrin motoru (konumlandırma, sürükleme, klavye), arka plan ağı |
| `styles.css` | Tema, animasyonlar, tek ekran düzeni |
| `shell.css` | Giriş ekranı, açılış perdesi, uygulama çerçevesi |
| `nginx.conf` | Yayındaki proxy düzeni (envsubst şablonu) |
| `dev-server.js` | Yereldeki eşdeğeri (bağımlılıksız Node) |
| `assets/` | Aksa ve Kazancı Holding logoları |

## Yeni uygulama ekleme

1. Adresi `ADRESLER` nesnesine ekleyin (`prod` + `dev`).
2. `PROJECTS` dizisine bir nesne ekleyin:

```js
{
  id: "yeni-uygulama",
  slug: "yeni",                // /uygulama/yeni rotası
  name: "Uygulama Adı",
  tagline: "Tek satırlık tanım",
  description: "Kısa açıklama.",
  status: "live",              // live | dev | soon
  url: adres("yeni-uygulama"), // boş bırakılırsa kart "Yakında" olur
  intranet: false,             // true ise şirket ağı yoklaması yapılır
  accent: "blue",              // blue | green | violet | amber
  icon: "dashboard",           // presentation | dashboard | spark | plus | calendar
}
```

Kartlar, noktalar, sayaç ve klavye kısayolları listeye göre kendiliğinden güncellenir.

Uygulamanın iframe içinde açılabilmesi için **kendi tarafında** `X-Frame-Options`
göndermemesi (ya da `Content-Security-Policy: frame-ancestors` ile Odyssey'e izin
vermesi) gerekir. Oturumu olan bir uygulama ekleniyorsa onu ayrı alan adı yerine
`/…` yolu üzerinden proxy'lemek en sağlıklısı.

## Tema

Kurumsal renkler `assets/aksa-blok.svg` içindeki resmî değerlerden alındı ve
`styles.css` içinde `:root` altında tanımlıdır:

```css
--aksa-blue:  #0075bf;
--aksa-green: #9bcd65;
```
