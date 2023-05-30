import React from "react";
import { useNoteReducer } from "./note-reducer";
import { DispatchNotesContext } from "./note-component";
import { NoteCollectionComponent } from "./note-collection-component";

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
    <div className="App">
      <div className="AppHeader">
        <button onClick={() => dispatchNotes({ type: "clear" })}>
          Clear All
        </button>
      </div>
      <div
        className="AppBody"
        ref={canvasDiv}
        onClick={() => dispatchNotes({ type: "deselect" })}
        onWheel={(e) => {
          const clientRect = canvasDiv.current!.getBoundingClientRect();
          const fractionX = (e.clientX - clientRect.left) / clientRect.width;
          const fractionY = (e.clientY - clientRect.top) / clientRect.height;
          console.log(
            // `deltaY ${e.deltaY}, client ${e.clientX}, ${e.clientY}, page ${e.pageX} ${e.pageY}, screen ${e.screenX} ${e.screenY} offset ${e.nativeEvent.offsetX} ${e.nativeEvent.offsetY}`
            `deltaY ${e.deltaY}, client ${e.clientX}, ${e.clientY}, fraction x: ${fractionX} y: ${fractionY}`
          );
        }}
        onDoubleClick={(e) => {
          if (e.currentTarget !== e.target) return;
          dispatchNotes({
            type: "create",
            x: e.nativeEvent.offsetX + notes.center.x,
            y: e.nativeEvent.offsetY + notes.center.y,
          });
        }}
        onMouseDown={(e) => {
          if (e.buttons !== 4) return;

          dispatchNotes({
            type: "start-drag",
            itemUnderDrag: "pan",
            point: {
              // Use clientX instead of nativeEvent.offsetX so that if you mouse over a child element,
              // the value won't suddenly shift (offsetX is relative to the child, clientX is global for all elements)
              x: e.clientX,
              y: e.clientY,
            },
          });
        }}
        onMouseMove={(e) => {
          if (e.buttons === 4 || e.buttons === 1) {
            dispatchNotes({
              type: "update-drag",
              point: {
                x: e.clientX,
                y: e.clientY,
              },
            });
          }
        }}
        onMouseUp={() => {
          dispatchNotes({ type: "end-drag" });
        }}
      >
        <DispatchNotesContext.Provider value={dispatchNotes}>
          <NoteCollectionComponent
            center={notes.center}
            notes={notes}
            select={select}
            setText={setText}
          />
        </DispatchNotesContext.Provider>
        <div
          className="center"
          style={{ left: -notes.center.x, top: -notes.center.y }}
        >
          center
        </div>
      </div>
      <div className="AppFooter">Footer</div>
    </div>
  );
}
