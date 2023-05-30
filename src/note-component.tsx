import TextField from "@mui/material/TextField";
import React from "react";
import { DispatchNotesContext, NoteState } from "./note-reducer";
import { Point } from "./common";

export interface NoteProps extends NoteState {
  zoom: number;
  centerX: number;
  centerY: number;
}
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
  const initialWidth = 200;
  const { dispatchNotes, select, setText } =
    React.useContext(DispatchNotesContext);

  return (
    <div
      className={`NoteBox ${isActive ? "active" : ""}`}
      style={{
        width: initialWidth,
        minHeight: initialWidth,
        transform: `translate(-50%, -50%) translate(${centerX}px, ${centerY}px) scale(${zoom}) translate(${x}px, ${y}px)`,
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
          point: new Point(e.clientX, e.clientY),
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
