import { useEffect, useMemo, useRef, type Dispatch, type SetStateAction } from "react";
import { PanResponder, type GestureResponderEvent, type ViewStyle } from "react-native";
import Svg, { Polyline } from "react-native-svg";

export type DraftPoint = {
  x: number;
  y: number;
};

type DraftLayerProps = {
  active: boolean;
  clearSignal: number;
  onClearHandled: () => void;
  undoSignal: number;
  onUndoHandled: () => void;
  strokes: DraftPoint[][];
  onStrokesChange: Dispatch<SetStateAction<DraftPoint[][]>>;
};

export function DraftLayer({
  active,
  clearSignal,
  onClearHandled,
  undoSignal,
  onUndoHandled,
  strokes,
  onStrokesChange
}: DraftLayerProps) {
  const currentStroke = useRef<DraftPoint[]>([]);
  const handledClearSignal = useRef(clearSignal);
  const handledUndoSignal = useRef(undoSignal);

  useEffect(() => {
    if (handledClearSignal.current === clearSignal) {
      return;
    }

    handledClearSignal.current = clearSignal;
    onStrokesChange([]);
    onClearHandled();
  }, [clearSignal, onClearHandled, onStrokesChange]);

  useEffect(() => {
    if (handledUndoSignal.current === undoSignal) {
      return;
    }

    handledUndoSignal.current = undoSignal;
    onStrokesChange((current) => current.slice(0, -1));
    onUndoHandled();
  }, [onStrokesChange, onUndoHandled, undoSignal]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => active,
        onMoveShouldSetPanResponder: () => active,
        onPanResponderGrant: (event) => {
          currentStroke.current = [readPoint(event)];
          onStrokesChange((current) => [...current, currentStroke.current]);
        },
        onPanResponderMove: (event) => {
          const nextStroke = [...currentStroke.current, readPoint(event)];
          currentStroke.current = nextStroke;
          onStrokesChange((current) => [...current.slice(0, -1), nextStroke]);
        },
        onPanResponderRelease: () => {
          currentStroke.current = [];
        },
        onPanResponderTerminate: () => {
          currentStroke.current = [];
        }
      }),
    [active, onStrokesChange]
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

function readPoint(event: GestureResponderEvent): DraftPoint {
  return {
    x: event.nativeEvent.locationX,
    y: event.nativeEvent.locationY
  };
}
