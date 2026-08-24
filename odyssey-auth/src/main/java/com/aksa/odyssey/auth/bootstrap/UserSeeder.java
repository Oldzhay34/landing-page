package com.aksa.odyssey.auth.bootstrap;

import com.aksa.odyssey.auth.adapter.out.persistence.UserJpaEntity;
import com.aksa.odyssey.auth.adapter.out.persistence.UserJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.ApplicationArguments;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Ilk acilista kullanici tablosunu, servisin cikarildigi andaki hesaplarla
 * doldurur (bkz. Capacity Planner MockUserRepositoryAdapter) - aksi halde
 * gecisin hemen ardindan HIC KIMSE giris yapamazdi.
 *
 * SADECE tablo bosken calisir: sonraki acilislarda hicbir sey yazmaz, yani
 * kullanicilarin degistirdigi profil/sifre ezilmez. Yeni kullanicilar
 * buraya EKLENMEZ - tabloya (ya da ileride AD/personel entegrasyonuyla)
 * eklenir; burasi yalnizca ilk tohumlama.
 *
 * Sifreler tasima aninda oldugu gibi birakildi: kullanicilarin bildikleri
 * sifrelerle girmeye devam etmesi icin. Kalici bir tabloya gectigimize gore
 * bir sonraki adim, bu baslangic sifrelerinin degistirilmesini zorunlu
 * kilmak olmali.
 */
@Component
public class UserSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(UserSeeder.class);

    private final UserJpaRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UserSeeder(UserJpaRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (repository.count() > 0) {
            return;
        }

        List<UserJpaEntity> baslangic = List.of(
                kullanici("admin", "admin123", "Admin Kullanıcı", "ADMIN", null, List.of(),
                        "Bilgi Teknolojileri", "Sistem Yöneticisi", "Yönetici", "Sistem Yöneticisi", "1000"),
                kullanici("10001", "po123", "PO Bir", "PO", 1L, List.of(1L),
                        "RPA Ekibi", "Kıdemli Ürün Sorumlusu", "Uzman", "Kıdemli Ürün Sorumlusu", "2010"),
                kullanici("10002", "po123", "PO İki", "PO", 2L, List.of(2L),
                        "İş Zekası Ekibi", "Ürün Sorumlusu", "Uzman", "Ürün Sorumlusu", "2020"),
                kullanici("29547", "123456", "Gözde Son", "PO", 3L, List.of(3L),
                        "Ürün Geliştirme Ekibi", "", "", "", ""),
                kullanici("30816", "123456", "Ece Sena Salan", "PO", 2L, List.of(2L),
                        "İş Zekası Ekibi", "", "", "", ""),
                kullanici("33603", "123456", "Muaz Furkan", "PO", 4L, List.of(4L),
                        "Yapay Zeka Ekibi", "", "", "", ""),
                kullanici("25493", "123456", "Alican Özekinci", "PO", 6L, List.of(6L),
                        "Doküman ve Süreç Yönetim Sistemi Ekibi", "", "", "", ""),
                kullanici("35840", "123456", "Züleyha Kadeş Tanrıverdi", "PO", 5L, List.of(5L, 7L, 8L),
                        "Dijital Uygulamalar Ekibi", "", "", "", ""),
                kullanici("37547", "123456", "Pelinsu Çevikel", "PO", 1L, List.of(1L),
                        "RPA Ekibi", "", "", "", ""),
                kullanici("35834", "123456", "Büşra Can", "PO", 5L, List.of(5L, 7L),
                        "Dijital Uygulamalar Ekibi", "", "", "", "")
        );

        repository.saveAll(baslangic);
        log.info("Kullanici tablosu bostu - {} baslangic hesabi olusturuldu.", baslangic.size());
    }

    private UserJpaEntity kullanici(String sicil, String sifre, String adSoyad, String rol, Long teamId,
                                    List<Long> teamIds, String departman, String unvan,
                                    String ext4, String ext6, String ext8) {
        UserJpaEntity e = new UserJpaEntity();
        e.setSicil(sicil);
        e.setPasswordHash(passwordEncoder.encode(sifre));
        e.setFullName(adSoyad);
        e.setRole(rol);
        e.setTeamId(teamId);
        e.setTeamIds(new java.util.ArrayList<>(teamIds));
        e.setCompany("AKSA Enerji");
        e.setDepartment(departman);
        e.setTitle(unvan);
        e.setExtensionAttribute4(ext4);
        e.setExtensionAttribute6(ext6);
        e.setExtensionAttribute8(ext8);
        return e;
    }
}
