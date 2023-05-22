import React from "react";
import logo from "./logo.svg";
import "./App.scss";

interface TodoProps {
  id: number;
  x: number;
  y: number;
  zIndex: number;
  moveToTop: (id: number) => void;
}
function Todo({ id, x, y, zIndex, moveToTop }: TodoProps) {
  const initialWidth = 200;
  const placeholder = `${x}, ${y}`;
  return (
    <div
      className="TodoBox"
      style={{
        left: x - initialWidth / 2,
        top: y - initialWidth / 2,
        width: initialWidth,
        minHeight: initialWidth,
        zIndex,
      }}
      onClick={(clickEvent) => {
        moveToTop(id);
        clickEvent.stopPropagation();
      }}
    >
      <textarea className="text" placeholder={placeholder}></textarea>
      <div className="buttons">
        <button className="btn btn-success">Mark done</button>
        <button className="btn btn-danger">Delete</button>
      </div>
    </div>
  );
}

interface AllTodosState {
  todos: TodoProps[];
  zIndexMax: number;
  idMax: number;
}

interface MoveToTopAction {
  type: "moveToTop";
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
type TodoReducerAction = MoveToTopAction | CreateAction | ClearAction;

function App() {
  const initialTodoState: AllTodosState = { todos: [], zIndexMax: 0, idMax: 0 };
  const [todos, dispatchTodos] = React.useReducer(
    todoReducer,
    initialTodoState
  );

  function moveToTop(id: number): void {
    dispatchTodos({ type: "moveToTop", id });
  }

  function todoReducer(
    previous: AllTodosState,
    action: TodoReducerAction
  ): AllTodosState {
    const nextZ = previous.zIndexMax + 1;
    switch (action.type) {
      case "moveToTop":
        return {
          idMax: previous.idMax,
          zIndexMax: nextZ,
          todos: previous.todos.map((todo) =>
            todo.id === action.id ? { ...todo, zIndex: nextZ } : todo
          ),
        };
      case "create":
        const nextId = previous.idMax + 1;
        return {
          idMax: nextId,
          zIndexMax: nextZ,
          todos: [
            ...previous.todos,
            {
              id: nextId,
              x: action.x,
              y: action.y,
              zIndex: nextZ,
              moveToTop: (id) => moveToTop(id),
            },
          ],
        };
      case "clear":
        return {
          idMax: 0,
          zIndexMax: 0,
          todos: [],
        };
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
        onClick={(clickEvent) => {
          dispatchTodos({
            type: "create",
            x: clickEvent.nativeEvent.offsetX,
            y: clickEvent.nativeEvent.offsetY,
          });
        }}
      >
        {todos.todos.map((todo) => (
          <Todo
            x={todo.x}
            y={todo.y}
            zIndex={todo.zIndex}
            id={todo.id}
            moveToTop={() => moveToTop(todo.id)}
          />
        ))}
      </div>
      <div className="AppFooter">Footer</div>
    </div>
  );
}

export default App;
