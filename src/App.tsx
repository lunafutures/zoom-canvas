import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import "./App.scss";

import TextField from "@mui/material/TextField";
import _ from "lodash";

type Point = { x: number; y: number };
const DispatchNotesContext = React.createContext<
  (value: NoteReducerAction) => void
>(undefined as any);

interface NoteProps {
  id: number;
  x: number;
  y: number;
  zIndex: number;
  isActive: boolean;
  text: string;
  select: (id: number) => void;
  setText: (id: number, text: string) => void;
}
function NoteComponent({
  id,
  x,
  y,
  zIndex,
  isActive,
  text,
  select,
  setText,
}: NoteProps) {
  const initialWidth = 200;
  const dispatchNotes = React.useContext(DispatchNotesContext);

  return (
    <div
      className={`NoteBox ${isActive ? "active" : ""}`}
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
        dispatchNotes({
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
        onMouseMove={(e) => e.stopPropagation()}
        autoFocus
        multiline
        className="text"
        placeholder="Task description"
        spellCheck={isActive}
        defaultValue={text}
        onInput={(e) => {
          const newText = (e.target as HTMLTextAreaElement).value;
          setText(id, newText);
        }}
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
interface UpdateTextAction {
  type: "update-text";
  id: number;
  text: string;
}
interface DeleteActiveAction {
  type: "delete-active";
}
interface StartDragAction {
  type: "start-drag";
  itemUnderDrag: number | "pan";
  point: Point;
}
interface UpdateDragAction {
  type: "update-drag";
  point: Point;
}
interface EndDragAction {
  type: "end-drag";
}
type NoteReducerAction =
  | SelectAction
  | CreateAction
  | ClearAction
  | DeselectAction
  | UpdateTextAction
  | DeleteActiveAction
  | StartDragAction
  | UpdateDragAction
  | EndDragAction;

interface Delta {
  startDrag: Point;
  endDrag: Point;
  previousPosition: Point;
  newPosition: Point;
  itemUnderDrag: number | "pan";
}
interface AllNotesState {
  notes: NoteProps[];
  zIndexMax: number;
  idMax: number;
  delta?: Delta;
  center: Point;
}
function useNoteReducer() {
  const initialNoteState: AllNotesState = {
    notes: [],
    zIndexMax: 0,
    idMax: 0,
    delta: undefined,
    center: { x: 0, y: 0 },
  };
  const [notes, dispatchNotes] = React.useReducer(
    noteReducer,
    undefined,
    () => {
      const item = localStorage.getItem("notes");
      return item ? (JSON.parse(item) as AllNotesState) : initialNoteState;
    }
  );

  React.useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  });

  function select(id: number): void {
    dispatchNotes({ type: "select", id });
  }

  function setText(id: number, text: string): void {
    dispatchNotes({ type: "update-text", id, text });
  }

  function clearActive(notes: NoteProps[]) {
    return notes.map((note) => {
      return { ...note, isActive: false };
    });
  }

  function updateDrag(endDrag: Point, previous: AllNotesState): AllNotesState {
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
        notes: previous.notes.map((note) => {
          if (note.id !== previous.delta?.itemUnderDrag) {
            return note;
          } else {
            return {
              ...note,
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

  function itemToPoint(note: NoteProps): Point {
    return { x: note.x, y: note.y };
  }

  function noteReducer(
    previous: AllNotesState,
    action: NoteReducerAction
  ): AllNotesState {
    const nextZ = previous.zIndexMax + 1;
    switch (action.type) {
      case "select":
        return {
          ...previous,
          idMax: previous.idMax,
          zIndexMax: nextZ,
          notes: clearActive(previous.notes).map((note) =>
            note.id === action.id
              ? { ...note, zIndex: nextZ, isActive: true }
              : note
          ),
        };
      case "create":
        const nextId = previous.idMax + 1;
        return {
          ...previous,
          idMax: nextId,
          zIndexMax: nextZ,
          notes: [
            ...clearActive(previous.notes),
            {
              id: nextId,
              x: action.x,
              y: action.y,
              zIndex: nextZ,
              isActive: true,
              text: "",
              select,
              setText,
            },
          ],
        };
      case "clear":
        return {
          ...previous,
          idMax: 0,
          zIndexMax: 0,
          notes: [],
        };
      case "deselect":
        return { ...previous, notes: clearActive(previous.notes) };
      case "update-text":
        return {
          ...previous,
          notes: previous.notes.map((note) => {
            return note.id === action.id
              ? { ...note, text: action.text }
              : note;
          }),
        };
      case "delete-active":
        return {
          ...previous,
          notes: previous.notes.filter((note) => !note.isActive),
        };

      case "start-drag":
        const startPosition =
          action.itemUnderDrag === "pan"
            ? previous.center
            : itemToPoint(
                _.find(
                  previous.notes,
                  (note) => note.id === action.itemUnderDrag
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
    notes,
    dispatchNotes,
    select,
    clearActive,
    setText,
  };
}

interface NoteCollectionProps {
  center: Point;
  notes: AllNotesState;
  select: (id: number) => void;
  setText: (id: number, text: string) => void;
}
function NoteCollectionComponent({
  center,
  notes,
  select,
  setText,
}: NoteCollectionProps) {
  return (
    <>
      {notes.notes.map((note) => (
        <NoteComponent
          x={note.x - center.x}
          y={note.y - center.y}
          zIndex={note.zIndex}
          key={note.id}
          id={note.id}
          isActive={note.isActive}
          text={note.text}
          select={select}
          setText={setText}
        />
      ))}
    </>
  );
}

function CanvasComponent() {
  const { notes, dispatchNotes, select, setText } = useNoteReducer();

  React.useEffect(() => {
    function documentKeyListener(e: KeyboardEvent) {
      if (e.key === "Delete") {
        dispatchNotes({ type: "delete-active" });
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
        <button onClick={() => dispatchNotes({ type: "clear" })}>
          Clear All
        </button>
      </div>
      <div
        className="AppBody"
        onClick={() => dispatchNotes({ type: "deselect" })}
        onDoubleClick={(e) => {
          if (e.currentTarget !== e.target) return;
          dispatchNotes({
            type: "create",
            x: e.nativeEvent.offsetX + notes.center.x,
            y: e.nativeEvent.offsetY + notes.center.y,
          });
        }}
        onMouseDown={(e) => {
          if (e.buttons !== 4) return;

          dispatchNotes({
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
            dispatchNotes({
              type: "update-drag",
              point: {
                x: e.clientX,
                y: e.clientY,
              },
            });
          }
        }}
        onMouseUp={() => {
          dispatchNotes({ type: "end-drag" });
        }}
      >
        <DispatchNotesContext.Provider value={dispatchNotes}>
          <NoteCollectionComponent
            center={notes.center}
            notes={notes}
            select={select}
            setText={setText}
          />
        </DispatchNotesContext.Provider>
        <div
          className="center"
          style={{ left: -notes.center.x, top: -notes.center.y }}
        >
          center
        </div>
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
