import React from "react";

function TaskList({ tasks, deleteTask, toggleCompletion }) {
  return (
    <ul className="bg-white task-list">
      {tasks.map((task, index) => (
        <li key={index}>
          <span
            onClick={() => toggleCompletion(index)}
            style={{
              textDecoration: task.completed ? "line-through" : "none",
              cursor: "pointer",
            }}
          >
            {task.text}
          </span>
          <button className="delete-button" onClick={() => deleteTask(index)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}

export default TaskList;
