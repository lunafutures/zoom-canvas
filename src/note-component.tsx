import { DispatchNotesContext, NoteState } from "./note-reducer";
import { MouseButton, Point } from "./common";

import React from "react";

import TextField from "@mui/material/TextField";
import { IconButton } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteIcon from "@mui/icons-material/Delete";

export interface NoteProps extends NoteState {
  /** Global zoom of the canvas. */
  zoom: number;
  /** x-position relative to `AllNotesState.`center` */
  centerX: number;
  /** y-position relative to `AllNotesState.`center` */
  centerY: number;
}
/**
 * @returns {JSX.Element} Component defining an individual note.
 */
export function NoteComponent({
  id,
  x,
  y,
  zIndex,
  isActive,
  text,
  zoom,
  centerX,
  centerY,
}: NoteProps) {
  const { dispatchNotes, select, setText } =
    React.useContext(DispatchNotesContext);
  const textFieldHasFocus = React.useRef(false);

  return (
    <div
      className={`note-box ${isActive ? "active" : ""}`}
      style={{
        transform: `translate(-50%, -50%) translate(${centerX}px, ${centerY}px) scale(${zoom}) translate(${x}px, ${y}px)`,
        zIndex,
      }}
      onClick={(e) => {
        select(id);
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        if (e.buttons !== MouseButton.Left) return;
        select(id);
        dispatchNotes({
          type: "start-drag",
          itemUnderDrag: id,
          point: new Point(e.clientX, e.clientY),
        });
      }}
    >
      <TextField
        className="note-text"
        autoFocus
        multiline
        placeholder="Enter description"
        spellCheck={isActive}
        defaultValue={text}
        onKeyDown={(e) => {
          // Prevents the delete key from deleting the note while editing text
          e.stopPropagation();
        }}
        onMouseMove={(e) => {
          if (e.buttons === MouseButton.Middle) {
            return;
          }

          // Allows selecting text without moving the note,
          // but also allows moving the note upward without stuttering.
          if (textFieldHasFocus.current) {
            e.stopPropagation();
          }
        }}
        onFocus={() => {
          textFieldHasFocus.current = true;
        }}
        onBlur={() => {
          textFieldHasFocus.current = false;
        }}
        onInput={(e) => {
          const newText = (e.target as HTMLTextAreaElement).value;
          setText(id, newText);
        }}
      />
      <div className="note-bar">
        <DragIndicatorIcon />
        <IconButton
          aria-label="delete"
          onClick={(e) => dispatchNotes({ type: "delete-active" })}
        >
          <DeleteIcon />
        </IconButton>
      </div>
    </div>
  );
}
