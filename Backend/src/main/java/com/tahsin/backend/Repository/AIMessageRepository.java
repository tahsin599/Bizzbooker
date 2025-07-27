package com.tahsin.backend.Repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import com.tahsin.backend.Model.AIConversation;
import com.tahsin.backend.Model.AIMessage;

@Repository
@Component
public interface AIMessageRepository extends JpaRepository<AIMessage, Long> {
    List<AIMessage> findByConversation(AIConversation conversation);
    
    @Query("SELECT m FROM AIMessage m WHERE m.conversation.id = :conversationId ORDER BY m.createdAt DESC")
    List<AIMessage> findLatestMessages(@Param("conversationId") Long conversationId);

    Page<AIMessage> findByConversationIdOrderByCreatedAtDesc(Long conversationId, Pageable pageable);
    Page<AIMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId, Pageable pageable);
}
