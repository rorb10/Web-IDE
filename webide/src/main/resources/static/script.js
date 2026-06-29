let authMode = "login";

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
        document.getElementById("loginBtn").textContent = email + " 님";
        closeAuthModal();
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