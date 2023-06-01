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
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

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
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = React.useState(false);
  return (
    <div className="header">
      <div className="header-left">
        <h2 className="title">zoom-canvas</h2>
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteForeverIcon />}
          onClick={() => setResetDialogOpen(true)}
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
        <Button
          variant="contained"
          color="info"
          startIcon={<HelpIcon />}
          onClick={() => setHelpDialogOpen(true)}
        >
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
      <Dialog
        className="dialog"
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
      >
        <DialogTitle>Reset</DialogTitle>
        <DialogContent className="dialog-content">
          <DialogContentText>
            Are you sure you want to delete all notes? This action cannot be
            reversed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setResetDialogOpen(false);
              dispatchNotes({ type: "clear" });
            }}
            autoFocus
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        className="dialog"
        open={helpDialogOpen}
        onClose={() => setHelpDialogOpen(false)}
      >
        <DialogTitle>Help Info</DialogTitle>
        <DialogContent className="dialog-content">
          <DialogContentText>
            Double click anywhere to create a new note.
          </DialogContentText>
          <DialogContentText>
            Left click and drag on a note to move it.
          </DialogContentText>
          <DialogContentText>
            Middle mouse click and drag to pan around the canvas.
          </DialogContentText>
          <DialogContentText>
            Middle mouse wheel to zoom in and out.
          </DialogContentText>
          <DialogContentText>
            All data is stored locally (in{" "}
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage"
              target="_blank"
              rel="noreferrer"
            >
              localstorage
            </a>
            ).
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHelpDialogOpen(false)}>OK</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
