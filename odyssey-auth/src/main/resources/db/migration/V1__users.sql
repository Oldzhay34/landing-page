-- Odyssey kullanici tablosu.
--
-- Kullanicilar bu servise tasinana kadar Capacity Planner backend'inde bellek
-- ici sabit bir listede duruyordu (MockUserRepositoryAdapter) - yani uygulama
-- her yeniden basladiginda profil degisiklikleri kayboluyordu. Artik kalici.
--
-- sicil dogal anahtar: kurum genelinde tekil ve kullanici zaten onunla giris
-- yapiyor, ayri bir teknik id tutmanin faydasi yok.
CREATE TABLE users (
    sicil                 VARCHAR(32)  PRIMARY KEY,
    password_hash         VARCHAR(255) NOT NULL,
    full_name             VARCHAR(255) NOT NULL,
    role                  VARCHAR(16)  NOT NULL,
    -- PO'nun varsayilan/ana takimi; ADMIN icin NULL (tum takimlarda yetkili).
    team_id               BIGINT,
    company               VARCHAR(255),
    department            VARCHAR(255),
    title                 VARCHAR(255),
    extension_attribute4  VARCHAR(255),
    extension_attribute6  VARCHAR(255),
    extension_attribute8  VARCHAR(255),
    created_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT users_role_check CHECK (role IN ('ADMIN', 'PO'))
);

-- Birden fazla takima duzenleme yetkisi olan PO'lar (orn. iki ekibi birlikte
-- yuruten kisiler). team_id her zaman bu listenin bir elemani olmalidir.
CREATE TABLE user_team_ids (
    sicil    VARCHAR(32) NOT NULL REFERENCES users (sicil) ON DELETE CASCADE,
    team_id  BIGINT      NOT NULL,
    PRIMARY KEY (sicil, team_id)
);

CREATE INDEX idx_users_team_id ON users (team_id);
