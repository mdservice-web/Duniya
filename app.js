(() => {
  const $ = (id) => document.getElementById(id);
  const login = $("login"), chat = $("chat");
  const username = $("username"), passcode = $("passcode");
  const messagesEl = $("messages");
  const messageForm = $("messageForm"), messageInput = $("messageInput");
  const recordBtn = $("recordBtn"), recordStatus = $("recordStatus");
  const voicePreview = $("voicePreview"), voiceAudio = $("voiceAudio");
  const sendVoiceBtn = $("sendVoiceBtn"), discardVoiceBtn = $("discardVoiceBtn");

  // DEMO ONLY: this is not authentication and must not be used for real private chats.
  // Online privacy requires server-side authentication and database access rules.
  const DEMO_PASSCODE = "our-secret";
  const STORAGE_KEY = "only-us-chat-demo-v1";
  let currentUser = "";
  let recorder = null, chunks = [], pendingVoiceUrl = null, pendingVoiceBlob = null;

  function getMessages() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch { return []; }
  }
  function saveMessages(items) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
    catch { alert("This browser could not save the message. Voice files may be too large for local storage."); }
  }
  function timeLabel(iso) {
    return new Date(iso).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
  }
  function render() {
    const items = getMessages();
    messagesEl.replaceChildren();
    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "Your conversation starts here. Send a little hello.";
      messagesEl.appendChild(empty);
      return;
    }
    for (const item of items) {
      const bubble = document.createElement("article");
      bubble.className = "message " + (item.sender === currentUser ? "mine" : "theirs");
      const sender = document.createElement("div");
      sender.className = "sender";
      sender.textContent = item.sender;
      bubble.appendChild(sender);
      if (item.type === "voice") {
        const audio = document.createElement("audio");
        audio.controls = true;
        audio.src = item.data;
        audio.preload = "metadata";
        bubble.appendChild(audio);
      } else {
        const body = document.createElement("div");
        body.className = "body";
        body.textContent = item.text;
        bubble.appendChild(body);
      }
      const time = document.createElement("time");
      time.textContent = timeLabel(item.createdAt);
      bubble.appendChild(time);
      messagesEl.appendChild(bubble);
    }
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  $("loginBtn").addEventListener("click", () => {
    const name = username.value.trim();
    if (!name) { $("loginError").textContent = "Enter your name first."; return; }
    if (passcode.value !== DEMO_PASSCODE) { $("loginError").textContent = "Incorrect demo passcode."; return; }
    currentUser = name;
    $("loginError").textContent = "";
    $("welcomeLine").textContent = "Signed in as " + currentUser + " · demo on this device";
    login.classList.add("hidden");
    chat.classList.remove("hidden");
    $("connection").textContent = "Demo mode";
    render();
  });
  $("logoutBtn").addEventListener("click", () => {
    currentUser = "";
    chat.classList.add("hidden");
    login.classList.remove("hidden");
    passcode.value = "";
  });
  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text || !currentUser) return;
    const items = getMessages();
    items.push({type:"text", sender:currentUser, text, createdAt:new Date().toISOString()});
    saveMessages(items);
    messageInput.value = "";
    render();
  });
  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      messageForm.requestSubmit();
    }
  });
  function clearVoicePreview() {
    if (pendingVoiceUrl) URL.revokeObjectURL(pendingVoiceUrl);
    pendingVoiceUrl = null; pendingVoiceBlob = null;
    voiceAudio.removeAttribute("src");
    voicePreview.classList.add("hidden");
  }
  recordBtn.addEventListener("click", async () => {
    if (!currentUser) { recordStatus.textContent = "Sign in first."; return; }
    if (recorder && recorder.state === "recording") {
      recorder.stop();
      recordBtn.textContent = "● Record voice";
      recordBtn.classList.remove("recording");
      recordStatus.textContent = "Preparing preview…";
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
      recordStatus.textContent = "Voice recording needs a supported browser and secure HTTPS page.";
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio:true});
      chunks = [];
      const options = {};
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) options.mimeType = "audio/webm;codecs=opus";
      recorder = new MediaRecorder(stream, options);
      recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        pendingVoiceBlob = new Blob(chunks, {type:recorder.mimeType || "audio/webm"});
        pendingVoiceUrl = URL.createObjectURL(pendingVoiceBlob);
        voiceAudio.src = pendingVoiceUrl;
        voicePreview.classList.remove("hidden");
        recordStatus.textContent = "Listen before sending.";
      };
      recorder.start();
      recordBtn.textContent = "■ Stop recording";
      recordBtn.classList.add("recording");
      recordStatus.textContent = "Recording… tap Stop when finished.";
    } catch (err) {
      recordStatus.textContent = "Microphone permission was denied or unavailable.";
    }
  });
  sendVoiceBtn.addEventListener("click", () => {
    if (!pendingVoiceBlob || !currentUser) return;
    // Demo voice messages are stored as data URLs in local storage and only on this device.
    const reader = new FileReader();
    reader.onload = () => {
      const items = getMessages();
      items.push({type:"voice", sender:currentUser, data:reader.result, createdAt:new Date().toISOString()});
      saveMessages(items);
      clearVoicePreview();
      render();
      recordStatus.textContent = "Voice message added to this device's demo chat.";
    };
    reader.readAsDataURL(pendingVoiceBlob);
  });
  discardVoiceBtn.addEventListener("click", () => {
    clearVoicePreview();
    recordStatus.textContent = "Voice message discarded.";
  });
})();