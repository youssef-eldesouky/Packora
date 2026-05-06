package com.packora.backend.service;

import com.packora.backend.dto.chatbot.ChatRequest;
import com.packora.backend.dto.chatbot.ChatResponse;

public interface ChatbotService {
    ChatResponse askQuestion(ChatRequest request, boolean isLoggedIn, String username);
}
