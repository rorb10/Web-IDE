let isLoginMode = true;

const virtualFileSystem = {
    'index.html': `<!DOCTYPE html>\n<html lang="ko">\n<head>\n    <title>Web IDE Project</title>\n</head>\n<body>\n    <h1>Welcome to My Web IDE!</h1>\n    <p>HTML 파일이 성공적으로 로드되었습니다.</p>\n</body>\n</html>`,
    'style.css': `/* Base Styles */\nbody {\n    background-color: #1e1e1e;\n    color: #d4d4d4;\n    font-family: sans-serif;\n}\n\nh1 {\n    color: #569cd6;\n}`,
    'script.js': `// Application Initialization\nfunction initializeApp() {\n    console.log("Core system loaded.");\n    setupEventListeners();\n}\n\ninitializeApp();`
};

const authModal = document.getElementById('authModal');
const modalTitle = document.getElementById('modalTitle');
const modalSubmitBtn = document.getElementById('modalSubmitBtn');
const toggleAuthText = document.getElementById('toggleAuthText');
const currentTab = document.getElementById('currentTab');
const codeArea = document.getElementById('codeArea');

function switchFile(fileName) {
    if (!virtualFileSystem[fileName]) return;
    currentTab.textContent = fileName;
    codeArea.textContent = virtualFileSystem[fileName];
    
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('active');
    });

    if (fileName === 'index.html') document.getElementById('file-html').classList.add('active');
    if (fileName === 'style.css') document.getElementById('file-css').classList.add('active');
    if (fileName === 'script.js') document.getElementById('file-js').classList.add('active');
}

function switchPanel(panelName) {
    document.getElementById('tab-terminal').classList.remove('active');
    document.getElementById('tab-chat').classList.remove('active');
    document.getElementById(`tab-${panelName}`).classList.add('active');

    document.getElementById('view-terminal').style.display = 'none';
    document.getElementById('view-chat').style.display = 'none';
    document.getElementById(`view-${panelName}`).style.display = 'flex';
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const messageText = input.value.trim();
    
    if (messageText !== "") {
        const chatMessages = document.getElementById('chatMessages');
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-msg me';
        msgDiv.textContent = messageText;
        
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        input.value = "";
    }
}

function handleChatEnter(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function openAuthModal() {
    if (authModal) authModal.style.display = 'flex';
}

function closeAuthModal() {
    if (authModal) authModal.style.display = 'none';
}

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
        modalTitle.textContent = '로그인';
        modalSubmitBtn.textContent = '로그인';
        toggleAuthText.textContent = '계정이 없으신가요? 회원가입';
    } else {
        modalTitle.textContent = '회원가입';
        modalSubmitBtn.textContent = '가입하기';
        toggleAuthText.textContent = '이미 계정이 있으신가요? 로그인';
    }
}

window.onclick = function(event) {
    if (event.target === authModal) closeAuthModal();
}

window.onload = function() {
    switchFile('index.html');
};