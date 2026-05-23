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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RotateCcw, Trash2, X } from "lucide-react-native";
import { colors } from "../theme/colors";
import type { DraftPoint, DraftStroke } from "../types/draft";

type DraftSheetProps = {
  visible: boolean;
  strokes: DraftStroke[];
  onChange: (strokes: DraftStroke[]) => void;
  onClose: () => void;
};

const MIN_POINT_DISTANCE = 3;
const TOOLBAR_HEIGHT = 44;

export function DraftSheet({ onChange, onClose, strokes, visible }: DraftSheetProps) {
  const [currentStroke, setCurrentStroke] = useState<DraftStroke | null>(null);
  const currentStrokeRef = useRef<DraftStroke | null>(null);
  const insets = useSafeAreaInsets();
  const canvasTop = insets.top + TOOLBAR_HEIGHT;

  useEffect(() => {
    if (!visible) {
      setCurrentStroke(null);
      currentStrokeRef.current = null;
    }
  }, [visible]);

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
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-glacier-card/30">
        <View
          className="absolute bottom-0 left-0 right-0"
          style={{ top: canvasTop }}
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
            height: canvasTop,
            paddingTop: insets.top
          }}
        >
          <View className="h-11 flex-row items-center justify-between">
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
