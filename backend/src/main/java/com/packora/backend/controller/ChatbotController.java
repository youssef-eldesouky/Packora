package com.packora.backend.controller;

import com.packora.backend.dto.chatbot.ChatRequest;
import com.packora.backend.dto.chatbot.ChatResponse;
import com.packora.backend.security.services.UserDetailsImpl;
import com.packora.backend.service.ChatbotService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    private static final Logger log = LoggerFactory.getLogger(ChatbotController.class);

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    /**
     * Ask the AI chatbot a question.
     * Accessible by both guests and authenticated users.
     */
    @PostMapping("/ask")
    public ResponseEntity<ChatResponse> askQuestion(
            Authentication authentication,
            @RequestBody ChatRequest request) {
        
        boolean isLoggedIn = authentication != null && authentication.isAuthenticated() 
                && !"anonymousUser".equals(authentication.getPrincipal());
                
        String username = "Guest";
        if (isLoggedIn && authentication.getPrincipal() instanceof UserDetailsImpl) {
            username = ((UserDetailsImpl) authentication.getPrincipal()).getUsername();
        }
        
        log.info("[ChatbotController] POST /api/chatbot/ask - user={}, isLoggedIn={}", username, isLoggedIn);
        
        ChatResponse response = chatbotService.askQuestion(request, isLoggedIn, username);
        return ResponseEntity.ok(response);
    }
}
