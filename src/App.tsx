import { Routes, Route, HashRouter } from "react-router-dom";
import "./App.scss";

import { CanvasComponent } from "./canvas-component";
import { DemoComponent } from "./demo-component";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/demo" element={<DemoComponent />} />
        <Route path="/" element={<CanvasComponent />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
