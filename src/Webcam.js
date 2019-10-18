import React, { useRef, useCallback, useState, useMemo } from "react";
import Webcam from "react-webcam";
import gifshot from "gifshot";

import { useStateWithLocalStorage } from "./utils/localStorage";
import { useInterval } from "./utils/hooks";

// CONSTANTS & OPTIONS 🔮
const TOTAL_NR_IMAGES = 3;
const TOTAL_COUNTDOWN_SEC = 3;
const TIMER_INTERVAL_MS = 1000;
const WEBCAM_OPTIONS = {
  width: 500,
  height: 500,
  facingMode: "user"
};

const DetermineCaptureMode = count => {
  if (count <= TOTAL_COUNTDOWN_SEC) return "countdown";
  if (
    count > TOTAL_COUNTDOWN_SEC &&
    count <= TOTAL_COUNTDOWN_SEC + TOTAL_NR_IMAGES
  )
    return "capture";
  return "done";
};

const randomEmoji = i => ["🎩", "✨", "🔮", "🎉"][i];

const Capture = ({
  webcamRef,
  onNewImage,
  onFinished = () => {},
  onCountUpdate = () => {}
}) => {
  const [count, setCount] = useState(0);

  useInterval(() => {
    setCount(count + 1);
    // only get new image when countdown has past and number of images is not met yet
    if (DetermineCaptureMode(count) === "capture") {
      onNewImage(webcamRef.current.getScreenshot());
    }

    // notify anyone who is listening
    onCountUpdate(count);

    // check if we're done already
    if (count === TOTAL_COUNTDOWN_SEC + TOTAL_NR_IMAGES + 1) {
      onFinished(count);
    }
  }, TIMER_INTERVAL_MS);

  let content = `🍭`;
  switch (DetermineCaptureMode(count)) {
    case "countdown": {
      content = `🔥 COUNTDOWN! GET READY! ${TOTAL_COUNTDOWN_SEC - count} 🔥`;
      break;
    }
    case "capture": {
      const index = count - TOTAL_COUNTDOWN_SEC;
      content = `Taking Picture ${randomEmoji(
        index
      )} ${index} / ${TOTAL_NR_IMAGES}`;
      break;
    }
    case "done": {
      content = `Done 🙌`;
      break;
    }
    default: {
      content = `🍭`;
    }
  }

  return (
    <span
      style={{
        border: "5px dashed black",
        fontSize: "30px",
        fontWeight: "700",
        padding: "6px 12px"
      }}
    >
      {content}
    </span>
  );
};

const Gif = ({ imgArray = [] }) => {
  const [finalGif, setFinalGif] = useState();

  useMemo(() => {
    gifshot.createGIF(
      {
        images: imgArray,
        gifWidth: WEBCAM_OPTIONS.width,
        gifHeight: WEBCAM_OPTIONS.height,
        interval: 0.3
      },
      function(obj) {
        if (!obj.error) {
          var src = obj.image;
          setFinalGif(
            <img
              alt="img"
              width={WEBCAM_OPTIONS.width}
              height={WEBCAM_OPTIONS.height}
              src={src}
              style={{ border: "36px solid white" }}
            />
          );
        }
      }
    );
  }, [imgArray]);

  if (finalGif) return finalGif;
  return (
    <div>
      <span role="img">🍭</span>
    </div>
  );
};

export const WebcamCapture = () => {
  const webcamRef = useRef(null);
  const [store, setStore] = useStateWithLocalStorage("gifawayStore", []);
  const [captured, setCaptured] = useState([]);
  const [captureMode, setCaptureMode] = useState(false);

  const handleNewImage = useCallback(
    imgData => setCaptured([...captured, imgData]),
    [captured, setCaptured]
  );

  const handleFinished = useCallback(() => {
    setStore([...store, captured]);
    setCaptured([]);
    setCaptureMode(false);
  }, [captured, setStore, store]);

  return (
    <>
      <div style={{ padding: "36px" }}>
        {captureMode ? (
          <Capture
            webcamRef={webcamRef}
            onNewImage={handleNewImage}
            onFinished={handleFinished}
          />
        ) : (
          <button
            onClick={() => setCaptureMode(true)}
            style={{
              background: "none",
              color: "black",
              border: "5px dashed black",
              fontSize: "30px",
              fontWeight: "700",
              padding: "6px 12px"
            }}
          >
            Start! <span role="img">📸</span>
          </button>
        )}
      </div>
      <div style={{ padding: "36px" }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={WEBCAM_OPTIONS.width}
          height={WEBCAM_OPTIONS.height}
          videoConstraints={WEBCAM_OPTIONS}
        />
      </div>
      {store.reverse().map((imgArr, index) => (
        <Gif imgArray={imgArr} key={`gif_${index}`} />
      ))}
    </>
  );
};
