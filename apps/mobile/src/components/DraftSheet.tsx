import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Modal,
  PanResponder,
  Pressable,
  Text,
  View,
  type GestureResponderEvent
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { RotateCcw, Trash2, X } from "lucide-react-native";
import { colors } from "../theme/colors";
import type { DraftPoint, DraftStroke } from "../types/draft";

type DraftSheetProps = {
  visible: boolean;
  strokes: DraftStroke[];
  onTwoFingerScroll?: (deltaY: number) => void;
  onChange: (strokes: DraftStroke[]) => void;
  onClose: () => void;
};

type TouchPoint = {
  pageY: number;
};

const MIN_POINT_DISTANCE = 3;
const MIN_SCROLL_DELTA = 2;
const TOOLBAR_HEIGHT = 56;

export function DraftSheet({
  onChange,
  onClose,
  onTwoFingerScroll,
  strokes,
  visible
}: DraftSheetProps) {
  const [currentStroke, setCurrentStroke] = useState<DraftStroke | null>(null);
  const currentStrokeRef = useRef<DraftStroke | null>(null);
  const gestureModeRef = useRef<"draw" | "scroll" | null>(null);
  const lastTouchMoveYRef = useRef<number | null>(null);
  const pendingScrollDeltaRef = useRef(0);
  const scrollFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!visible) {
      setCurrentStroke(null);
      currentStrokeRef.current = null;
      lastTouchMoveYRef.current = null;
      pendingScrollDeltaRef.current = 0;

      if (scrollFrameRef.current !== null) {
        cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }
    }
  }, [visible]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          if (event.nativeEvent.touches.length >= 2) {
            gestureModeRef.current = "scroll";
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
        onPanResponderMove: (event, gestureState) => {
          if (gestureState.numberActiveTouches >= 2) {
            currentStrokeRef.current = null;
            setCurrentStroke(null);
            gestureModeRef.current = "scroll";
            return;
          }

          if (gestureModeRef.current !== "draw") {
            return;
          }

          const stroke = currentStrokeRef.current;

          if (!stroke) {
            return;
          }

          const nextPoint = readPoint(event);
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
        onPanResponderRelease: () => {
          commitCurrentStroke();
        },
        onPanResponderTerminate: () => {
          commitCurrentStroke();
        }
      }),
    [strokes]
  );

  function handleRawTouchMove(event: GestureResponderEvent) {
    const touches = event.nativeEvent.touches;

    if (touches.length < 2) {
      lastTouchMoveYRef.current = null;
      return;
    }

    currentStrokeRef.current = null;
    setCurrentStroke(null);
    gestureModeRef.current = "scroll";

    const centerY = getTouchCenterY(touches);
    const lastCenterY = lastTouchMoveYRef.current;
    lastTouchMoveYRef.current = centerY;

    if (lastCenterY === null) {
      return;
    }

    const deltaY = lastCenterY - centerY;

    if (Math.abs(deltaY) < MIN_SCROLL_DELTA) {
      return;
    }

    scheduleTwoFingerScroll(deltaY);
  }

  function scheduleTwoFingerScroll(deltaY: number) {
    pendingScrollDeltaRef.current += deltaY;

    if (scrollFrameRef.current !== null) {
      return;
    }

    scrollFrameRef.current = requestAnimationFrame(() => {
      const nextDeltaY = pendingScrollDeltaRef.current;
      pendingScrollDeltaRef.current = 0;
      scrollFrameRef.current = null;

      if (Math.abs(nextDeltaY) < MIN_SCROLL_DELTA) {
        return;
      }

      onTwoFingerScroll?.(nextDeltaY);
    });
  }

  function commitCurrentStroke() {
    const stroke = currentStrokeRef.current;

    if (stroke && stroke.points.length > 1) {
      onChange([...strokes, stroke]);
    }

    currentStrokeRef.current = null;
    gestureModeRef.current = null;
    lastTouchMoveYRef.current = null;
    pendingScrollDeltaRef.current = 0;
    setCurrentStroke(null);
  }

  function undoStroke() {
    onChange(strokes.slice(0, -1));
  }

  function clearStrokes() {
    onChange([]);
  }

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-glacier-card/40">
        <View
          className="absolute bottom-0 left-0 right-0"
          style={{ top: TOOLBAR_HEIGHT }}
          onTouchMove={handleRawTouchMove}
          {...panResponder.panHandlers}
        >
          <Svg height="100%" width="100%">
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

        <View
          className="absolute left-0 right-0 border-b border-glacier-border bg-glacier-background px-5"
          style={{
            height: TOOLBAR_HEIGHT
          }}
        >
          <View className="h-14 flex-row items-center justify-between">
            <Text className="text-base font-extrabold text-glacier-textPrimary">
              草稿纸
            </Text>
            <View className="flex-row items-center gap-2">
              <ToolButton
                label="撤销"
                disabled={strokes.length === 0}
                onPress={undoStroke}
                icon={<RotateCcw color={colors.primary} size={18} />}
              />
              <ToolButton
                label="清空"
                disabled={strokes.length === 0}
                onPress={clearStrokes}
                icon={<Trash2 color={colors.error} size={18} />}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="关闭草稿纸"
                className="h-9 w-9 items-center justify-center rounded-full bg-glacier-cardSoft"
                onPress={onClose}
              >
                <X color={colors.textSecondary} size={20} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ToolButton({
  disabled,
  icon,
  label,
  onPress
}: {
  disabled: boolean;
  icon: ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      className={[
        "h-9 w-9 items-center justify-center rounded-full",
        disabled ? "bg-glacier-cardSoft opacity-50" : "bg-glacier-cardSoft"
      ].join(" ")}
      onPress={onPress}
    >
      {icon}
    </Pressable>
  );
}

function readPoint(event: GestureResponderEvent): DraftPoint {
  return {
    x: event.nativeEvent.locationX,
    y: event.nativeEvent.locationY
  };
}

function getTouchCenterY(touches: TouchPoint[]) {
  const [firstTouch, secondTouch] = touches;
  return (firstTouch.pageY + secondTouch.pageY) / 2;
}

function getDistance(start: DraftPoint, end: DraftPoint) {
  return Math.hypot(end.x - start.x, end.y - start.y);
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
