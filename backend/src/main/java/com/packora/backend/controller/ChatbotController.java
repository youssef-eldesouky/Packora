package com.packora.backend.controller;

import com.packora.backend.dto.chatbot.ChatRequest;
import com.packora.backend.dto.chatbot.ChatResponse;
import com.packora.backend.security.services.UserDetailsImpl;
import com.packora.backend.service.ChatbotService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
     * Restricted to authenticated users to prevent API key abuse.
     */
    @PostMapping("/ask")
    public ResponseEntity<ChatResponse> askQuestion(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @RequestBody ChatRequest request) {
        
        log.info("[ChatbotController] POST /api/chatbot/ask - user={}", principal.getUsername());
        
        ChatResponse response = chatbotService.askQuestion(request);
        return ResponseEntity.ok(response);
    }
}
