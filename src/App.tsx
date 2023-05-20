import React from "react";
import logo from "./logo.svg";
import "./App.css";

function App() {
  return (
    <div className="App">
      <div className="AppHeader">Header</div>
      <div
        className="AppBody"
        onMouseMove={(e) => {
          const q = {
            pageX: e.pageX,
            pageY: e.pageY,
            screenX: e.screenX,
            screenY: e.screenY,
            clientX: e.clientX,
            clientY: e.clientY,
            offsetX: e.nativeEvent.offsetX,
            offsetY: e.nativeEvent.offsetY,
          };
          console.log(q);
        }}
        style={{ background: "lightblue", height: "auto" }}
      >
        Body
      </div>
      <div className="AppFooter">Footer</div>
    </div>
  );
}

export default App;
