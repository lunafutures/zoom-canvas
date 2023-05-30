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
          x={note.x}
          y={note.y}
          zIndex={note.zIndex}
          key={note.id}
          id={note.id}
          isActive={note.isActive}
          text={note.text}
          zoom={notes.zoom}
          centerX={center.x}
          centerY={center.y}
        />
      ))}
    </>
  );
}
