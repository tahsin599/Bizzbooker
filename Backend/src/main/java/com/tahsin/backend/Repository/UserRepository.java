package com.tahsin.backend.Repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import com.tahsin.backend.Model.Business;
import com.tahsin.backend.Model.Role;
import com.tahsin.backend.Model.User;


@Repository
@Component
public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
    User findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    List<User> findByRole(Role role);
    
    @Query("SELECT u FROM User u WHERE u.name LIKE %:query% OR u.email LIKE %:query%")
    List<User> searchUsers(@Param("query") String query);
    
    @Modifying
    @Query("UPDATE User u SET u.password = :newPassword WHERE u.id = :userId")
    void updatePassword(@Param("userId") Long userId, @Param("newPassword") String newPassword);
     
    
}
