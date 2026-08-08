(() => {
  const FREE_DAILY_LIMIT = 20; // soft cap shown in the UI; tweak freely
  const SITE_URL = window.location.href;

  const GREETINGS = [
    "Howdy. What're we tryin' to figure out? I ain't got all day, Brenda's got me on a schedule now.",
    "Well hey there. Ask me somethin'. I probably know less than you'd hope, but I'll say it with confidence.",
    "Evenin'. Or mornin'. I don't really check. What's on your mind?",
  ];

  const LOADING_MESSAGES = [
    "Al is chewin' on that one…",
    "Al is askin' Dale…",
    "Al is consultin' the sky…",
    "Al is thinkin', which takes him a minute…",
    "Al is checkin' with Brenda…",
    "Al is starin' at the boat for inspiration…",
  ];

  const chatWindow = document.getElementById("chat-window");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");
  const counterLabel = document.getElementById("counter-label");
  const shareConvoBtn = document.getElementById("share-convo-btn");

  let history = []; // { role: 'user' | 'al', content: string }

  // ---------- daily counter (client-side soft cap) ----------
  function todayKey() {
    return "al_count_" + new Date().toISOString().slice(0, 10);
  }

  function getRemaining() {
    const used = parseInt(localStorage.getItem(todayKey()) || "0", 10);
    return Math.max(0, FREE_DAILY_LIMIT - used);
  }

  function useOne() {
    const used = parseInt(localStorage.getItem(todayKey()) || "0", 10);
    localStorage.setItem(todayKey(), String(used + 1));
    renderCounter();
  }

  function renderCounter() {
    const remaining = getRemaining();
    counterLabel.textContent =
      remaining > 0
        ? `${remaining} free Al-ism${remaining === 1 ? "" : "s"} left today`
        : "Out of free Al-isms for today — come back tomorrow, or buy Al a beer above.";
  }

  // ---------- rendering ----------
  function addMessage(role, text, { withActions = false } = {}) {
    const el = document.createElement("div");
    el.className = `msg ${role}`;
    if (role === "al") {
      const label = document.createElement("span");
      label.className = "msg-label";
      label.textContent = "AL";
      el.appendChild(label);
    }
    const body = document.createElement("div");
    body.textContent = text;
    el.appendChild(body);

    if (withActions) {
      const actions = document.createElement("div");
      actions.className = "msg-actions";

      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.textContent = "Copy";
      copyBtn.addEventListener("click", () => {
        navigator.clipboard?.writeText(text);
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
      });

      const shareBtn = document.createElement("button");
      shareBtn.type = "button";
      shareBtn.textContent = "Share";
      shareBtn.addEventListener("click", () => {
        const tweet = `"${text}" —Al\n\n${SITE_URL}`;
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`,
          "_blank",
          "noopener"
        );
      });

      actions.appendChild(copyBtn);
      actions.appendChild(shareBtn);
      el.appendChild(actions);
    }

    chatWindow.appendChild(el);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return el;
  }

  function addLoading() {
    const el = document.createElement("div");
    el.className = "msg al loading";
    el.textContent = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
    chatWindow.appendChild(el);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return el;
  }

  // ---------- networking ----------
  async function askAl(message) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message, history }),
    });
    if (!res.ok) throw new Error("bad response");
    return res.json();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    if (getRemaining() <= 0) {
      addMessage(
        "al",
        "Out of free Al-isms for today, friend. Brenda's rules, not mine. Come back tomorrow or hit the tip jar up top to keep me talkin'.",
        { withActions: false }
      );
      chatInput.value = "";
      return;
    }

    addMessage("user", text);
    history.push({ role: "user", content: text });
    chatInput.value = "";
    sendBtn.disabled = true;

    const loadingEl = addLoading();

    try {
      const data = await askAl(text);
      loadingEl.remove();
      addMessage("al", data.reply, { withActions: true });
      history.push({ role: "al", content: data.reply });
      if (!data.limited) useOne();
    } catch (err) {
      loadingEl.remove();
      addMessage(
        "al",
        "Somethin' went sideways — probably the same gremlin that's in Big Red's transmission. Try again in a sec.",
        { withActions: false }
      );
    } finally {
      sendBtn.disabled = false;
      chatInput.focus();
    }
  }

  shareConvoBtn.addEventListener("click", () => {
    const transcript = history
      .map((h) => (h.role === "al" ? `AL: ${h.content}` : `ME: ${h.content}`))
      .join("\n");
    navigator.clipboard?.writeText(`${transcript}\n\n${SITE_URL}`);
    shareConvoBtn.textContent = "Copied to clipboard!";
    setTimeout(() => (shareConvoBtn.textContent = "Share this conversation"), 1800);
  });

  chatForm.addEventListener("submit", handleSubmit);

  // ---------- init ----------
  renderCounter();
  addMessage("al", GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
})();
