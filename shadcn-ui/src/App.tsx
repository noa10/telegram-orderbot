import "./App.css";

function App() {
  return (
    <>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <p>
          Hello
          <span style={{ fontWeight: "bold" }}> MGX!</span>
        </p>
        <p>Start prompting.</p>
      </div>
    </>
  );
}

export default App;
