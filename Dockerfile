# Statik site (build adimi yok) - dosyalar oldugu gibi nginx'e kopyalanir.
FROM nginx:1.27-alpine
COPY . /usr/share/nginx/html

# nginx'in resmi entrypoint'i /etc/nginx/templates/*.template dosyalarini
# baslangicta envsubst ile isleyip conf.d/'ye yazar - upstream adresleri
# (BACKEND_HOST / KAPASITE_HOST) boylece Railway degiskenlerinden gelir,
# imaji yeniden derlemeden degistirilebilir.
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Web kokune dusmemesi gereken dosyalar (yukaridaki "COPY ." hepsini alir).
RUN rm -f /usr/share/nginx/html/nginx.conf \
          /usr/share/nginx/html/Dockerfile \
          /usr/share/nginx/html/.dockerignore \
          /usr/share/nginx/html/README.md

# Railway'de Variables bolumunden ezilir; buradaki degerler yalnizca
# yerelde "docker run" ile denemek icin makul varsayilanlar.
ENV AUTH_HOST=odyssey-auth-production.up.railway.app
ENV BACKEND_HOST=backend-production-4113.up.railway.app
ENV KAPASITE_HOST=frontend-production-34b01.up.railway.app

EXPOSE 80
