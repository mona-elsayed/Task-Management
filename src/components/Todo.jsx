import React, { useState, useEffect } from "react";
import axios from "axios"; // Ensure axios is installed
import Countdown from "./Countdown"; // Adjust the path based on your project structure

const Todo = () => {
  // Form State
  const [inputTitle, setInputTitle] = useState("");
  const [inputDesc, setInputDesc] = useState("");
  const [inputCategory, setInputCategory] = useState("Work");
  const [inputPriority, setInputPriority] = useState("Medium");
  const [inputDueDate, setInputDueDate] = useState("");

  // Task List State
  const [items, setItems] = useState([]);

  // Editing State
  const [editTaskData, setEditTaskData] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);

  // Filter and Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  // Sorting State
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" for ascending, "desc" for descending

  // Loading and Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Effect to Load Tasks from the database on Mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Function to fetch tasks from the backend
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5001/tasks");
      setItems(response.data);
      setError(null);
    } catch (err) {
      console.error("Error loading tasks:", err);
      setError("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  // Input Handlers
  const handleInputTitle = (e) => setInputTitle(e.target.value);
  const handleInputDesc = (e) => setInputDesc(e.target.value);
  const handleInputCategory = (e) => setInputCategory(e.target.value);
  const handleInputPriority = (e) => setInputPriority(e.target.value);
  const handleInputDueDate = (e) => setInputDueDate(e.target.value);

  // Add a New Task
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputTitle.trim() || !inputDesc.trim() || !inputDueDate) {
      setError("Please fill in all required fields.");
      return;
    }

    const newTask = {
      name: inputTitle.trim(),
      desc: inputDesc.trim(),
      category: inputCategory,
      priority: inputPriority,
      dueDate: inputDueDate,
      status: "in-progress",
    };

    try {
      const response = await axios.post("http://localhost:5001/tasks", newTask);
      setItems([...items, response.data]);
      resetForm();
      setError(null);
      setSuccessMessage("Task added successfully!");
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error adding task:", err);
      setError("Failed to add task.");
    }
  };

  // Edit Task
  const handleEdit = (task) => {
    setEditingTaskId(task.id);
    setEditTaskData({ ...task });
    setError(null);
    setSuccessMessage(null);
  };

  // Save Edited Task
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (
      !editTaskData.name.trim() ||
      !editTaskData.desc.trim() ||
      !editTaskData.dueDate
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    const updatedTask = {
      name: editTaskData.name.trim(),
      desc: editTaskData.desc.trim(),
      category: editTaskData.category,
      priority: editTaskData.priority,
      dueDate: editTaskData.dueDate,
      status: editTaskData.status, // Preserve the current status
    };

    try {
      const response = await axios.put(
        `http://localhost:5001/tasks/${editTaskData.id}`,
        updatedTask
      );
      setItems(
        items.map((task) =>
          task.id === response.data.id ? response.data : task
        )
      );
      setEditingTaskId(null);
      setEditTaskData(null);
      setError(null);
      setSuccessMessage("Task updated successfully!");
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task.");
    }
  };

  // Delete Task
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5001/tasks/${id}`);
      setItems(items.filter((task) => task.id !== id));
      setError(null);
      setSuccessMessage("Task deleted successfully!");
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task.");
    }
  };

  // Change Task Status
  const handleStatusChange = async (id) => {
    const taskToUpdate = items.find((task) => task.id === id);
    if (!taskToUpdate) return;

    const updatedStatus =
      taskToUpdate.status === "in-progress" ? "completed" : "in-progress";

    try {
      const response = await axios.put(`http://localhost:5001/tasks/${id}`, {
        ...taskToUpdate,
        status: updatedStatus,
      });
      setItems(
        items.map((task) =>
          task.id === response.data.id ? response.data : task
        )
      );
      setError(null);
      setSuccessMessage("Task status updated!");
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error updating task status:", err);
      setError("Failed to update task status.");
    }
  };

  // Reset Form Fields
  const resetForm = () => {
    setInputTitle("");
    setInputDesc("");
    setInputCategory("Work");
    setInputPriority("Medium");
    setInputDueDate("");
  };

  // Filter and Search Tasks
  const filteredTasks = items.filter((task) => {
    if (filter !== "all" && task.status !== filter) {
      return false;
    }
    return (
      task.name.toLowerCase().includes(searchQuery) ||
      task.desc.toLowerCase().includes(searchQuery)
    );
  });

  // Sort Tasks by Due Date
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    return sortOrder === "asc"
      ? new Date(a.dueDate) - new Date(b.dueDate)
      : new Date(b.dueDate) - new Date(a.dueDate);
  });

  // Handle Changes in the Edit Form
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditTaskData({ ...editTaskData, [name]: value });
  };

  // Cancel Editing
  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditTaskData(null);
    setError(null);
    setSuccessMessage(null);
    resetForm();
  };

  return (
    <div className="container mx-auto my-8 p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Task Management</h1>

      {/* Display Success Message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      {/* Display Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Task Form */}
      <div className="border rounded shadow p-6 bg-yellow-100 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingTaskId ? "Edit Task" : "Add Task"}
        </h2>
        <form
          className="space-y-4"
          onSubmit={editingTaskId ? handleSaveEdit : handleSubmit}
        >
          <div>
            <label htmlFor="title" className="block mb-1 font-medium">
              Title<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              id="title"
              className="w-full p-2 border rounded focus:outline-none focus:ring"
              onChange={handleInputTitle}
              value={inputTitle}
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block mb-1 font-medium">
              Description<span className="text-red-500">*</span>
            </label>
            <textarea
              name="desc"
              id="description"
              className="w-full p-2 border rounded focus:outline-none focus:ring"
              onChange={handleInputDesc}
              value={inputDesc}
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="category" className="block mb-1 font-medium">
              Category
            </label>
            <select
              name="category"
              id="category"
              className="w-full p-2 border rounded"
              onChange={handleInputCategory}
              value={inputCategory}
            >
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label htmlFor="priority" className="block mb-1 font-medium">
              Priority
            </label>
            <select
              name="priority"
              id="priority"
              className="w-full p-2 border rounded"
              onChange={handleInputPriority}
              value={inputPriority}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div>
            <label htmlFor="dueDate" className="block mb-1 font-medium">
              Due Date<span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dueDate"
              id="dueDate"
              className="w-full p-2 border rounded focus:outline-none focus:ring"
              onChange={handleInputDueDate}
              value={inputDueDate}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded"
          >
            {editingTaskId ? "Update Task" : "Add Task"}
          </button>
        </form>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search..."
            className="p-2 border rounded"
            onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
          />
          <select
            className="p-2 border rounded"
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            className="p-2 border rounded"
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">Sort by Due Date Ascending</option>
            <option value="desc">Sort by Due Date Descending</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-purple-100 border rounded shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Tasks</h2>
        {loading ? (
          <p>Loading tasks...</p>
        ) : (
          <ul className="space-y-4">
            {sortedTasks.map((task) => (
              <li
                key={task.id}
                className="border p-4 rounded shadow bg-white hover:bg-gray-100"
              >
                <h3 className="font-semibold">{task.name}</h3>
                <p className="text-sm">{task.desc}</p>
                <p className="text-sm">
                  <strong>Category:</strong> {task.category}
                </p>
                <p className="text-sm">
                  <strong>Priority:</strong> {task.priority}
                </p>
                <p className="text-sm">
                  <strong>Due Date:</strong> {task.dueDate}
                </p>
                <p className="text-sm">
                  <strong>Status:</strong> {task.status}
                </p>
                <Countdown dueDate={task.dueDate} />
                <div className="flex justify-between mt-2">
                  <button
                    className="text-blue-500 hover:underline"
                    onClick={() => handleEdit(task)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-500 hover:underline"
                    onClick={() => handleDelete(task.id)}
                  >
                    Delete
                  </button>
                  <button
                    className="text-green-500 hover:underline"
                    onClick={() => handleStatusChange(task.id)}
                  >
                    {task.status === "in-progress" ? "Complete" : "in-progress"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Editing Task Modal */}
      {editingTaskId && editTaskData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h2 className="text-xl font-semibold mb-4">Edit Task</h2>
            <form onSubmit={handleSaveEdit}>
              <div>
                <label htmlFor="editTitle" className="block mb-1 font-medium">
                  Title<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="editTitle"
                  className="w-full p-2 border rounded focus:outline-none focus:ring"
                  onChange={handleEditInputChange}
                  value={editTaskData.name || ""}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="editDescription"
                  className="block mb-1 font-medium"
                >
                  Description<span className="text-red-500">*</span>
                </label>
                <textarea
                  name="desc"
                  id="editDescription"
                  className="w-full p-2 border rounded focus:outline-none focus:ring"
                  onChange={handleEditInputChange}
                  value={editTaskData.desc || ""}
                  required
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor="editCategory"
                  className="block mb-1 font-medium"
                >
                  Category
                </label>
                <select
                  name="category"
                  id="editCategory"
                  className="w-full p-2 border rounded"
                  onChange={handleEditInputChange}
                  value={editTaskData.category || "Work"}
                >
                  <option value="Work">Work</option>
                  <option value="Personal">Personal</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="editPriority"
                  className="block mb-1 font-medium"
                >
                  Priority
                </label>
                <select
                  name="priority"
                  id="editPriority"
                  className="w-full p-2 border rounded"
                  onChange={handleEditInputChange}
                  value={editTaskData.priority || "Medium"}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label htmlFor="editDueDate" className="block mb-1 font-medium">
                  Due Date<span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dueDate"
                  id="editDueDate"
                  className="w-full p-2 border rounded focus:outline-none focus:ring"
                  onChange={handleEditInputChange}
                  value={editTaskData.dueDate || ""}
                  required
                />
              </div>
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  className="text-gray-500 hover:underline"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-4 rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Todo;
