let authMode = "login";
let currentUserEmail = localStorage.getItem("currentUserEmail") || "guest";

document.addEventListener("DOMContentLoaded", () => {
  updateLoginButton();
  loadChatMessages();

  setInterval(loadChatMessages, 2000);
});

/* =========================
   Auth
========================= */
function openAuthModal(mode) {
  authMode = mode;
  updateModalText();

  document.getElementById("authModal").classList.remove("hidden");
}

function closeAuthModal() {
  document.getElementById("authModal").classList.add("hidden");

  document.getElementById("emailInput").value = "";
  document.getElementById("passwordInput").value = "";
}

function switchAuthMode() {
  authMode = authMode === "login" ? "signup" : "login";
  updateModalText();
}

function updateModalText() {
  const modalTitle = document.getElementById("modalTitle");
  const submitBtn = document.getElementById("submitBtn");
  const switchText = document.getElementById("switchText");

  if (authMode === "login") {
    modalTitle.textContent = "로그인";
    submitBtn.textContent = "로그인";
    switchText.innerHTML = '계정이 없나요? <button onclick="switchAuthMode()">회원가입</button>';
  } else {
    modalTitle.textContent = "회원가입";
    submitBtn.textContent = "회원가입";
    switchText.innerHTML = '이미 계정이 있나요? <button onclick="switchAuthMode()">로그인</button>';
  }
}

async function submitAuth() {
  const email = document.getElementById("emailInput").value.trim();
  const password = document.getElementById("passwordInput").value.trim();

  if (!email || !password) {
    alert("이메일과 비밀번호를 입력해주세요.");
    return;
  }

  const apiUrl = authMode === "login" ? "/api/login" : "/api/signup";

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
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
      } else {
        alert("회원가입이 완료되었습니다. 이제 로그인해주세요.");
        authMode = "login";
        updateModalText();
      }
    } else {
      alert(data.message || "요청 처리에 실패했습니다.");
    }
  } catch (error) {
    console.error(error);
    alert("서버 연결 중 오류가 발생했습니다.");
  }
}

function updateLoginButton() {
  const loginBtn = document.getElementById("loginBtn");

  if (!loginBtn) return;

  if (currentUserEmail !== "guest") {
    loginBtn.textContent = currentUserEmail + " 님";
  } else {
    loginBtn.textContent = "로그인";
  }
}

/* =========================
   Panel
========================= */
function showPanel(panelName) {
  const terminalPanel = document.getElementById("terminalPanel");
  const chatPanel = document.getElementById("chatPanel");
  const tabs = document.querySelectorAll(".panel-tab");

  terminalPanel.classList.add("hidden");
  chatPanel.classList.add("hidden");

  tabs.forEach(tab => tab.classList.remove("active"));

  if (panelName === "terminal") {
    terminalPanel.classList.remove("hidden");
    tabs[0].classList.add("active");
  }

  if (panelName === "chat") {
    chatPanel.classList.remove("hidden");
    tabs[1].classList.add("active");
    loadChatMessages();
  }
}

/* =========================
   Chat
========================= */
async function loadChatMessages() {
  const chatMessages = document.getElementById("chatMessages");

  if (!chatMessages) return;

  try {
    const response = await fetch("/api/chat/messages");
    const messages = await response.json();

    chatMessages.innerHTML = "";

    if (messages.length === 0) {
      chatMessages.innerHTML = '<div class="chat-msg system">아직 채팅 메시지가 없습니다.</div>';
      return;
    }

    messages.forEach(item => {
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

function formatTime(value) {
  if (!value) return "";

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