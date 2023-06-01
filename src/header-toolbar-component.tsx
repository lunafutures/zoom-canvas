import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import UploadIcon from "@mui/icons-material/Upload";
import HelpIcon from "@mui/icons-material/Help";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import GitHubIcon from "@mui/icons-material/GitHub";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import { AllNotesState, NoteReducerAction } from "./note-reducer";
import React from "react";
import { Point } from "./common";

function download(filename: string, text: string): void {
  var element: HTMLAnchorElement | undefined = undefined;
  try {
    element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();
  } finally {
    if (element) {
      document.body.removeChild(element);
    }
  }
}

interface HeaderToolbarComponentProps {
  dispatchNotes: React.Dispatch<NoteReducerAction>;
  notes: AllNotesState;
}
export function HeaderToolbarComponent({
  dispatchNotes,
  notes,
}: HeaderToolbarComponentProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null as any);
  const zoomPercent = (notes.zoom * 100).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });
  return (
    <div className="header">
      <div className="header-left">
        <h2 className="title">zoom-canvas</h2>
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteForeverIcon />}
          onClick={() => dispatchNotes({ type: "clear" })}
        >
          Reset
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={<SaveIcon />}
          onClick={() =>
            download("zoom-canvas.json", JSON.stringify(notes, null, 2))
          }
        >
          Download
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<UploadIcon />}
          onClick={() => fileInputRef.current.click()}
        >
          Upload
        </Button>
        <Button variant="contained" color="info" startIcon={<HelpIcon />}>
          Help
        </Button>
        <Button variant="contained" color="info" startIcon={<GitHubIcon />}>
          View Source
        </Button>
        <Button
          className="zoom-button"
          variant="contained"
          color="primary"
          startIcon={<ZoomInIcon />}
          onClick={() => {
            dispatchNotes({ type: "reset-zoom" });
          }}
        >
          <span className="nonHoverText">Zoom {zoomPercent}%</span>
        </Button>
      </div>
      <input
        id="hidden-file-input"
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={(e) => {
          const files = e.target.files;
          if (!files || files.length !== 1) {
            console.error("Missing or too many files for upload:", files);
            return;
          }

          const file = files[0];
          console.log("file:", file);
          const reader = new FileReader();
          reader.readAsText(file);
          reader.onload = () => {
            const readText = reader.result;
            const readObj = JSON.parse(readText as string);
            const missingKeys = [
              "notes",
              "zIndexMax",
              "idMax",
              "center",
              "zoom",
            ].filter((key) => !(key in readObj));
            if (missingKeys.length > 0) {
              console.error(
                "Some keys not found in uploaded JSON file:",
                missingKeys
              );
              return;
            }

            const newState = {
              ...readObj,
              center: new Point(readObj.center.x, readObj.center.y),
            } as AllNotesState;
            dispatchNotes({ type: "replace-state", newState });
          };
        }}
      />
    </div>
  );
}
