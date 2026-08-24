package com.aksa.odyssey.auth.adapter.out.persistence;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * users tablosu - sicil no dogal anahtar (kurum genelinde tekil).
 * Cok takimli PO'lar icin ikinci bir tablo (user_team_ids) tutulur.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserJpaEntity {

    @Id
    @Column(name = "sicil", nullable = false, length = 32)
    private String sicil;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "role", nullable = false, length = 16)
    private String role;

    @Column(name = "team_id")
    private Long teamId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_team_ids", joinColumns = @JoinColumn(name = "sicil"))
    @Column(name = "team_id", nullable = false)
    private List<Long> teamIds = new ArrayList<>();

    @Column(name = "company")
    private String company;

    @Column(name = "department")
    private String department;

    @Column(name = "title")
    private String title;

    @Column(name = "extension_attribute4")
    private String extensionAttribute4;

    @Column(name = "extension_attribute6")
    private String extensionAttribute6;

    @Column(name = "extension_attribute8")
    private String extensionAttribute8;
}
