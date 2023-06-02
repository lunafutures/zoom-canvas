import React from "react";
import _ from "lodash";
import { Point } from "./common";
import { initialNoteState } from "./first-time";

/** Select a note (and deselect all others).
 * @property {number} id - id of the note to be selected.
 */
interface SelectAction {
  type: "select";
  id: number;
}
/** Create a new note.
 * @property {Point} absoluteMousePoint - The real mouse coordinates where the note should be created,
 * e.g. the very top of the containing element should be (0, 0)
 */
interface CreateAction {
  type: "create";
  absoluteMousePoint: Point;
}

/** Delete all notes and reset to the original empty state.  */
interface ClearAction {
  type: "clear";
}

/** Deselect if a note is selected. */
interface DeselectAction {
  type: "deselect";
}

/** Update the internally stored text of a note to be used later when downloading the state.
 * This is intended to be called by NoteComponent itself.
 * @property {number} id - id of the note.
 * @property {string} text - The changed text for the note.
 */
interface UpdateTextAction {
  type: "update-text";
  id: number;
  text: string;
}

/** Delete the currently active note, if any. */
interface DeleteActiveAction {
  type: "delete-active";
}

/** Begin a drag movement. This can either apply to an individual note or to the canvas itself ("panning")
 * @property {number | "pan"} itemUnderDrag - The ID of the note or "pan" for panning the canvas.
 * @property {Point} point - The starting point of the drag action.
 */
interface StartDragAction {
  type: "start-drag";
  itemUnderDrag: number | "pan";
  point: Point;
}

/** Continue a drag movement when the mouse is moved. This must be called after {@link StartDragAction}.
 * @property {string} type - The type of the action, which is "update-drag".
 * @property {Point} point - The updated position during the dragging action.
 */
interface UpdateDragAction {
  type: "update-drag";
  point: Point;
}

/** Ends a drag movement and commits the result of the drag.  */
interface EndDragAction {
  type: "end-drag";
}

/** Zoom the canvas in or out.
 * @property {"in" | "out"} direction - The direction of the zoom action, either
 * @property {Point} mouseLocation - The mouse location during the zoom action.
 * This allows the zoom to be centered around the position of the mouse, rather
 * than the center of the canvas.
 */
interface ZoomAction {
  type: "zoom";
  direction: "in" | "out";
  mouseLocation: Point;
}

/** Resets the zoom to 100%. */
interface ResetZoomAction {
  type: "reset-zoom";
}

/** Replace the existing state with a new state, used primarily for when the user
 * uploads a previously-downloaded JSON file describing a state.
 * @property {AllNotesState} newState - The new state to replace the existing state with.
 */
interface ReplaceStateAction {
  type: "replace-state";
  newState: AllNotesState;
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
  | ZoomAction
  | ResetZoomAction
  | ReplaceStateAction;

/** Delta object that stores the information about a drag action. */
interface Delta {
  /** The starting coordinate of the drag action. */
  startDrag: Point;
  /** The ending coordinate of the drag action. */
  endDrag: Point;
  /** The `itemUnderDrag`'s previous position before the drag action. */
  previousPosition: Point;
  /** The `itemUnderDrag`'s new position after the drag action. */
  newPosition: Point;
  /** The ID of the item being dragged, or "pan" for panning the canvas. */
  itemUnderDrag: number | "pan";
}

/** Root state object containing info on notes and the canvas position. */
export interface AllNotesState {
  /** All notes contained with. */
  notes: NoteState[];
  /** The highest zIndex of any of the notes (if any notes exist). */
  zIndexMax: number;
  /** The highest id of any of the notes (if any notes exist). */
  idMax: number;
  /** Object representing the current drag action, or `undefined` if not
   * currently under drag. */
  delta?: Delta;
  /** The current, user-movable center of the canvas to allow the canvas to be panned.
   * Invisible to the user. */
  center: Point;
  /** The current zoom level of the canvas. */
  zoom: number;
}

/** Delta object that stores the information about a drag action.  */
export interface NoteState {
  /** A unique and immutable number that identifies this note. */
  id: number;
  /** The x-position of the note, relative to `AllNotesState`.`center`. */
  x: number;
  /** The y-position of the note, relative to `AllNotesState`.`center`. */
  y: number;
  /** The zIndex. Notes with higher zIndex appear on top. */
  zIndex: number;
  /** Indicates if the note is currently selected. */
  isActive: boolean;
  /** The current text of the note. */
  text: string;
}

/** Function that manipulates the current {@ref AllNotesState} through {@ref NoteReducerAction}. */
export function useNoteReducer() {
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
    return zoomTo(newZoom, previous, mouseLocation);
  }

  function zoomTo(
    newZoom: number,
    previous: AllNotesState,
    mouseLocation: Point
  ): AllNotesState {
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
      case "reset-zoom":
        return {
          ...previous,
          zoom: 1,
          center: new Point(0, 0),
        };
      case "replace-state":
        return action.newState;
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
