package com.tahsin.backend.Controller;

import com.tahsin.backend.Model.AIConversation;
import com.tahsin.backend.Model.User;
import com.tahsin.backend.Repository.UserRepository;
import com.tahsin.backend.Service.AIConversationService;
import com.tahsin.backend.Service.UserService;
import com.tahsin.backend.dto.ConversationDTO;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/conversations")
public class AIConversationController {

    private final AIConversationService conversationService;
    private final UserRepository userRepository;

    @Autowired
    public AIConversationController(AIConversationService conversationService, UserRepository userRepository) {
        this.conversationService = conversationService;
        this.userRepository = userRepository;
    }

    @PostMapping("/new")
    public ResponseEntity<ConversationDTO> createNewConversation(@RequestParam Long userId) {
        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().build();
        }

        AIConversation newConversation = conversationService.createNewConversation(user);
        if (newConversation == null) {
            return ResponseEntity.status(500).build();
        }
        // Convert to DTO
        ConversationDTO conversationDTO = new ConversationDTO(
                newConversation.getId(),
                "New Chat",
                newConversation.getCreatedAt(),
                newConversation.getLastActivity(),
                userId,
                user.getName(),
                0 // Initial message count is 0
        );
        return ResponseEntity.ok(conversationDTO);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AIConversation> getConversation(@PathVariable Long id) {
        AIConversation conversation = conversationService.getConversationById(id);
        if (conversation == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(conversation);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConversation(@PathVariable Long id) {
        boolean deleted = conversationService.deleteConversation(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ConversationDTO>> getLatestConversationByUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest().build();
        }

        List<AIConversation> conversations = conversationService.getConversations(user);
        List<ConversationDTO> dtos = conversations.stream()
                .map(conv -> {
                    // Safely get the first message content
                    String firstMessageContent = Optional.ofNullable(conv.getMessages())
                            .filter(messages -> !messages.isEmpty())
                            .map(messages -> messages.get(0).getUserMessage())
                            .orElse("New Chat");

                    // Safely get user info
                   

                    // Safely get message count
                    int messageCount = Optional.ofNullable(conv.getMessages())
                            .map(List::size)
                            .orElse(0);

                    return new ConversationDTO(
                            conv.getId(),
                            firstMessageContent,
                            conv.getCreatedAt(),
                            conv.getLastActivity(),
                            userId,
                            user.getName(),
                            messageCount);
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);

    }
}