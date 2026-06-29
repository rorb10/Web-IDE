let authMode = "login";
let currentUserEmail = localStorage.getItem("currentUserEmail") || "guest";

document.addEventListener("DOMContentLoaded", () => {
  updateLoginButton();
  loadChatMessages();

  setInterval(loadChatMessages, 2000);
});

/* =========================
   로그인 / 회원가입 / 비밀번호 재설정
========================= */

function openAuthModal(mode) {
  authMode = mode;
  updateModalText();

  const authModal = document.getElementById("authModal");
  if (authModal) {
    authModal.classList.remove("hidden");
  }
}

function closeAuthModal() {
  const authModal = document.getElementById("authModal");
  const emailInput = document.getElementById("emailInput");
  const passwordInput = document.getElementById("passwordInput");

  if (authModal) {
    authModal.classList.add("hidden");
  }

  if (emailInput) {
    emailInput.value = "";
  }

  if (passwordInput) {
    passwordInput.value = "";
  }
}

function switchAuthMode() {
  authMode = authMode === "login" ? "signup" : "login";
  updateModalText();
}

function updateModalText() {
  const modalTitle = document.getElementById("modalTitle");
  const passwordInput = document.getElementById("passwordInput");
  const submitBtn = document.getElementById("submitBtn");
  const switchText = document.getElementById("switchText");
  const resetText = document.getElementById("resetText");

  if (!modalTitle || !passwordInput || !submitBtn || !switchText) {
    return;
  }

  if (authMode === "login") {
    modalTitle.textContent = "로그인";
    passwordInput.placeholder = "비밀번호";
    submitBtn.textContent = "로그인";

    switchText.innerHTML =
      '계정이 없나요? <button onclick="switchAuthMode()">회원가입</button>';

    if (resetText) {
      resetText.innerHTML =
        '<button onclick="openAuthModal(\'reset\')">비밀번호를 잊으셨나요?</button>';
    }

    return;
  }

  if (authMode === "signup") {
    modalTitle.textContent = "회원가입";
    passwordInput.placeholder = "비밀번호";
    submitBtn.textContent = "회원가입";

    switchText.innerHTML =
      '이미 계정이 있나요? <button onclick="switchAuthMode()">로그인</button>';

    if (resetText) {
      resetText.innerHTML = "";
    }

    return;
  }

  if (authMode === "reset") {
    modalTitle.textContent = "비밀번호 재설정";
    passwordInput.placeholder = "새 비밀번호";
    submitBtn.textContent = "비밀번호 변경";

    switchText.innerHTML =
      '로그인 화면으로 돌아가기 <button onclick="openAuthModal(\'login\')">로그인</button>';

    if (resetText) {
      resetText.innerHTML = "";
    }
  }
}

async function submitAuth() {
  const emailInput = document.getElementById("emailInput");
  const passwordInput = document.getElementById("passwordInput");

  if (!emailInput || !passwordInput) {
    alert("입력창을 찾을 수 없습니다.");
    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    alert("이메일과 비밀번호를 입력해주세요.");
    return;
  }

  let apiUrl = "/api/login";
  let requestBody = {
    email: email,
    password: password
  };

  if (authMode === "signup") {
    apiUrl = "/api/signup";
  }

  if (authMode === "reset") {
    apiUrl = "/api/reset-password";
    requestBody = {
      email: email,
      newPassword: password
    };
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert(data.message);

      if (authMode === "login") {
        currentUserEmail = email;
        localStorage.setItem("currentUserEmail", email);
        updateLoginButton();
        closeAuthModal();
        loadChatMessages();
        return;
      }

      if (authMode === "signup") {
        authMode = "login";
        updateModalText();
        passwordInput.value = "";
        alert("회원가입이 완료되었습니다. 이제 로그인해주세요.");
        return;
      }

      if (authMode === "reset") {
        authMode = "login";
        updateModalText();
        passwordInput.value = "";
        alert("새 비밀번호로 로그인해주세요.");
        return;
      }
    }

    alert(data.message || "요청 처리에 실패했습니다.");
  } catch (error) {
    console.error(error);
    alert("서버 연결 중 오류가 발생했습니다.");
  }
}

function updateLoginButton() {
  const loginBtn = document.getElementById("loginBtn");

  if (!loginBtn) {
    return;
  }

  if (currentUserEmail !== "guest") {
    loginBtn.textContent = currentUserEmail + " 님";
  } else {
    loginBtn.textContent = "로그인";
  }
}

function logout() {
  currentUserEmail = "guest";
  localStorage.removeItem("currentUserEmail");
  updateLoginButton();
}

/* =========================
   하단 패널 전환
========================= */

function showPanel(panelName) {
  const terminalPanel = document.getElementById("terminalPanel");
  const chatPanel = document.getElementById("chatPanel");
  const tabs = document.querySelectorAll(".panel-tab");

  if (!terminalPanel || !chatPanel) {
    return;
  }

  terminalPanel.classList.add("hidden");
  chatPanel.classList.add("hidden");

  tabs.forEach((tab) => {
    tab.classList.remove("active");
  });

  if (panelName === "terminal") {
    terminalPanel.classList.remove("hidden");

    if (tabs[0]) {
      tabs[0].classList.add("active");
    }
  }

  if (panelName === "chat") {
    chatPanel.classList.remove("hidden");

    if (tabs[1]) {
      tabs[1].classList.add("active");
    }

    loadChatMessages();
  }
}

/* =========================
   팀 채팅
========================= */

async function loadChatMessages() {
  const chatMessages = document.getElementById("chatMessages");

  if (!chatMessages) {
    return;
  }

  try {
    const response = await fetch("/api/chat/messages");

    if (!response.ok) {
      return;
    }

    const messages = await response.json();

    chatMessages.innerHTML = "";

    if (!messages || messages.length === 0) {
      chatMessages.innerHTML =
        '<div class="chat-msg system">아직 채팅 메시지가 없습니다.</div>';
      return;
    }

    messages.forEach((item) => {
      const messageDiv = document.createElement("div");
      const isMe = item.sender === currentUserEmail;

      messageDiv.className = isMe ? "chat-msg me" : "chat-msg";

      messageDiv.innerHTML = `
        <div class="chat-sender">${escapeHtml(item.sender)}</div>
        <div class="chat-text">${escapeHtml(item.message)}</div>
        <div class="chat-time">${formatTime(item.createdAt)}</div>
      `;

      chatMessages.appendChild(messageDiv);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
  } catch (error) {
    console.error(error);
  }
}

async function sendChatMessage() {
  const chatInput = document.getElementById("chatInput");

  if (!chatInput) {
    alert("채팅 입력창을 찾을 수 없습니다.");
    return;
  }

  const message = chatInput.value.trim();

  if (!message) {
    alert("메시지를 입력해주세요.");
    return;
  }

  try {
    const response = await fetch("/api/chat/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sender: currentUserEmail,
        message: message
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      chatInput.value = "";
      loadChatMessages();
    } else {
      alert(data.message || "메시지 전송에 실패했습니다.");
    }
  } catch (error) {
    console.error(error);
    alert("채팅 서버 연결 중 오류가 발생했습니다.");
  }
}

function handleChatKey(event) {
  if (event.key === "Enter") {
    sendChatMessage();
  }
}

/* =========================
   공통 유틸
========================= */

function formatTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}