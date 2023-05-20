import React from "react";
import logo from "./logo.svg";
import "./App.css";

interface TodoProps {
  x: number;
  y: number;
}
function Todo({ x, y }: TodoProps) {
  return (
    <div className="TodoBox" style={{ top: x, left: y }}>
      Box
    </div>
  );
}

function App() {
  const [todos, setTodos] = React.useState<TodoProps[]>([{ x: 100, y: 100 }]);

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
        {todos.map((todo) => (
          <Todo x={todo.x} y={todo.y} />
        ))}
      </div>
      <div className="AppFooter">Footer</div>
    </div>
  );
}

export default App;
