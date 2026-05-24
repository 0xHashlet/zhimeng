import { useMemo, useRef, useState } from "react";
import {
  PanResponder,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors } from "../theme/colors";
import type { DraftPoint, DraftStroke } from "../types/draft";

type DraftCanvasProps = {
  enabled: boolean;
  onTwoFingerScroll?: (deltaY: number) => void;
  strokes: DraftStroke[];
  onChange: (strokes: DraftStroke[]) => void;
};

type TouchPoint = {
  identifier?: string | number;
  pageY: number;
};

const MIN_POINT_DISTANCE = 3;
const MIN_SCROLL_DELTA = 2;
const SCROLL_RESPONSE_RATIO = 1.25;

export function DraftCanvas({
  enabled,
  onChange,
  onTwoFingerScroll,
  strokes
}: DraftCanvasProps) {
  const [canvasSize, setCanvasSize] = useState({ height: 1, width: 1 });
  const [currentStroke, setCurrentStroke] = useState<DraftStroke | null>(null);
  const currentStrokeRef = useRef<DraftStroke | null>(null);
  const gestureModeRef = useRef<"draw" | "scroll" | null>(null);
  const lastTwoFingerTouchesRef = useRef<TouchPoint[] | null>(null);
  const pendingFingerDeltasRef = useRef<[number, number]>([0, 0]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => enabled,
        onMoveShouldSetPanResponder: () => enabled,
        onPanResponderGrant: (event) => {
          if (!enabled) {
            return;
          }

          if (event.nativeEvent.touches.length >= 2) {
            enterScrollMode();
            return;
          }

          gestureModeRef.current = "draw";
          const point = readPoint(event);
          const nextStroke = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            points: [point]
          };

          currentStrokeRef.current = nextStroke;
          setCurrentStroke(nextStroke);
        },
        onPanResponderMove: (event) => {
          if (!enabled) {
            return;
          }

          if (event.nativeEvent.touches.length >= 2) {
            handleTwoFingerMove(event.nativeEvent.touches);
            return;
          }

          if (gestureModeRef.current === "scroll") {
            return;
          }

          const stroke = currentStrokeRef.current;

          if (!stroke) {
            return;
          }

          const nextPoint = readPoint(event);

          if (!isPointInCanvas(nextPoint, canvasSize)) {
            commitCurrentStroke();
            return;
          }

          const lastPoint = stroke.points[stroke.points.length - 1];

          if (getDistance(lastPoint, nextPoint) < MIN_POINT_DISTANCE) {
            return;
          }

          const nextStroke = {
            ...stroke,
            points: [...stroke.points, nextPoint]
          };

          currentStrokeRef.current = nextStroke;
          setCurrentStroke(nextStroke);
        },
        onPanResponderRelease: (event) => {
          if (
            gestureModeRef.current === "scroll" &&
            event.nativeEvent.touches.length > 0
          ) {
            return;
          }

          commitCurrentStroke();
        },
        onPanResponderTerminate: () => {
          resetGesture();
        }
      }),
    [canvasSize, enabled, onTwoFingerScroll, strokes]
  );

  function handleLayout(event: LayoutChangeEvent) {
    const { height, width } = event.nativeEvent.layout;
    setCanvasSize({
      height: Math.max(1, height),
      width: Math.max(1, width)
    });
  }

  function commitCurrentStroke() {
    if (gestureModeRef.current === "scroll") {
      resetGesture();
      return;
    }

    const stroke = currentStrokeRef.current;

    if (stroke && stroke.points.length > 1) {
      onChange([...strokes, stroke]);
    }

    currentStrokeRef.current = null;
    gestureModeRef.current = null;
    lastTwoFingerTouchesRef.current = null;
    pendingFingerDeltasRef.current = [0, 0];
    setCurrentStroke(null);
  }

  function enterScrollMode() {
    currentStrokeRef.current = null;
    setCurrentStroke(null);
    gestureModeRef.current = "scroll";
  }

  function resetGesture() {
    currentStrokeRef.current = null;
    gestureModeRef.current = null;
    lastTwoFingerTouchesRef.current = null;
    pendingFingerDeltasRef.current = [0, 0];
    setCurrentStroke(null);
  }

  function handleTwoFingerMove(touches: TouchPoint[]) {
    enterScrollMode();

    const currentTouches = touches.slice(0, 2);
    const lastTouches = lastTwoFingerTouchesRef.current;
    lastTwoFingerTouchesRef.current = currentTouches;

    if (!lastTouches) {
      return;
    }

    const firstDeltaY = getFingerDeltaY(currentTouches[0], lastTouches, 0);
    const secondDeltaY = getFingerDeltaY(currentTouches[1], lastTouches, 1);

    if (firstDeltaY === null || secondDeltaY === null) {
      return;
    }

    pendingFingerDeltasRef.current = [
      pendingFingerDeltasRef.current[0] + firstDeltaY,
      pendingFingerDeltasRef.current[1] + secondDeltaY
    ];

    const [firstPendingDeltaY, secondPendingDeltaY] = pendingFingerDeltasRef.current;

    if (
      Math.abs(firstPendingDeltaY) < MIN_SCROLL_DELTA ||
      Math.abs(secondPendingDeltaY) < MIN_SCROLL_DELTA
    ) {
      return;
    }

    if (Math.sign(firstPendingDeltaY) !== Math.sign(secondPendingDeltaY)) {
      pendingFingerDeltasRef.current = [0, 0];
      return;
    }

    const deltaY =
      ((firstPendingDeltaY + secondPendingDeltaY) / 2) * SCROLL_RESPONSE_RATIO;
    pendingFingerDeltasRef.current = [0, 0];
    onTwoFingerScroll?.(deltaY);
  }

  return (
    <View
      className="absolute inset-0"
      pointerEvents={enabled ? "auto" : "none"}
      onLayout={handleLayout}
      {...panResponder.panHandlers}
    >
      <Svg height={canvasSize.height} width={canvasSize.width}>
        {[...strokes, ...(currentStroke ? [currentStroke] : [])].map((stroke) => (
          <Path
            key={stroke.id}
            d={toPath(stroke.points)}
            fill="none"
            stroke={colors.textPrimary}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity={0.88}
            strokeWidth={3}
          />
        ))}
      </Svg>
    </View>
  );
}

function readPoint(event: GestureResponderEvent): DraftPoint {
  return {
    x: event.nativeEvent.locationX,
    y: event.nativeEvent.locationY
  };
}

function getDistance(start: DraftPoint, end: DraftPoint) {
  return Math.hypot(end.x - start.x, end.y - start.y);
}

function isPointInCanvas(
  point: DraftPoint,
  canvasSize: {
    height: number;
    width: number;
  }
) {
  return (
    point.x >= 0 &&
    point.y >= 0 &&
    point.x <= canvasSize.width &&
    point.y <= canvasSize.height
  );
}

function getFingerDeltaY(
  currentTouch: TouchPoint,
  lastTouches: TouchPoint[],
  fallbackIndex: number
) {
  const lastTouch =
    currentTouch.identifier !== undefined
      ? lastTouches.find((touch) => touch.identifier === currentTouch.identifier)
      : undefined;
  const matchedTouch = lastTouch ?? lastTouches[fallbackIndex];

  return matchedTouch ? matchedTouch.pageY - currentTouch.pageY : null;
}

function toPath(points: DraftPoint[]) {
  if (points.length === 0) {
    return "";
  }

  const [firstPoint, ...restPoints] = points;
  return restPoints.reduce(
    (path, point) => `${path} L ${point.x} ${point.y}`,
    `M ${firstPoint.x} ${firstPoint.y}`
  );
}
