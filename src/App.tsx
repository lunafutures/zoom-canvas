import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import "./App.scss";

import TextField from "@mui/material/TextField";
import _ from "lodash";

type Point = { x: number; y: number };
const DispatchTodosContext = React.createContext<
  (value: TodoReducerAction) => void
>(undefined as any);

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
  const dispatchTodos = React.useContext(DispatchTodosContext);
  return (
    <div
      className={`TodoBox ${isActive ? "active" : ""}`}
      style={{
        width: initialWidth,
        minHeight: initialWidth,
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
        zIndex,
      }}
      onClick={(e) => {
        select(id);
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        if (e.buttons !== 1) return;
        select(id);
        dispatchTodos({
          type: "start-drag",
          itemUnderDrag: id,
          point: { x, y },
        });
      }}
    >
      <TextField
        onKeyDown={(e) => {
          // Prevents the delete key from deleting the note while editing text
          e.stopPropagation();
        }}
        autoFocus
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
interface StartDrag {
  type: "start-drag";
  itemUnderDrag: number | "pan";
  point: Point;
}
interface UpdateDrag {
  type: "update-drag";
  point: Point;
}
interface EndDrag {
  type: "end-drag";
}
type TodoReducerAction =
  | SelectAction
  | CreateAction
  | ClearAction
  | DeselectAction
  | DeleteActiveAction
  | StartDrag
  | UpdateDrag
  | EndDrag;

interface Delta {
  startDrag: Point;
  endDrag: Point;
  previousPosition: Point;
  newPosition: Point;
  itemUnderDrag: number | "pan";
}
interface AllTodosState {
  todos: TodoProps[];
  zIndexMax: number;
  idMax: number;
  delta?: Delta;
  center: Point;
}
function useTodoReducer() {
  const initialTodoState: AllTodosState = {
    todos: [],
    zIndexMax: 0,
    idMax: 0,
    delta: undefined,
    center: { x: 0, y: 0 },
  };
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

  function updateDrag(endDrag: Point, previous: AllTodosState): AllTodosState {
    if (previous.delta === undefined) {
      return previous;
    }

    const startDrag = previous.delta.startDrag;
    const delta = subtractPoints(startDrag, endDrag);
    const previousPosition = previous.delta.previousPosition;

    if (previous.delta?.itemUnderDrag === "pan") {
      const newPosition = addPoints(previousPosition, delta);
      return {
        ...previous,
        delta: {
          startDrag,
          endDrag,
          previousPosition,
          newPosition,
          itemUnderDrag: previous.delta.itemUnderDrag,
        },
        center: newPosition,
      };
    } else {
      const newPosition = subtractPoints(previousPosition, delta);
      return {
        ...previous,
        delta: {
          startDrag,
          endDrag,
          previousPosition,
          newPosition,
          itemUnderDrag: previous.delta.itemUnderDrag,
        },
        todos: previous.todos.map((todo) => {
          if (todo.id !== previous.delta?.itemUnderDrag) {
            return todo;
          } else {
            return {
              ...todo,
              x: newPosition.x,
              y: newPosition.y,
            };
          }
        }),
      };
    }
  }

  function addPoints(point1: Point, point2: Point): Point {
    return {
      x: point1.x + point2.x,
      y: point1.y + point2.y,
    };
  }

  function subtractPoints(point1: Point, point2: Point): Point {
    return {
      x: point1.x - point2.x,
      y: point1.y - point2.y,
    };
  }

  function itemToPoint(todo: TodoProps): Point {
    return { x: todo.x, y: todo.y };
  }

  function todoReducer(
    previous: AllTodosState,
    action: TodoReducerAction
  ): AllTodosState {
    const nextZ = previous.zIndexMax + 1;
    switch (action.type) {
      case "select":
        return {
          ...previous,
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
          ...previous,
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
          ...previous,
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

      case "start-drag":
        const startPosition =
          action.itemUnderDrag === "pan"
            ? previous.center
            : itemToPoint(
                _.find(
                  previous.todos,
                  (todo) => todo.id === action.itemUnderDrag
                )!
              );

        return {
          ...previous,
          delta: {
            itemUnderDrag: action.itemUnderDrag,
            startDrag: action.point,
            endDrag: action.point,
            previousPosition: startPosition,
            newPosition: startPosition,
          },
        };
      case "update-drag":
        return updateDrag(action.point, previous);
      case "end-drag": // TODO
        return { ...previous, delta: undefined };
    }
  }

  return {
    todos,
    dispatchTodos,
    select,
    clearActive,
  };
}

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

function CanvasComponent() {
  const { todos, dispatchTodos, select } = useTodoReducer();

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
        onDoubleClick={(e) => {
          if (e.currentTarget !== e.target) return;
          dispatchTodos({
            type: "create",
            x: e.nativeEvent.offsetX + todos.center.x,
            y: e.nativeEvent.offsetY + todos.center.y,
          });
        }}
        onMouseDown={(e) => {
          if (e.buttons !== 4) return;

          dispatchTodos({
            type: "start-drag",
            itemUnderDrag: "pan",
            point: {
              // Use clientX instead of nativeEvent.offsetX so that if you mouse over a child element,
              // the value won't suddenly shift (offsetX is relative to the child, clientX is global for all elements)
              x: e.clientX,
              y: e.clientY,
            },
          });
        }}
        onMouseMove={(e) => {
          if (e.buttons === 4 || e.buttons === 1) {
            dispatchTodos({
              type: "update-drag",
              point: {
                x: e.clientX,
                y: e.clientY,
              },
            });
          }
        }}
        onMouseUp={() => {
          dispatchTodos({ type: "end-drag" });
        }}
      >
        <DispatchTodosContext.Provider value={dispatchTodos}>
          <TodoCollectionComponent
            center={todos.center}
            todos={todos}
            select={select}
          />
        </DispatchTodosContext.Provider>
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
