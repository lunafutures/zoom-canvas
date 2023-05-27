import { BrowserRouter, Routes, Route } from "react-router-dom";
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
function TodoComponent({ id, x, y, zIndex, isActive, select }: TodoProps) {
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
      <TextField
        onKeyDown={(e) => {
          // Prevents the delete key from deleting the note while editing text
          e.stopPropagation();
        }}
        multiline
        className="text"
        placeholder="Task description"
        spellCheck={isActive}
      />
    </div>
  );
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
interface DeleteActiveAction {
  type: "delete-active";
}
type TodoReducerAction =
  | SelectAction
  | CreateAction
  | ClearAction
  | DeselectAction
  | DeleteActiveAction;
interface AllTodosState {
  todos: TodoProps[];
  zIndexMax: number;
  idMax: number;
}
function useTodoReducer() {
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
      case "delete-active":
        return {
          ...previous,
          todos: previous.todos.filter((todo) => !todo.isActive),
        };
    }
  }

  return {
    todos,
    dispatchTodos,
    select,
    clearActive,
  };
}

type Point = { x: number; y: number };
interface TodoCollectionProps {
  center: Point;
  todos: AllTodosState;
  select: (id: number) => void;
}
function TodoCollectionComponent({
  center,
  todos,
  select,
}: TodoCollectionProps) {
  return (
    <>
      {todos.todos.map((todo) => (
        <TodoComponent
          x={todo.x - center.x}
          y={todo.y - center.y}
          zIndex={todo.zIndex}
          key={todo.id}
          id={todo.id}
          isActive={todo.isActive}
          select={() => select(todo.id)}
        />
      ))}
    </>
  );
}

interface StartDrag {
  type: "start-drag";
  point: Point;
}
interface UpdateDrag {
  type: "update-drag";
  point: Point;
}
interface EndDrag {
  type: "end-drag";
}
type PositioningAction = StartDrag | UpdateDrag | EndDrag;
interface Positioning {
  startDrag?: Point;
  endDrag?: Point;
  previousCenter: Point;

  center: Point;
}
function useCanvasPositionReducer() {
  const initialPosition: Positioning = {
    startDrag: undefined,
    endDrag: undefined,
    previousCenter: { x: 0, y: 0 },
    center: { x: 0, y: 0 },
  };
  const [position, dispatchPosition] = React.useReducer(
    positionReducer,
    initialPosition
  );

  function calculatePosition(before: Positioning): Positioning {
    if (before.startDrag === undefined || before.endDrag === undefined) {
      return before;
    }
    return {
      ...before,
      center: {
        x: before.previousCenter.x + (before.startDrag.x - before.endDrag.x),
        y: before.previousCenter.y + (before.startDrag.y - before.endDrag.y),
      },
    };
  }

  function positionReducer(
    previous: Positioning,
    action: PositioningAction
  ): Positioning {
    switch (action.type) {
      case "start-drag":
        return calculatePosition({
          ...previous,
          startDrag: action.point,
          endDrag: action.point,
        });
      case "update-drag":
        return calculatePosition({
          ...previous,
          endDrag: action.point,
        });
      case "end-drag":
        return {
          startDrag: undefined,
          endDrag: undefined,
          previousCenter: previous.center,
          center: previous.center,
        };
    }
  }

  return {
    position,
    dispatchPosition,
  };
}

function CanvasComponent() {
  const { todos, dispatchTodos, select } = useTodoReducer();
  const { position, dispatchPosition } = useCanvasPositionReducer();

  React.useEffect(() => {
    function documentKeyListener(e: KeyboardEvent) {
      if (e.key === "Delete") {
        dispatchTodos({ type: "delete-active" });
      }
    }
    document.addEventListener("keydown", documentKeyListener);

    return () => {
      document.removeEventListener("keydown", documentKeyListener);
    };
  });

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
          if (clickEvent.currentTarget !== clickEvent.target) return;
          dispatchTodos({
            type: "create",
            x: clickEvent.nativeEvent.offsetX + position.center.x,
            y: clickEvent.nativeEvent.offsetY + position.center.y,
          });
        }}
        onMouseDown={(e) => {
          if (e.buttons !== 4) return;

          dispatchPosition({
            type: "start-drag",
            point: {
              // Use clientX instead of nativeEvent.offsetX so that if you mouse over a child element,
              // the value won't suddenly shift (offsetX is relative to the child, clientX is global for all elements)
              x: e.clientX,
              y: e.clientY,
            },
          });
        }}
        onMouseMove={(e) => {
          if (e.buttons !== 4) return;

          dispatchPosition({
            type: "update-drag",
            point: {
              x: e.clientX,
              y: e.clientY,
            },
          });
        }}
        onMouseUp={() => {
          dispatchPosition({ type: "end-drag" });
        }}
      >
        <TodoCollectionComponent
          center={position.center}
          todos={todos}
          select={select}
        />
      </div>
      <div className="AppFooter">Footer</div>
    </div>
  );
}

function Demo() {
  function click(name: string, e: React.MouseEvent) {
    console.log(
      `${name}: target ${(e.target as HTMLElement).id} currentTarget ${
        e.currentTarget.id
      }`
    );
  }

  function key(name: string, e: React.KeyboardEvent) {
    console.log(name, e.key);
  }

  const styling: React.CSSProperties = {
    border: "1px solid white",
    padding: "10px",
  };
  return (
    <div style={{ background: "black", color: "white", height: "100vh" }}>
      <div
        id="one"
        onClick={(e) => click("1", e)}
        onKeyDown={(e) => key("1", e)}
        style={styling}
      >
        1
        <div
          id="two"
          onClick={(e) => click("2", e)}
          onKeyDown={(e) => key("2", e)}
          style={styling}
        >
          2
          <textarea
            id="three"
            onClick={(e) => click("3", e)}
            onKeyDown={(e) => {
              key("3", e);
              if (e.key === "Delete") {
                e.stopPropagation();
              }
            }}
            style={styling}
          >
            3
          </textarea>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/demo" element={<Demo />} />
        <Route path="/" element={<CanvasComponent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
