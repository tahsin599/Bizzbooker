package com.tahsin.backend.Controller;

import com.tahsin.backend.dto.AIMessageDTO;
import com.tahsin.backend.Model.AIMessage;
import com.tahsin.backend.Service.AIMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
public class AIMessageController {

    private final AIMessageService messageService;

    @Autowired
    public AIMessageController(AIMessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<List<AIMessageDTO>> getMessagesByConversation(
            @PathVariable Long conversationId,
            @RequestParam(defaultValue = "0") int page) {
        
        // Get messages from service
        List<AIMessage> messages = messageService.getMessagesByConversation(conversationId, page);
        
        
        // Convert to DTOs
        List<AIMessageDTO> messageDTOs = messages.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(messageDTOs);
    }

    @PostMapping
    public ResponseEntity<AIMessageDTO> createMessage(@RequestBody AIMessage message) {
        AIMessage savedMessage = messageService.saveMessage(message);
        return ResponseEntity.ok(convertToDTO(savedMessage));
    }

    @GetMapping("/{messageId}")
    public ResponseEntity<AIMessageDTO> getMessageById(@PathVariable Long messageId) {
        AIMessage message = messageService.getMessageById(messageId);
        if (message == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(convertToDTO(message));
    }

    // Helper method for conversion
    private AIMessageDTO convertToDTO(AIMessage message) {
        return new AIMessageDTO(
                message.getId(),
                message.getUserMessage(),
                message.getAiReply(),
                message.getCreatedAt()
        );
    }
}