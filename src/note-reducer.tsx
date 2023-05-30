import React from "react";
import { NoteProps } from "./note-component";
import _ from "lodash";
import { Point } from "./common";

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
export type NoteReducerAction =
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
export interface AllNotesState {
  notes: NoteProps[];
  zIndexMax: number;
  idMax: number;
  delta?: Delta;
  center: Point;
}

export function useNoteReducer() {
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
