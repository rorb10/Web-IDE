package com.example.webide.controller;

import com.example.webide.domain.User;
import com.example.webide.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // 프론트엔드(HTML 화면)에서 오는 요청을 모두 허용!
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "이미 가입된 이메일입니다."));
        }
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("success", true, "message", "회원가입이 완료되었습니다!"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginUser) {
        Optional<User> user = userRepository.findByEmailAndPassword(loginUser.getEmail(), loginUser.getPassword());
        if (user.isPresent()) {
            return ResponseEntity.ok(Map.of("success", true, "message", "로그인 성공", "email", user.get().getEmail()));
        }
        return ResponseEntity.badRequest().body(Map.of("success", false, "message", "이메일 또는 비밀번호가 틀렸습니다."));
    }
}