let tasks = [];
let currentUser = JSON.parse(localStorage.getItem("user"));
const motivationalTexts = [
  "Keep it up! 💪",
  "You're doing amazing! 🌟",
  "Another one down! 🔥",
  "Proud of you! 🙌",
  "Small steps make big progress! 🚀",
  "Consistency is key! 🗝️",
  "Look at you go! 💥",
  "You're unstoppable! 🦾",
  "Every tick is progress! ✅",
  "Stay focused, you're winning! 🎯"
];

const loginScreen = document.getElementById("login-screen");
const appContainer = document.getElementById("app");
const userPic = document.getElementById("user-pic");
const logoutBtn = document.getElementById("logout-btn");
const messageElement = document.querySelector(".details-container p");

// 🧩 Google Login Response
function handleCredentialResponse(response) {
  const data = decodeJwtResponse(response.credential);
  const user = {
    name: data.name,
    email: data.email,
    picture: data.picture
  };

  localStorage.setItem("user", JSON.stringify(user));
  currentUser = user;
  showDashboard();
  loadUserTasks();
}

// 🧩 Decode JWT
function decodeJwtResponse(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}

// 🧩 Show Dashboard
function showDashboard() {
  loginScreen.classList.add("hidden");
  appContainer.classList.remove("hidden");

  userPic.src = currentUser.picture;
  userPic.title = currentUser.name;
  document.querySelector(".app-header h1").textContent = `Zentask — Hi, ${currentUser.name.split(" ")[0]} 👋`;
  loadUserTasks();
}

// 🧩 Logout
function logoutUser() {
  localStorage.removeItem("user");
  currentUser = null;
  tasks = [];
  appContainer.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  logoutBtn.classList.add("hidden");
  document.getElementById("task-list").innerHTML = "";
  updateProgress();
}

// 🧩 Toggle logout button visibility
document.getElementById("user-menu").addEventListener("click", (e) => {
  logoutBtn.classList.toggle("hidden");
  e.stopPropagation();
});

// 🧩 Hide logout when clicking elsewhere
document.addEventListener("click", (e) => {
  const userMenu = document.getElementById("user-menu");
  if (!userMenu.contains(e.target)) {
    logoutBtn.classList.add("hidden");
  }
});

// 🧩 Load Tasks
function loadUserTasks() {
  if (!currentUser) return;
  tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser.email}`)) || [];
  renderTasks();
}

// 🧩 Save Tasks
function saveUserTasks() {
  if (currentUser)
    localStorage.setItem(`tasks_${currentUser.email}`, JSON.stringify(tasks));
}

// 🧩 Add Task
function addTask() {
  const taskInput = document.getElementById("task-input");
  const text = taskInput.value.trim();
  if (!text) return;
  if (!currentUser) return alert("Please log in first!");

  tasks.push({ text, completed: false });
  saveUserTasks();
  taskInput.value = "";
  renderTasks();
}

// 🧩 Render Tasks
function renderTasks() {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    const welcomeMsg = document.createElement("li");
    welcomeMsg.classList.add("welcome-message");
    welcomeMsg.innerHTML = `<p>Welcome ${currentUser ? currentUser.name.split(" ")[0] : "Guest"}! Start by adding your first task 🚀</p>`;
    taskList.appendChild(welcomeMsg);
    messageElement.textContent = "Let's get started 💪";
    updateProgress();
    return;
  }

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.classList.add("task-item");
    if (task.completed) li.classList.add("completed");

    li.innerHTML = `
      <label class="task-label">
        <input type="checkbox" class="checkbox" ${task.completed ? "checked" : ""}>
        <span class="custom-checkbox"></span>
        <p>${task.text}</p>
      </label>
      <div class="actions">
        <button class="edit-btn">✏️</button>
        <button class="delete-btn">🗑️</button>
      </div>
    `;

    li.querySelector(".checkbox").addEventListener("change", () => toggleTaskCompleted(index));
    li.querySelector(".delete-btn").addEventListener("click", () => deleteTask(index));
    li.querySelector(".edit-btn").addEventListener("click", () => editTask(index));

    taskList.appendChild(li);
  });

  updateProgress();
}

// 🧩 Toggle Task Completed
function toggleTaskCompleted(index) {
  tasks[index].completed = !tasks[index].completed;
  saveUserTasks();
  renderTasks();

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  messageElement.style.opacity = 0;

  setTimeout(() => {
    if (totalCount > 0 && completedCount === totalCount) {
      messageElement.textContent = "🎉 All tasks completed! You nailed it! 🏆";
    } else if (tasks[index].completed) {
      const randomMsg = motivationalTexts[Math.floor(Math.random() * motivationalTexts.length)];
      messageElement.textContent = randomMsg;
    } else {
      messageElement.textContent = "Keep it up! 💪";
    }
    messageElement.style.opacity = 1;
  }, 250);
}

// 🧩 Delete Task
function deleteTask(index) {
  tasks.splice(index, 1);
  saveUserTasks();
  renderTasks();
}

// 🧩 Edit Task
function editTask(index) {
  const newText = prompt("Edit your task:", tasks[index].text);
  if (newText !== null && newText.trim() !== "") {
    tasks[index].text = newText.trim();
    saveUserTasks();
    renderTasks();
  }
}

// 🧩 Update Progress
function updateProgress() {
  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const progress = total ? (completed / total) * 100 : 0;
  document.getElementById("progress").style.width = `${progress}%`;
  document.getElementById("numbers").textContent = `${completed}/${total}`;
}

// 🧩 Page Load
document.addEventListener("DOMContentLoaded", () => {
  if (currentUser) {
    showDashboard();
    loadUserTasks();
  } else {
    loginScreen.classList.remove("hidden");
    appContainer.classList.add("hidden");
  }

  const footer = document.querySelector(".footer p");
  if (footer) {
    const year = new Date().getFullYear();
    footer.innerHTML = `© ${year} <span id="app-name">Zentask</span>. All rights reserved.`;
  }
});

document.getElementById("task-form").addEventListener("submit", (e) => {
  e.preventDefault();
  addTask();
});
