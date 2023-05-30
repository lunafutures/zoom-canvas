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
      <div
        id="one"
        onClick={(e) => click("1", e)}
        onKeyDown={(e) => key("1", e)}
        style={styling}
      >
        1
        <div
          id="two"
          onClick={(e) => click("2", e)}
          onKeyDown={(e) => key("2", e)}
          style={styling}
        >
          2
          <textarea
            id="three"
            onClick={(e) => click("3", e)}
            onKeyDown={(e) => {
              key("3", e);
              if (e.key === "Delete") {
                e.stopPropagation();
              }
            }}
            style={styling}
          >
            3
          </textarea>
        </div>
      </div>
    </div>
  );
}
