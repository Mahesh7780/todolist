const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const PORT = 5000;

let tasks = []; // temporary in-memory storage

app.use(cors());
app.use(bodyParser.json());

// Get all tasks
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// Add new task
app.post("/tasks", (req, res) => {
  const { text } = req.body;
  const newTask = { id: Date.now(), text, completed: false };
  tasks.push(newTask);
  res.json(newTask);
});

// Toggle completion
app.put("/tasks/:id", (req, res) => {
  const task = tasks.find(t => t.id == req.params.id);
  if (task) {
    task.completed = !task.completed;
    res.json(task);
  } else {
    res.status(404).json({ message: "Task not found" });
  }
});

// Delete task
app.delete("/tasks/:id", (req, res) => {
  tasks = tasks.filter(t => t.id != req.params.id);
  res.json({ message: "Deleted" });
});

app.listen(PORT, () =>
  console.log(`✅ Backend running on http://localhost:${PORT}`)
);
