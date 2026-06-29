package com.example.webide.controller;

import com.example.webide.domain.ChatMessage;
import com.example.webide.repository.ChatMessageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;

    public ChatController(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    @GetMapping("/messages")
    public List<ChatMessage> getMessages() {
        List<ChatMessage> messages = chatMessageRepository.findTop50ByOrderByCreatedAtDesc();
        Collections.reverse(messages);
        return messages;
    }

    @PostMapping("/messages")
    public ResponseEntity<Map<String, Object>> sendMessage(@RequestBody ChatMessage chatMessage) {
        if (chatMessage.getMessage() == null || chatMessage.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "메시지를 입력해주세요."
            ));
        }

        if (chatMessage.getSender() == null || chatMessage.getSender().trim().isEmpty()) {
            chatMessage.setSender("guest");
        }

        chatMessageRepository.save(chatMessage);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "채팅 메시지가 전송되었습니다."
        ));
    }
}