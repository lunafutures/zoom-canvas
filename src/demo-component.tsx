export function DemoComponent() {
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
