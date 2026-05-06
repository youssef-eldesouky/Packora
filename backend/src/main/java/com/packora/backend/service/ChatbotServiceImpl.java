package com.packora.backend.service;


import com.packora.backend.dto.chatbot.ChatRequest;
import com.packora.backend.dto.chatbot.ChatResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ChatbotServiceImpl implements ChatbotService {

    private static final Logger log = LoggerFactory.getLogger(ChatbotServiceImpl.class);
    private final RestTemplate restTemplate = new RestTemplate();


    @Value("${gemini.api-key}")
    private String geminiApiKey;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    @Override
    public ChatResponse askQuestion(ChatRequest request, boolean isLoggedIn, String username) {
        String url = GEMINI_API_URL + geminiApiKey;

        try {
            // Build the payload
            Map<String, Object> payload = new HashMap<>();

            // System Instruction (Personality & Navigation instructions)
            String baseInstruction = "You are an interactive, helpful customer support agent for Packora, an Egyptian packaging company. " +
                "Help the user navigate the website by providing markdown links. Examples: [View Catalog](/catalog), " +
                "[Go to Cart](/cart), [Checkout](/checkout), [Track Order](/track), [Dashboard](/admin). " +
                "Answer FAQs concisely. Provide structured, interactive-feeling responses with bullet points if applicable. ";
                
            if (isLoggedIn) {
                baseInstruction += "The user is currently logged in as '" + username + "'. You can address them by name and guide them to their [Dashboard](/admin) or [Cart](/cart).";
            } else {
                baseInstruction += "The user is a GUEST (NOT logged in). Answer their questions helpfully, but actively encourage them to [Log In](/login) or [Sign Up](/signup) to access features like custom quotes, purchasing, and order tracking. Provide those markdown links.";
            }

            Map<String, Object> systemInstruction = new HashMap<>();
            systemInstruction.put("parts", Map.of("text", baseInstruction));
            payload.put("system_instruction", systemInstruction);

            // User Message
            Map<String, Object> userContent = new HashMap<>();
            userContent.put("parts", List.of(Map.of("text", request.getMessage())));
            payload.put("contents", List.of(userContent));

            // Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            // Parse response using Maps
            Map<String, Object> responseBody = restTemplate.postForObject(url, entity, Map.class);
            if (responseBody != null && responseBody.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    if (content != null && content.containsKey("parts")) {
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                        if (!parts.isEmpty()) {
                            String text = (String) parts.get(0).get("text");
                            return new ChatResponse(text);
                        }
                    }
                }
            }

            return new ChatResponse("I'm sorry, I couldn't process your request right now.");

        } catch (Exception e) {
            log.error("Error communicating with Gemini API", e);
            return new ChatResponse("Sorry, there was an error connecting to our support system.");
        }
    }
}
