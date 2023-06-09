import React from "react";
import { DispatchNotesContext, useNoteReducer } from "./note-reducer";
import { NoteCollectionComponent } from "./note-collection-component";
import { MouseButton, Point } from "./common";
import { HeaderToolbarComponent } from "./header-toolbar-component";

/**
 * CanvasComponent is a React component that represents a canvas for holding notes.
 * It provides functionalities for creating, modifying, and deleting notes, as well as
 * panning and zooming around the canvas.
 *
 * @returns {JSX.Element} A canvas component.
 */
export function CanvasComponent() {
  const { notes, dispatchNotes, select, setText } = useNoteReducer();
  const canvasDiv = React.useRef(
    null
  ) as React.MutableRefObject<HTMLDivElement | null>;

  React.useEffect(() => {
    function documentKeyListener(e: KeyboardEvent) {
      if (e.key === "Delete") {
        dispatchNotes({ type: "delete-active" });
      }
    }
    document.addEventListener("keydown", documentKeyListener);

    return () => {
      document.removeEventListener("keydown", documentKeyListener);
    };
  });

  return (
    <div className="app">
      <HeaderToolbarComponent dispatchNotes={dispatchNotes} notes={notes} />
      <div
        className="app-body"
        ref={canvasDiv}
        onClick={() => dispatchNotes({ type: "deselect" })}
        onWheel={(e) => {
          const clientRect = canvasDiv.current!.getBoundingClientRect();
          const mouseX = e.clientX - clientRect.left;
          const mouseY = e.clientY - clientRect.top;

          dispatchNotes({
            type: "zoom",
            direction: e.deltaY < 0 ? "in" : "out",
            mouseLocation: new Point(mouseX, mouseY),
          });
        }}
        onDoubleClick={(e) => {
          if (e.currentTarget !== e.target) return;
          dispatchNotes({
            type: "create",
            absoluteMousePoint: new Point(
              e.nativeEvent.offsetX,
              e.nativeEvent.offsetY
            ),
          });
        }}
        onMouseDown={(e) => {
          if (e.buttons !== MouseButton.Middle) return;

          dispatchNotes({
            type: "start-drag",
            itemUnderDrag: "pan",
            // Use clientX instead of nativeEvent.offsetX so that if you mouse over a child element,
            // the value won't suddenly shift (offsetX is relative to the child, clientX is global for all elements)
            point: new Point(e.clientX, e.clientY),
          });
        }}
        onMouseMove={(e) => {
          if (
            e.buttons === MouseButton.Middle ||
            e.buttons === MouseButton.Left
          ) {
            dispatchNotes({
              type: "update-drag",
              point: new Point(e.clientX, e.clientY),
            });
          }
        }}
        onMouseUp={() => {
          dispatchNotes({ type: "end-drag" });
        }}
      >
        <DispatchNotesContext.Provider
          value={{ dispatchNotes, select, setText }}
        >
          <NoteCollectionComponent center={notes.center} notes={notes} />
        </DispatchNotesContext.Provider>
        <div
          className="center"
          style={{
            transform: `translate(-50%, -50%) translate(${notes.center.x}px, ${notes.center.y}px) scale(${notes.zoom})`,
          }}
        >
          center
        </div>
      </div>
    </div>
  );
}
