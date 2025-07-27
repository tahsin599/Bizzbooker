package com.tahsin.backend.Service;

import com.tahsin.backend.Model.AIMessage;
import com.tahsin.backend.Repository.AIMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@Service
public class AIMessageService {

    private final AIMessageRepository messageRepository;
    private final AIConversationService conversationService;

    @Autowired
    public AIMessageService(AIMessageRepository messageRepository,
            AIConversationService conversationService) {
        this.messageRepository = messageRepository;
        this.conversationService = conversationService;
    }

    public AIMessage getMessageById(Long messageId) {
        return messageRepository.findById(messageId).orElse(null);
    }

    public List<AIMessage> getMessagesByConversation(Long conversationId, int page) {
        // Validate conversation exists
        if (conversationService.getConversationById(conversationId) == null) {
            throw new IllegalArgumentException("Conversation not found");
        }

        Pageable pageable = PageRequest.of(page, 5, Sort.by("createdAt").descending());

        return messageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId, pageable).getContent();
    }

    public AIMessage saveMessage(AIMessage message) {
        return messageRepository.save(message);
    }

    public List<AIMessage> getLastNMessagesByConversationId(Long conversationId, int count) {
        Pageable pageable = PageRequest.of(0, count, Sort.by("createdAt").descending()); // Oldest first
        List<AIMessage> reversedMessages = messageRepository
                .findByConversationIdOrderByCreatedAtDesc(conversationId, pageable)
                .getContent()
                .stream()
                .sorted(Comparator.comparing(AIMessage::getCreatedAt)) // Ascending order
                .toList();
        
        // aiMessages.sort((m1, m2) -> m1.getCreatedAt().compareTo(m2.getCreatedAt()));
        return reversedMessages;

    }
}