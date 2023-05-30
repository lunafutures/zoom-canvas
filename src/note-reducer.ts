import React from "react";
import _ from "lodash";
import { Point } from "./common";

interface SelectAction {
  type: "select";
  id: number;
}
interface CreateAction {
  type: "create";
  absoluteMousePoint: Point;
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
interface ZoomAction {
  type: "zoom";
  direction: "in" | "out";
  mouseLocation: Point;
}
export type NoteReducerAction =
  | SelectAction
  | CreateAction
  | ClearAction
  | DeselectAction
  | UpdateTextAction
  | DeleteActiveAction
  | StartDragAction
  | UpdateDragAction
  | EndDragAction
  | ZoomAction;

interface Delta {
  startDrag: Point;
  endDrag: Point;
  previousPosition: Point;
  newPosition: Point;
  itemUnderDrag: number | "pan";
}
export interface AllNotesState {
  notes: NoteState[];
  zIndexMax: number;
  idMax: number;
  delta?: Delta;
  center: Point;
  zoom: number;
}

export interface NoteState {
  id: number;
  x: number;
  y: number;
  zIndex: number;
  isActive: boolean;
  text: string;
}

export function useNoteReducer() {
  const initialNoteState: AllNotesState = {
    notes: [],
    zIndexMax: 0,
    idMax: 0,
    delta: undefined,
    center: new Point(0, 0),
    zoom: 1.0,
  };
  const [notes, dispatchNotes] = React.useReducer(
    noteReducer,
    undefined,
    () => {
      const item = localStorage.getItem("notes");
      if (!item) {
        return initialNoteState;
      }

      const loadValue = JSON.parse(item);
      return {
        ...loadValue,
        center: new Point(loadValue.center.x, loadValue.center.y),
      };
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

  function clearActive(notes: NoteState[]) {
    return notes.map((note) => {
      return { ...note, isActive: false };
    });
  }

  function updateDrag(endDrag: Point, previous: AllNotesState): AllNotesState {
    if (previous.delta === undefined) {
      return previous;
    }

    const startDrag = previous.delta.startDrag;
    const delta = startDrag.subtract(endDrag);
    const previousPosition = previous.delta.previousPosition;

    if (previous.delta?.itemUnderDrag === "pan") {
      const newPosition = previousPosition.subtract(delta);
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
      const scaledDelta = delta.scale(1 / previous.zoom);
      const newPosition = previousPosition.subtract(scaledDelta);
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

  function getNotePoint(note: NoteState): Point {
    return new Point(note.x, note.y);
  }

  function zoom(
    previous: AllNotesState,
    direction: "out" | "in",
    mouseLocation: Point
  ): AllNotesState {
    const zoomFactor = 1.2;
    const newZoom =
      direction === "out"
        ? previous.zoom / zoomFactor
        : previous.zoom * zoomFactor;
    const mouseToCenter = previous.center.subtract(mouseLocation);
    const scaledMouseToCenter = mouseToCenter.scale(newZoom / previous.zoom);
    const newCenter = scaledMouseToCenter.add(mouseLocation);
    return {
      ...previous,
      center: newCenter,
      zoom: newZoom,
    };
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
        const newPoint = action.absoluteMousePoint
          .subtract(previous.center)
          .scale(1 / previous.zoom);

        const nextId = previous.idMax + 1;
        return {
          ...previous,
          idMax: nextId,
          zIndexMax: nextZ,
          notes: [
            ...clearActive(previous.notes),
            {
              id: nextId,
              x: newPoint.x,
              y: newPoint.y,
              zIndex: nextZ,
              isActive: true,
              text: "",
            },
          ],
        };
      case "clear":
        return {
          ...previous,
          idMax: 0,
          zIndexMax: 0,
          zoom: 1,
          notes: [],
          center: new Point(0, 0),
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
            : getNotePoint(
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
      case "end-drag":
        return { ...previous, delta: undefined };
      case "zoom":
        return zoom(previous, action.direction, action.mouseLocation);
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

type DispatchNotesBundle = {
  dispatchNotes: (value: NoteReducerAction) => void;
  select: (id: number) => void;
  setText: (id: number, text: string) => void;
};
export const DispatchNotesContext = React.createContext<DispatchNotesBundle>(
  undefined as any
);
