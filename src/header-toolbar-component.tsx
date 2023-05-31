import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import UploadIcon from "@mui/icons-material/Upload";
import HelpIcon from "@mui/icons-material/Help";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import GitHubIcon from "@mui/icons-material/GitHub";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import { NoteReducerAction } from "./note-reducer";
import { upload } from "./file-management";
import { Point } from "./common";

interface HeaderToolbarComponentProps {
  dispatchNotes: React.Dispatch<NoteReducerAction>;
  zoom: number;
}
export function HeaderToolbarComponent({
  dispatchNotes,
  zoom,
}: HeaderToolbarComponentProps) {
  const zoomPercent = (zoom * 100).toLocaleString(undefined, {
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
        <Button variant="contained" color="primary" startIcon={<SaveIcon />}>
          Save
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<UploadIcon />}
          onClick={() => upload()}
        >
          Load
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
          color="info"
          startIcon={<ZoomInIcon />}
          onClick={() => {
            dispatchNotes({ type: "reset-zoom" });
          }}
        >
          <span className="nonHoverText">Zoom {zoomPercent}%</span>
        </Button>
      </div>
      <div className="header-right">
        <input
          type="file"
          id="myFile"
          onChange={(e) => console.log("input file onChange", e)}
        />
      </div>
    </div>
  );
}
