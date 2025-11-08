const API_URL = "https://todolist-xixp.onrender.com";

let tasks = [];

// Motivational sentences
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

// 🟢 Load all tasks from backend
const loadTasks = async () => {
  const res = await fetch(`${API_URL}/tasks`);
  tasks = await res.json();
  renderTasks();
};

// 🟢 Add a new task
const addTask = async () => {
  const taskInput = document.getElementById("task-input");
  const text = taskInput.value.trim();
  if (!text) return;

  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const newTask = await res.json();
  tasks.push(newTask);
  taskInput.value = "";
  renderTasks();
};

// 🟢 Render all tasks
const renderTasks = () => {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    const welcomeMsg = document.createElement("li");
    welcomeMsg.classList.add("welcome-message");
    welcomeMsg.innerHTML = `<p>Welcome! Start by adding your first task 🚀</p>`;
    taskList.appendChild(welcomeMsg);

    const messageElement = document.querySelector(".details-container p");
    messageElement.textContent = "Welcome back! Let’s get started 💪";
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
};

// 🟢 Toggle task completion (backend sync)
const toggleTaskCompleted = async (index) => {
  const task = tasks[index];
  await fetch(`${API_URL}/tasks/${task.id}`, { method: "PUT" });
  task.completed = !task.completed;
  renderTasks();

  const messageElement = document.querySelector(".details-container p");
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  messageElement.style.opacity = 0;

  setTimeout(() => {
    if (totalCount > 0 && completedCount === totalCount) {
      messageElement.textContent = "🎉 All tasks completed! You nailed it! 🏆";
    } else if (task.completed) {
      const randomMsg = motivationalTexts[Math.floor(Math.random() * motivationalTexts.length)];
      messageElement.textContent = randomMsg;
    } else {
      messageElement.textContent = "Keep it up! 💪";
    }
    messageElement.style.opacity = 1;
  }, 250);
};

// 🟢 Delete task (backend sync)
const deleteTask = async (index) => {
  const task = tasks[index];
  await fetch(`${API_URL}/tasks/${task.id}`, { method: "DELETE" });
  tasks.splice(index, 1);
  renderTasks();
};

// 🟢 Edit task (frontend only for now)
const editTask = (index) => {
  const newText = prompt("Edit your task:", tasks[index].text);
  if (newText !== null && newText.trim() !== "") {
    tasks[index].text = newText.trim();
    renderTasks();
  }
};

// 🟢 Update progress
const updateProgress = () => {
  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const progress = total ? (completed / total) * 100 : 0;

  document.getElementById("progress").style.width = `${progress}%`;
  document.getElementById("numbers").textContent = `${completed}/${total}`;
};

// 🟢 Load tasks on page start + set footer year
document.addEventListener("DOMContentLoaded", async () => {
  await loadTasks();

  const footer = document.querySelector(".footer p");
  if (footer) {
    const year = new Date().getFullYear();
    footer.innerHTML = `© ${year} <span id="app-name">Zentask</span>. All rights reserved.`;
  }
});

// 🟢 Form submit
document.getElementById("task-form").addEventListener("submit", (e) => {
  e.preventDefault();
  addTask();
});

