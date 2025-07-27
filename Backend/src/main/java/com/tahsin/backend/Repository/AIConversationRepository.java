package com.tahsin.backend.Repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import com.tahsin.backend.Model.AIConversation;
import com.tahsin.backend.Model.User;

@Repository
@Component
public interface AIConversationRepository extends JpaRepository<AIConversation, Long> {
    List<AIConversation> findByUser(User user);
    
    @Query("SELECT c FROM AIConversation c WHERE c.lastActivity < :cutoff")
    List<AIConversation> findInactiveConversations(@Param("cutoff") LocalDateTime cutoff);
}
