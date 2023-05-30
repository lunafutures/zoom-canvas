export function DemoComponent() {
  function click(name: string, e: React.MouseEvent) {
    console.log(
      `${name}: target ${(e.target as HTMLElement).id} currentTarget ${
        e.currentTarget.id
      }`
    );
  }

  function key(name: string, e: React.KeyboardEvent) {
    console.log(name, e.key);
  }

  const styling: React.CSSProperties = {
    border: "1px solid white",
    padding: "10px",
  };
  return (
    <div style={{ background: "black", color: "white", height: "100vh" }}>
      <div className="demo-box" style={{ transform: "" }}>
        Original
      </div>
      <div className="demo-box" style={{ transform: "scale(.5)" }}>
        Scaled
      </div>
      <div
        className="demo-box"
        style={{ transform: "translate(200px, 200px) scale(.5)" }}
      >
        Translate, Scale
      </div>
      <div
        className="demo-box"
        style={{ transform: "translate(200px, 200px)" }}
      >
        Translate
      </div>
      <div
        className="demo-box"
        style={{ transform: "scale(.5) translate(200px, 200px)" }}
      >
        Scale, Translate
      </div>
    </div>
  );
}
