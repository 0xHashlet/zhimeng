import { useEffect, useMemo, useRef, useState } from "react";
import { PanResponder, type GestureResponderEvent, type ViewStyle } from "react-native";
import Svg, { Polyline } from "react-native-svg";

type Point = {
  x: number;
  y: number;
};

type DraftLayerProps = {
  active: boolean;
  clearSignal: number;
  onClearHandled: () => void;
  undoSignal: number;
  onUndoHandled: () => void;
};

export function DraftLayer({
  active,
  clearSignal,
  onClearHandled,
  undoSignal,
  onUndoHandled
}: DraftLayerProps) {
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const currentStroke = useRef<Point[]>([]);
  const handledClearSignal = useRef(clearSignal);
  const handledUndoSignal = useRef(undoSignal);

  useEffect(() => {
    if (handledClearSignal.current === clearSignal) {
      return;
    }

    handledClearSignal.current = clearSignal;
    setStrokes([]);
    onClearHandled();
  }, [clearSignal, onClearHandled]);

  useEffect(() => {
    if (handledUndoSignal.current === undoSignal) {
      return;
    }

    handledUndoSignal.current = undoSignal;
    setStrokes((current) => current.slice(0, -1));
    onUndoHandled();
  }, [onUndoHandled, undoSignal]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => active,
        onMoveShouldSetPanResponder: () => active,
        onPanResponderGrant: (event) => {
          currentStroke.current = [readPoint(event)];
          setStrokes((current) => [...current, currentStroke.current]);
        },
        onPanResponderMove: (event) => {
          const nextStroke = [...currentStroke.current, readPoint(event)];
          currentStroke.current = nextStroke;
          setStrokes((current) => [...current.slice(0, -1), nextStroke]);
        },
        onPanResponderRelease: () => {
          currentStroke.current = [];
        },
        onPanResponderTerminate: () => {
          currentStroke.current = [];
        }
      }),
    [active]
  );

  const containerStyle: ViewStyle = {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: active ? 20 : 1
  };

  return (
    <Svg
      pointerEvents={active ? "auto" : "none"}
      style={containerStyle}
      {...panResponder.panHandlers}
    >
      {strokes.map((stroke, index) => (
        <Polyline
          key={`${index}-${stroke.length}`}
          fill="none"
          points={stroke.map((point) => `${point.x},${point.y}`).join(" ")}
          stroke="#1F2937"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity={0.86}
          strokeWidth={4}
        />
      ))}
    </Svg>
  );
}

function readPoint(event: GestureResponderEvent): Point {
  return {
    x: event.nativeEvent.locationX,
    y: event.nativeEvent.locationY
  };
}
