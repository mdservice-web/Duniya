const firebaseConfig = {
  apiKey: "AIzaSyCPlWanAjjZFNd13Td1Kph_xxPVCHzW_4Q",
  authDomain: "only-us-chat-6740a.firebaseapp.com",
  projectId: "only-us-chat-6740a",
  storageBucket: "only-us-chat-6740a.firebasestorage.app",
  messagingSenderId: "677206777131",
  appId: "1:677206777131:web:74467ae5608d746e71396e",
  measurementId: "G-BGL4QBDN0C"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const ALLOWED_UIDS = new Set([
  "f1GA2AjoQfdxf46eBKtUwwcjqzK2",
  "Q4DOj8ZQuhOuXuqWP3kG2NSuM1z1"
]);

const $ = (id) => document.getElementById(id);
const loginSection = $("login");
const chatSection = $("chat");
const loginForm = $("loginForm");
const loginError = $("loginError");
const connection = $("connection");
const messagesEl = $("messages");
const messageForm = $("messageForm");
const messageInput = $("messageInput");
let stopMessages = null;

function setStatus(text) {
  connection.textContent = text;
}

function showLogin(error = "") {
  loginSection.classList.remove("hidden");
  chatSection.classList.add("hidden");
  loginError.textContent = error;
  if (stopMessages) {
    stopMessages();
    stopMessages = null;
  }
  messagesEl.replaceChildren();
}

function renderMessage(doc) {
  const data = doc.data();
  const item = document.createElement("article");
  const mine = auth.currentUser && data.senderUid === auth.currentUser.uid;
  item.className = `message ${mine ? "mine" : "theirs"}`;

  const body = document.createElement("p");
  body.className = "message-text";
  body.textContent = typeof data.text === "string" ? data.text : "";

  const meta = document.createElement("div");
  meta.className = "message-meta";
  const sender = document.createElement("span");
  sender.textContent = mine ? "You" : "Her";
  const time = document.createElement("time");
  const date = data.createdAt && data.createdAt.toDate ? data.createdAt.toDate() : new Date();
  time.textContent = date.toLocaleString([], {month:"short", day:"numeric", hour:"2-digit", minute:"2-digit"});
  meta.append(sender, time);
  item.append(body, meta);
  messagesEl.appendChild(item);
}

function startMessages() {
  if (stopMessages) stopMessages();
  messagesEl.replaceChildren();
  setStatus("Live chat");
  stopMessages = db.collection("messages")
    .orderBy("createdAt", "asc")
    .limit(300)
    .onSnapshot((snapshot) => {
      messagesEl.replaceChildren();
      snapshot.forEach(renderMessage);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      $("privacyNotice").textContent = "Connected. Messages sync between the two approved accounts.";
    }, (error) => {
      console.error("Firestore listener error:", error);
      $("privacyNotice").textContent = "Could not load messages. Check Firestore Rules and internet connection.";
      setStatus("Connection issue");
    });
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.textContent = "";
  const email = $("email").value.trim();
  const password = $("password").value;
  const button = $("loginBtn");
  button.disabled = true;
  button.textContent = "Signing in…";
  try {
    const result = await auth.signInWithEmailAndPassword(email, password);
    if (!ALLOWED_UIDS.has(result.user.uid)) {
      await auth.signOut();
      showLogin("This account is not authorized for this private chat.");
      return;
    }
  } catch (error) {
    console.error("Sign-in error:", error);
    showLogin("Sign-in failed. Check the email/password and Firebase Authentication settings.");
  } finally {
    button.disabled = false;
    button.textContent = "Open our chat";
  }
});

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    showLogin();
    setStatus("Signed out");
    return;
  }
  if (!ALLOWED_UIDS.has(user.uid)) {
    await auth.signOut();
    showLogin("This account is not authorized for this private chat.");
    return;
  }
  loginSection.classList.add("hidden");
  chatSection.classList.remove("hidden");
  $("welcomeLine").textContent = user.email || "A conversation for two";
  startMessages();
});

$("logoutBtn").addEventListener("click", () => auth.signOut());

messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  const user = auth.currentUser;
  if (!text || !user || !ALLOWED_UIDS.has(user.uid)) return;

  const sendButton = messageForm.querySelector("button[type='submit']");
  sendButton.disabled = true;
  try {
    await db.collection("messages").add({
      text,
      senderUid: user.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    messageInput.value = "";
    messageInput.focus();
  } catch (error) {
    console.error("Send error:", error);
    $("privacyNotice").textContent = "Message not sent. Check Firestore Rules and try again.";
  } finally {
    sendButton.disabled = false;
  }
});

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    messageForm.requestSubmit();
  }
});
