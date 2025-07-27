package com.tahsin.backend.Service;

import com.tahsin.backend.Model.AIConversation;
import com.tahsin.backend.Model.User;
import com.tahsin.backend.Repository.AIConversationRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AIConversationService {

    private final AIConversationRepository conversationRepository;

    @Autowired
    public AIConversationService(AIConversationRepository conversationRepository) {
        this.conversationRepository = conversationRepository;
    }

    public AIConversation createNewConversation(User user) {
        AIConversation conversation = new AIConversation();
        conversation.setUser(user);
        // createdAt and lastActivity will be automatically set by @CreationTimestamp
        // and @UpdateTimestamp
        return conversationRepository.save(conversation);
    }

    public AIConversation getConversationById(Long id) {
        return conversationRepository.findById(id).orElse(null);
    }

    public AIConversation updateConversation(AIConversation conversation) {
        return conversationRepository.save(conversation);
    }

    public boolean deleteConversation(Long id) {
        if (conversationRepository.existsById(id)) {
            conversationRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<AIConversation> getConversations(User user) {
        return conversationRepository.findByUser(user);
    }   

    // Add other conversation-related methods as needed
}