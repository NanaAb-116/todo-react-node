import "./App.css";
import React, { useState, useEffect } from "react";
import Todos from "./components/Todos";
import { useCallback } from "react";
import axios from "axios";
import AddTodo from "./components/AddTodo";

function App() {
  const [list, setList] = useState([]);
  const [todoItem, setTodoItem] = useState("");
  const [editID, setEditID] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState("all");
  const [filteredTodos, setFilteredTodos] = useState([]);
  const [alert, setAlert] = useState("");

  const fetch = async () => {
    try {
      const { data = { data } } = await axios.get(
        "https://todo-node-production.up.railway.app/api/v1/todos/"
      );
      console.log(data.data.todos);
      setList(data.data.todos);
    } catch (error) {
      console.log(error.message);
    }
  };

  const filterHandler = useCallback(() => {
    switch (status) {
      case "completed":
        setFilteredTodos(list.filter((todo) => todo.completed === true));
        break;
      case "uncompleted":
        setFilteredTodos(list.filter((todo) => todo.completed === false));
        break;
      default:
        setFilteredTodos(list);
        break;
    }
  }, [list, status]);

  useEffect(() => {
    fetch();
  }, []);
  useEffect(() => {
    filterHandler();
  }, [filterHandler]);

  const showAlert = (msg) => {
    setAlert(msg);
    const timeout = setTimeout(() => {
      setAlert("");
    }, 2000);

    return () => clearTimeout(timeout);
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(
        `https://todo-node-production.up.railway.app/api/v1/todos/${id}`
      );
      fetch();
    } catch (error) {
      console.log(error.message);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!todoItem) {
      showAlert("You Didn't Enter Anything");
    } else if (todoItem && isEditing) {
      try {
        await axios.patch(
          `https://todo-node-production.up.railway.app/api/v1/todos/${editID}`,
          {
            name: todoItem,
          }
        );
        fetch();
      } catch (error) {
        console.log(error.message);
      }
    } else {
      try {
        await axios.post(
          "https://todo-node-production.up.railway.app/api/v1/todos/",
          { name: todoItem }
        );
        fetch();
      } catch (error) {
        console.log(error.message);
      }
    }
    setTodoItem("");
    setIsEditing(false);
    setEditID("");
  };
  const handleEdit = async (item) => {
    setEditID(item._id);
    setIsEditing(true);
    setTodoItem(item.name);
  };

  const completeTodo = async (item) => {
    try {
      await axios.patch(
        `https://todo-node-production.up.railway.app/api/v1/todos/${item._id}`,
        {
          name: item.name,
          completed: !item.completed,
        }
      );
      fetch();
    } catch (error) {
      console.log(error.message);
    }
  };

  const statusHandler = (e) => {
    setStatus(e.target.value);
  };

  return (
    <section className="main-container">
      <div className="todo-app">
        <h1 className="title">Todo List</h1>
        <div className="alert">
          <p>{alert}</p>
        </div>
        <AddTodo
          submitHandler={submitHandler}
          todoItem={todoItem}
          statusHandler={statusHandler}
          setTodoItem={setTodoItem}
          isEditing={isEditing}
        />
        {list?.length > 0 && (
          <div className="todos-container">
            <Todos
              list={list}
              deleteTodo={deleteTodo}
              handleEdit={handleEdit}
              completeTodo={completeTodo}
              filteredTodos={filteredTodos}
            />
          </div>
        )}
      </div>
    </section>
  );
}

export default App;
