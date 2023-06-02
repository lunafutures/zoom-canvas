import { Point } from "./common";
import { AllNotesState } from "./note-reducer";

export const initialNoteState: AllNotesState = {
  idMax: 43,
  zIndexMax: 60,
  delta: undefined,
  center: new Point(0, 0),
  zoom: 1.0,
  notes: [
    {
      id: 1,
      x: 219,
      y: 116,
      zIndex: 14,
      isActive: false,
      text: "double click anywhere to create a new note",
    },
    {
      id: 2,
      x: 245,
      y: 237,
      zIndex: 50,
      isActive: false,
      text: "click and drag on a note to move it",
    },
    {
      id: 3,
      x: 513,
      y: 114,
      zIndex: 38,
      isActive: false,
      text: "middle mouse click and drag to pan around",
    },
    {
      id: 4,
      x: 526,
      y: 247,
      zIndex: 48,
      isActive: false,
      text: "scroll (middle mouse wheel) to zoom in and out",
    },
    {
      id: 5,
      x: 847,
      y: 142,
      zIndex: 42,
      isActive: false,
      text: 'click "Download" above to save the current state into a file',
    },
    {
      id: 6,
      x: 861,
      y: 287,
      zIndex: 52,
      isActive: false,
      text: 'click "Upload" to upload back the saved state',
    },
    {
      id: 7,
      x: 607,
      y: 420,
      zIndex: 60,
      isActive: false,
      text: "have fun! 😀",
    },
    {
      id: 8,
      x: 394,
      y: 407,
      zIndex: 54,
      isActive: false,
      text: "All data is stored locally",
    },
  ],
};