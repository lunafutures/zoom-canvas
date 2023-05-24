import React from "react";
import "./App.scss";

import TextField from "@mui/material/TextField";

interface TodoProps {
  id: number;
  x: number;
  y: number;
  zIndex: number;
  isActive: boolean;
  select: (id: number) => void;
}
function Todo({ id, x, y, zIndex, isActive, select }: TodoProps) {
  const initialWidth = 200;
  return (
    <div
      className={`TodoBox ${isActive ? "active" : ""}`}
      style={{
        width: initialWidth,
        minHeight: initialWidth,
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
        zIndex,
      }}
      onClick={(clickEvent) => {
        select(id);
        clickEvent.stopPropagation();
      }}
    >
      <TextField multiline className="text" placeholder="Task description" />
    </div>
  );
}

interface AllTodosState {
  todos: TodoProps[];
  zIndexMax: number;
  idMax: number;
}

interface SelectAction {
  type: "select";
  id: number;
}
interface CreateAction {
  type: "create";
  x: number;
  y: number;
}
interface ClearAction {
  type: "clear";
}
interface DeselectAction {
  type: "deselect";
}
type TodoReducerAction =
  | SelectAction
  | CreateAction
  | ClearAction
  | DeselectAction;

function App() {
  const initialTodoState: AllTodosState = { todos: [], zIndexMax: 0, idMax: 0 };
  const [todos, dispatchTodos] = React.useReducer(
    todoReducer,
    initialTodoState
  );

  function select(id: number): void {
    dispatchTodos({ type: "select", id });
  }

  function clearActive(todos: TodoProps[]) {
    return todos.map((todo) => {
      return { ...todo, isActive: false };
    });
  }

  function todoReducer(
    previous: AllTodosState,
    action: TodoReducerAction
  ): AllTodosState {
    const nextZ = previous.zIndexMax + 1;
    switch (action.type) {
      case "select":
        return {
          idMax: previous.idMax,
          zIndexMax: nextZ,
          todos: clearActive(previous.todos).map((todo) =>
            todo.id === action.id
              ? { ...todo, zIndex: nextZ, isActive: true }
              : todo
          ),
        };
      case "create":
        const nextId = previous.idMax + 1;
        return {
          idMax: nextId,
          zIndexMax: nextZ,
          todos: [
            ...clearActive(previous.todos),
            {
              id: nextId,
              x: action.x,
              y: action.y,
              zIndex: nextZ,
              isActive: true,
              select: (id) => select(id),
            },
          ],
        };
      case "clear":
        return {
          idMax: 0,
          zIndexMax: 0,
          todos: [],
        };
      case "deselect":
        return { ...previous, todos: clearActive(previous.todos) };
    }
  }

  return (
    <div className="App">
      <div className="AppHeader">
        <button onClick={() => dispatchTodos({ type: "clear" })}>
          Clear All
        </button>
      </div>
      <div
        className="AppBody"
        onClick={() => dispatchTodos({ type: "deselect" })}
        onDoubleClick={(clickEvent) => {
          dispatchTodos({
            type: "create",
            x: clickEvent.nativeEvent.offsetX,
            y: clickEvent.nativeEvent.offsetY,
          });
        }}
        // TODO for demonstration:
        onMouseDown={(e) => {
          if (e.buttons !== 4) {
            return;
          }
          console.log("down", {
            x: e.nativeEvent.offsetX,
            y: e.nativeEvent.offsetY,
          });
        }}
        onMouseMove={(e) => {
          if (e.buttons !== 4) {
            return;
          }
          console.log("move", {
            x: e.nativeEvent.offsetX,
            y: e.nativeEvent.offsetY,
          });
        }}
        onMouseUp={(e) => {
          console.log("up", {
            x: e.nativeEvent.offsetX,
            y: e.nativeEvent.offsetY,
          });
        }}
      >
        {todos.todos.map((todo) => (
          <Todo
            x={todo.x}
            y={todo.y}
            zIndex={todo.zIndex}
            key={todo.id}
            id={todo.id}
            isActive={todo.isActive}
            select={() => select(todo.id)}
          />
        ))}
      </div>
      <div className="AppFooter">Footer</div>
    </div>
  );
}

export default App;
