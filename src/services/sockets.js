const { socket_url } = require("../../constanst");

const socket = io(`${socket_url}`);
const messageContainer = document.getElementById("message-container");
const groupContainer = document.getElementById("group-container");
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById("message-input");

if (messageForm != null) {
  const name = prompt("What is your name?");
  appendMessage("You joined");
  socket.emit("new-user", groupName, name);

  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value;
    appendMessage(`You: ${message}`);
    socket.emit("send-chat-message", groupName, message);
    messageInput.value = "";
  });
}

socket.on("group-created", (group) => {
  const groupElement = document.createElement("div");
  groupElement.innerText = group;
  const groupLink = document.createElement("a");
  groupLink.href = `/${group}`;
  groupLink.innerText = "join";
  groupContainer.append(groupElement);
  groupContainer.append(groupLink);
});

socket.on("chat-message", (data) => {
  appendMessage(`${data.name}: ${data.message}`);
});

socket.on("user-connected", (name) => {
  appendMessage(`${name} connected`);
});

socket.on("user-disconnected", (name) => {
  appendMessage(`${name} disconnected`);
});

function appendMessage(message) {
  const messageElement = document.createElement("div");
  messageElement.innerText = message;
  messageContainer.append(messageElement);
}
