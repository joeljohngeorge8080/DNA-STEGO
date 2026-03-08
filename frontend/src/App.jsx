import Prism from "./components/Prism";

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>

      {/* Prism Background */}
      <Prism
        animationType="rotate"
        timeScale={0.5}
        height={3.5}
        baseWidth={5.5}
        scale={3.6}
        hueShift={0}
        colorFrequency={1}
        noise={0}
        glow={1}
      />

      {/* UI */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          color: "white",
          padding: "40px"
        }}
      >
        <h1>DNA Stego</h1>
        <p>Secure DNA-based Data Encryption</p>

        <button>Encrypt</button>
        <button>Decrypt</button>
      </div>

    </div>
  );
}

export default App;