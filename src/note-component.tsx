import TextField from "@mui/material/TextField";
import React from "react";
import { NoteReducerAction } from "./note-reducer";

export const DispatchNotesContext = React.createContext<
  (value: NoteReducerAction) => void
>(undefined as any);

export interface NoteProps {
  id: number;
  x: number;
  y: number;
  zIndex: number;
  isActive: boolean;
  text: string;
  select: (id: number) => void;
  setText: (id: number, text: string) => void;
}
export function NoteComponent({
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
