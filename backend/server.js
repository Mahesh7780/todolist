const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const PORT = 5001;

let tasks = []; 

app.use(cors());
app.use(bodyParser.json());


app.get("/tasks", (req, res) => {
  res.json(tasks);
});


app.post("/tasks", (req, res) => {
  const { text } = req.body;
  const newTask = { id: Date.now(), text, completed: false };
  tasks.push(newTask);
  res.json(newTask);
});

app.put("/tasks/:id", (req, res) => {
  const task = tasks.find(t => t.id == req.params.id);
  if (task) {
    task.completed = !task.completed;
    res.json(task);
  } else {
    res.status(404).json({ message: "Task not found" });
  }
});


app.delete("/tasks/:id", (req, res) => {
  tasks = tasks.filter(t => t.id != req.params.id);
  res.json({ message: "Deleted" });
});

app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);

