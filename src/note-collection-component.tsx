import { Point } from "./common";
import { NoteComponent } from "./note-component";
import { AllNotesState } from "./note-reducer";

export interface NoteCollectionProps {
  center: Point;
  notes: AllNotesState;
}
export function NoteCollectionComponent({
  center,
  notes,
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
        />
      ))}
    </>
  );
}
