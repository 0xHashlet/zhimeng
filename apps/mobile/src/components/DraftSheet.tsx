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
import Svg, { Line, Path } from "react-native-svg";
import { RotateCcw, Trash2, X } from "lucide-react-native";
import { colors } from "../theme/colors";
import type { DraftPoint, DraftStroke } from "../types/draft";

type DraftSheetProps = {
  visible: boolean;
  strokes: DraftStroke[];
  onChange: (strokes: DraftStroke[]) => void;
  onClose: () => void;
};

const GRID_SIZE = 24;
const MIN_POINT_DISTANCE = 3;

export function DraftSheet({ onChange, onClose, strokes, visible }: DraftSheetProps) {
  const [currentStroke, setCurrentStroke] = useState<DraftStroke | null>(null);
  const [canvasSize, setCanvasSize] = useState({ height: 0, width: 0 });
  const currentStrokeRef = useRef<DraftStroke | null>(null);

  useEffect(() => {
    if (!visible) {
      setCurrentStroke(null);
      currentStrokeRef.current = null;
    }
  }, [visible]);

  const gridLines = useMemo(() => {
    const lines = [];

    for (let x = GRID_SIZE; x < canvasSize.width; x += GRID_SIZE) {
      lines.push({ direction: "vertical" as const, position: x });
    }

    for (let y = GRID_SIZE; y < canvasSize.height; y += GRID_SIZE) {
      lines.push({ direction: "horizontal" as const, position: y });
    }

    return lines;
  }, [canvasSize.height, canvasSize.width]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const point = readPoint(event);
          const nextStroke = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            points: [point]
          };

          currentStrokeRef.current = nextStroke;
          setCurrentStroke(nextStroke);
        },
        onPanResponderMove: (event) => {
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

  function commitCurrentStroke() {
    const stroke = currentStrokeRef.current;

    if (stroke && stroke.points.length > 1) {
      onChange([...strokes, stroke]);
    }

    currentStrokeRef.current = null;
    setCurrentStroke(null);
  }

  function undoStroke() {
    onChange(strokes.slice(0, -1));
  }

  function clearStrokes() {
    onChange([]);
  }

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/30">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="h-[64%] rounded-t-[28px] border border-glacier-border bg-glacier-card px-4 pb-5 pt-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-extrabold text-glacier-textPrimary">
              草稿纸
            </Text>
            <View className="flex-row items-center gap-2">
              <ToolButton
                label="撤销"
                disabled={strokes.length === 0}
                onPress={undoStroke}
                icon={<RotateCcw color={colors.primary} size={17} />}
              />
              <ToolButton
                label="清空"
                disabled={strokes.length === 0}
                onPress={clearStrokes}
                icon={<Trash2 color={colors.error} size={17} />}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="关闭草稿纸"
                className="h-9 w-9 items-center justify-center rounded-full bg-glacier-cardSoft"
                onPress={onClose}
              >
                <X color={colors.textSecondary} size={18} />
              </Pressable>
            </View>
          </View>

          <View
            className="flex-1 overflow-hidden rounded-[22px] border border-glacier-border bg-glacier-cardSoft"
            onLayout={(event) => {
              const { height, width } = event.nativeEvent.layout;
              setCanvasSize({ height, width });
            }}
            {...panResponder.panHandlers}
          >
            <Svg height="100%" width="100%">
              {gridLines.map((line) =>
                line.direction === "vertical" ? (
                  <Line
                    key={`v-${line.position}`}
                    x1={line.position}
                    y1={0}
                    x2={line.position}
                    y2={canvasSize.height}
                    stroke={colors.border}
                    strokeWidth={1}
                  />
                ) : (
                  <Line
                    key={`h-${line.position}`}
                    x1={0}
                    y1={line.position}
                    x2={canvasSize.width}
                    y2={line.position}
                    stroke={colors.border}
                    strokeWidth={1}
                  />
                )
              )}
              {[...strokes, ...(currentStroke ? [currentStroke] : [])].map((stroke) => (
                <Path
                  key={stroke.id}
                  d={toPath(stroke.points)}
                  fill="none"
                  stroke={colors.textPrimary}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                />
              ))}
            </Svg>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="完成草稿"
            className="mt-4 min-h-[48px] items-center justify-center rounded-2xl bg-glacier-primary"
            onPress={onClose}
          >
            <Text className="text-base font-extrabold text-glacier-card">完成</Text>
          </Pressable>
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
        "h-9 flex-row items-center gap-1.5 rounded-full border px-3",
        disabled
          ? "border-glacier-border bg-glacier-cardSoft opacity-50"
          : "border-glacier-border bg-glacier-card"
      ].join(" ")}
      onPress={onPress}
    >
      {icon}
      <Text className="text-sm font-bold text-glacier-textPrimary">{label}</Text>
    </Pressable>
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
