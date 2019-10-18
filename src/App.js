import React from "react";
import { WebcamCapture } from "./Webcam";

function App() {
  return (
    <div>
      <div
        style={{
          fontSize: "64px",
          fontWeight: "700"
        }}
      >
        Gifaway
      </div>
      <div>
        <WebcamCapture />
      </div>
    </div>
  );
}

export default App;
