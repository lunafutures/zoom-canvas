import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.scss";

import { CanvasComponent } from "./canvas-component";
import { DemoComponent } from "./demo-component";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/demo" element={<DemoComponent />} />
        <Route path="/" element={<CanvasComponent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
