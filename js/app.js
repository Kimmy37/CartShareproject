(() => {
  "use strict";
  const $ = (selector) => document.querySelector(selector);
  const welcomeView = $("#welcomeView");
  const appView = $("#appView");
  const joinForm = $("#joinForm");
  const welcomeMessage = $("#welcomeMessage");
  const appMessage = $("#appMessage");
  const STORAGE_PREFIX = "cartshare-room-";
  const SESSION_KEY = "cartshare-session";
  let currentUser = "";
  let currentRoom = "";
  let roomData = null;

  const money = (amount) => new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 2
  }).format(Number(amount) || 0);
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
  const storageKey = (code) => STORAGE_PREFIX + code.toUpperCase();

  function readRoom(code) {
    try {
      const saved = localStorage.getItem(storageKey(code));
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Unable to read room data:", error);
      return null;
    }
  }
  function writeRoom() {
    localStorage.setItem(storageKey(currentRoom), JSON.stringify(roomData));
    render();
  }
  function addActivity(message, user = currentUser) {
    roomData.activity.unshift({
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      user, message, time: new Date().toISOString()
    });
    roomData.activity = roomData.activity.slice(0, 30);
  }
  function createRoomCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code;
    do {
      code = Array.from({length: 6}, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    } while (localStorage.getItem(storageKey(code)));
    return code;
  }
  function enterRoom(code, name, create = false) {
    const normalizedCode = code.toUpperCase().trim();
    if (!name.trim()) {
      welcomeMessage.textContent = "Please enter your name first.";
      $("#userName").focus();
      return;
    }
    let data = readRoom(normalizedCode);
    if (create) {
      data = { code: normalizedCode, items: [], activity: [], members: [] };
    } else if (!data) {
      welcomeMessage.textContent = "Room not found. Check the code or create a new room.";
      return;
    }
    currentUser = name.trim();
    currentRoom = normalizedCode;
    roomData = data;
    if (!roomData.members.includes(currentUser)) roomData.members.push(currentUser);
    addActivity(create ? "created the room" : "joined the room");
    writeRoom();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user: currentUser, room: currentRoom }));
    welcomeView.classList.add("hidden");
    appView.classList.remove("hidden");
    welcomeMessage.textContent = "";
    render();
  }
  function render() {
    if (!roomData || !currentRoom) return;
    $("#roomTitle").textContent = "Room " + currentRoom;
    $("#currentUserLabel").textContent = currentUser;
    $("#roomCodeLabel").textContent = currentRoom;
    const totalQty = roomData.items.reduce((sum, item) => sum + item.qty, 0);
    const total = roomData.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    $("#statItems").textContent = totalQty;
    $("#statTotal").textContent = money(total);
    $("#statPeople").textContent = roomData.members.length;
    $("#cartTotal").textContent = money(total);

    const rows = $("#cartRows");
    rows.innerHTML = roomData.items.map((item) => `
      <tr>
        <td>${escapeHtml(item.name)}<span class="subtext">Added ${escapeHtml(item.addedAtLabel)}</span></td>
        <td>${escapeHtml(item.addedBy)}</td>
        <td>${money(item.price)}</td>
        <td>${item.qty}</td>
        <td><strong>${money(item.price * item.qty)}</strong></td>
        <td><button class="remove-btn" type="button" data-remove="${escapeHtml(item.id)}" aria-label="Remove ${escapeHtml(item.name)}">✕</button></td>
      </tr>`).join("");
    $("#emptyCart").classList.toggle("hidden", roomData.items.length > 0);

    const list = $("#activityList");
    if (!roomData.activity.length) {
      list.innerHTML = '<li class="activity-empty">No activity yet. Add an item to get started.</li>';
    } else {
      list.innerHTML = roomData.activity.slice(0, 12).map((entry) => {
        const time = new Date(entry.time);
        const timeText = Number.isNaN(time.getTime()) ? "" : time.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
        const initial = escapeHtml((entry.user || "?").charAt(0).toUpperCase());
        return `<li><span class="activity-bullet">${initial}</span><div class="activity-text"><strong>${escapeHtml(entry.user)}</strong> ${escapeHtml(entry.message)}<span class="activity-time">${escapeHtml(timeText)}</span></div></li>`;
      }).join("");
    }
  }

  $("#createRoomBtn").addEventListener("click", () => {
    const name = $("#userName").value.trim();
    const code = createRoomCode();
    enterRoom(code, name, true);
  });
  joinForm.addEventListener("submit", (event) => {
    event.preventDefault();
    enterRoom($("#roomCode").value, $("#userName").value, false);
  });
  $("#itemForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!roomData) return;
    const name = $("#itemName").value.trim();
    const price = Number($("#itemPrice").value);
    const qty = Number($("#itemQty").value);
    if (!name || !Number.isFinite(price) || price <= 0 || !Number.isInteger(qty) || qty < 1) {
      appMessage.textContent = "Enter an item name, a price above 0, and a whole-number quantity.";
      return;
    }
    roomData.items.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      name, price, qty, addedBy: currentUser,
      addedAtLabel: new Date().toLocaleDateString()
    });
    addActivity(`added ${qty} × ${name}`);
    writeRoom();
    $("#itemForm").reset();
    $("#itemQty").value = "1";
    appMessage.textContent = "";
    $("#itemName").focus();
  });
  $("#cartRows").addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove]");
    if (!button || !roomData) return;
    const item = roomData.items.find((entry) => entry.id === button.dataset.remove);
    if (!item) return;
    roomData.items = roomData.items.filter((entry) => entry.id !== item.id);
    addActivity(`removed ${item.name}`);
    writeRoom();
  });
  $("#clearCartBtn").addEventListener("click", () => {
    if (!roomData || !roomData.items.length) {
      appMessage.textContent = "The cart is already empty.";
      return;
    }
    if (!window.confirm("Remove every item from this room's cart?")) return;
    roomData.items = [];
    addActivity("cleared the cart");
    writeRoom();
    appMessage.textContent = "";
  });
  $("#printReceiptBtn").addEventListener("click", () => {
    if (!roomData) return;
    const total = roomData.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    addActivity("printed the receipt");
    writeRoom();
    document.title = `CartShare-Receipt-${currentRoom}`;
    window.print();
    document.title = "CartShare | Collaborative Shopping";
  });
  $("#copyCodeBtn").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(currentRoom);
      appMessage.style.color = "#16794b";
      appMessage.textContent = "Room code copied. Share it with your group.";
    } catch (error) {
      appMessage.style.color = "#b42318";
      appMessage.textContent = "Your room code is " + currentRoom + ". Copy it manually.";
    }
  });
  $("#leaveRoomBtn").addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    currentUser = "";
    currentRoom = "";
    roomData = null;
    appView.classList.add("hidden");
    welcomeView.classList.remove("hidden");
    $("#roomCode").value = "";
    appMessage.textContent = "";
    appMessage.style.color = "";
  });

  // The storage event is fired in other tabs on the same browser and origin.
  window.addEventListener("storage", (event) => {
    if (!currentRoom || event.key !== storageKey(currentRoom) || !event.newValue) return;
    try {
      roomData = JSON.parse(event.newValue);
      render();
    } catch (error) {
      console.error("Unable to sync room data:", error);
    }
  });

  // Restore the current tab's session when possible.
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    if (session && session.user && session.room) {
      const data = readRoom(session.room);
      if (data) {
        currentUser = session.user;
        currentRoom = session.room;
        roomData = data;
        welcomeView.classList.add("hidden");
        appView.classList.remove("hidden");
        render();
      }
    }
  } catch (error) {
    sessionStorage.removeItem(SESSION_KEY);
  }
})();
