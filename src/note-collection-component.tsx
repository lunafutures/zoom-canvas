import { Point } from "./common";
import { NoteComponent } from "./note-component";
import { AllNotesState } from "./note-reducer";

export interface NoteCollectionProps {
  center: Point;
  notes: AllNotesState;
  select: (id: number) => void;
  setText: (id: number, text: string) => void;
}
export function NoteCollectionComponent({
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
