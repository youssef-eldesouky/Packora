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

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=";

    @Override
    public ChatResponse askQuestion(ChatRequest request, boolean isLoggedIn, String username) {
        String url = GEMINI_API_URL + geminiApiKey;

        try {
            // Build the payload
            Map<String, Object> payload = new HashMap<>();

            // System Instruction (Personality & Navigation instructions)
            String baseInstruction = "You are a concise customer support agent for Packora, an Egyptian packaging company. " +
                "STRICT RULES: " +
                "1. NEVER use emojis. " +
                "2. Keep responses short and directly answer ONLY what the user asked. Do not add extra information they did not ask for. " +
                "3. If the user says something casual like 'thanks' or 'ok', reply briefly (one sentence max) without adding navigation links or suggestions. " +
                "4. Use plain text. Avoid markdown headers (no # or ##). Use simple bullet points only when listing multiple items. " +
                "5. You may provide markdown links for navigation when relevant: [Catalog](/catalog), [Cart](/cart), [Checkout](/checkout), [Track Order](/track), [Dashboard](/admin). " +
                "6. Do not repeat yourself or over-explain. ";
                
            if (isLoggedIn) {
                baseInstruction += "The user is logged in as '" + username + "'.";
            } else {
                baseInstruction += "The user is a guest. If they need account features, suggest [Log In](/login) or [Sign Up](/signup).";
            }

            Map<String, Object> systemInstruction = new HashMap<>();
            systemInstruction.put("parts", List.of(Map.of("text", baseInstruction)));
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
