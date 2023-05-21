import React from "react";
import logo from "./logo.svg";
import "./App.css";

interface TodoProps {
  id: number;
  x: number;
  y: number;
  zIndex: number;
  moveToTop: (id: number) => void;
}
function Todo({ id, x, y, zIndex, moveToTop }: TodoProps) {
  const initialWidth = 150;
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
      {x}, {y}
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
type TodoReducerAction = MoveToTopAction | CreateAction;

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
    }
  }

  return (
    <div className="App">
      <div className="AppHeader">Header</div>
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
