package com.aksa.odyssey.auth.adapter.out.persistence;

import com.aksa.odyssey.auth.domain.AuthUser;
import com.aksa.odyssey.auth.domain.Role;
import com.aksa.odyssey.auth.port.out.UserRepositoryPort;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * UserRepositoryPort'un kalici (Postgres) uygulamasi. Onceki bellek ici mock
 * adaptorun yerini alir - cagiran taraf (SessionService/ProfileService)
 * degismedi, sadece kaynak degisti.
 */
@Component
public class UserPersistenceAdapter implements UserRepositoryPort {

    private final UserJpaRepository repository;

    public UserPersistenceAdapter(UserJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AuthUser> findBySicil(String sicil) {
        return repository.findById(sicil).map(UserPersistenceAdapter::toDomain);
    }

    @Override
    @Transactional
    public void save(AuthUser user) {
        UserJpaEntity entity = repository.findById(user.getSicil()).orElseGet(UserJpaEntity::new);
        entity.setSicil(user.getSicil());
        entity.setPasswordHash(user.getPasswordHash());
        entity.setFullName(user.getFullName());
        entity.setRole(user.getRole().name());
        entity.setTeamId(user.getTeamId());
        entity.setTeamIds(user.getTeamIds() == null ? new ArrayList<>() : new ArrayList<>(user.getTeamIds()));
        entity.setCompany(user.getCompany());
        entity.setDepartment(user.getDepartment());
        entity.setTitle(user.getTitle());
        entity.setExtensionAttribute4(user.getExtensionAttribute4());
        entity.setExtensionAttribute6(user.getExtensionAttribute6());
        entity.setExtensionAttribute8(user.getExtensionAttribute8());
        repository.save(entity);
    }

    private static AuthUser toDomain(UserJpaEntity e) {
        List<Long> teamIds = e.getTeamIds() == null ? List.of() : List.copyOf(e.getTeamIds());
        return new AuthUser(
                e.getSicil(),
                e.getPasswordHash(),
                e.getFullName(),
                Role.valueOf(e.getRole()),
                e.getTeamId(),
                teamIds,
                e.getCompany(),
                e.getDepartment(),
                e.getTitle(),
                e.getExtensionAttribute4(),
                e.getExtensionAttribute6(),
                e.getExtensionAttribute8());
    }
}
