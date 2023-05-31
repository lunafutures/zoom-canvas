import Button from "@mui/material/Button";
import SaveIcon from "@mui/icons-material/Save";
import UploadIcon from "@mui/icons-material/Upload";
import HelpIcon from "@mui/icons-material/Help";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import GitHubIcon from "@mui/icons-material/GitHub";
import { NoteReducerAction } from "./note-reducer";

interface HeaderToolbarComponentProps {
  dispatchNotes: React.Dispatch<NoteReducerAction>;
}
export function HeaderToolbarComponent({
  dispatchNotes,
}: HeaderToolbarComponentProps) {
  return (
    <div className="app-header">
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
      <Button variant="contained" color="primary" startIcon={<UploadIcon />}>
        Load
      </Button>
      <Button variant="contained" color="info" startIcon={<HelpIcon />}>
        Help
      </Button>
      <Button variant="contained" color="info" startIcon={<GitHubIcon />}>
        View Source
      </Button>
    </div>
  );
}
