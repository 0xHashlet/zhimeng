import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  View,
  type LayoutChangeEvent
} from "react-native";
import type { DimensionValue } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Bookmark,
  Check,
  ChevronLeft,
  PencilLine,
  RotateCcw,
  Trash2,
  X
} from "lucide-react-native";
import { DraftCanvas } from "../../components/DraftCanvas";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import { fetchMockDiagnostic } from "../../services/practice";
import { colors } from "../../theme/colors";
import type { DraftPoint, DraftStroke } from "../../types/draft";
import type { MockDiagnostic } from "../../types/practice";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const questionPanelCollapsedHeight = 156;
const questionPanelExpandedHeight = Math.min(screenHeight * 0.58, 440);
const questionPanelBottomGap = 32;

type DraftLayer = "material" | "question";

type QuestionDrafts = Record<DraftLayer, DraftStroke[]>;

type ActiveDraftStroke = {
  pointCount: number;
  strokeId: string;
};

type DraftLayoutSnapshot = {
  materialContentX: number;
  materialContentY: number;
  materialScrollY: number;
  pageTop: number;
  questionPanelTop: number;
};

type DraftSessionPoint = DraftPoint & {
  snapshot: DraftLayoutSnapshot;
};

type DraftSessionStroke = {
  id: string;
  points: DraftSessionPoint[];
};

function createEmptyQuestionDrafts(): QuestionDrafts {
  return {
    material: [],
    question: []
  };
}

export function DiagnosticTestScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [diagnostic, setDiagnostic] = useState<MockDiagnostic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [draftVisible, setDraftVisible] = useState(false);
  const [drafts, setDrafts] = useState<Record<number, QuestionDrafts>>({});
  const [draftSessionStrokes, setDraftSessionStrokes] = useState<
    Record<number, DraftStroke[]>
  >({});
  const [draftStrokeHistory, setDraftStrokeHistory] = useState<
    Record<number, DraftLayer[]>
  >({});
  const [questionPanelBottomInset, setQuestionPanelBottomInset] = useState(
    questionPanelExpandedHeight + questionPanelBottomGap
  );
  const [contentHeight, setContentHeight] = useState(screenHeight);
  const [pageTop, setPageTop] = useState(0);
  const draftSessionStrokesRef = useRef<Record<number, DraftSessionStroke[]>>({});
  const materialScrollRefs = useRef<Record<number, ScrollView | null>>({});
  const materialScrollOffsets = useRef<Record<number, number>>({});
  const materialContentFrames = useRef<
    Record<
      number,
      {
        x: number;
        y: number;
      }
    >
  >({});
  const materialViewportHeights = useRef<Record<number, number>>({});
  const materialScrollMaxOffsets = useRef<Record<number, number>>({});
  const questionScrollRefs = useRef<Record<number, ScrollView | null>>({});
  const questionScrollOffsets = useRef<Record<number, number>>({});
  const questionViewportHeights = useRef<Record<number, number>>({});
  const questionScrollMaxOffsets = useRef<Record<number, number>>({});
  const activeDraftStrokeRef = useRef<ActiveDraftStroke | null>(null);
  const questionPanelHeight = useRef(
    new Animated.Value(questionPanelExpandedHeight)
  ).current;
  const questionPanelHeightRef = useRef(questionPanelExpandedHeight);
  const [questionPanelHeightValue, setQuestionPanelHeightValue] = useState(
    questionPanelExpandedHeight
  );

  const questionPanelPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !draftVisible,
        onStartShouldSetPanResponderCapture: () => !draftVisible,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          !draftVisible && Math.abs(gestureState.dy) > 4,
        onMoveShouldSetPanResponderCapture: () => !draftVisible,
        onPanResponderGrant: () => {
          if (draftVisible) {
            return;
          }

          questionPanelHeight.stopAnimation((value) => {
            questionPanelHeightRef.current = value;
          });
        },
        onPanResponderMove: (_, gestureState) => {
          if (draftVisible) {
            return;
          }

          const nextHeight = clampQuestionPanelHeight(
            questionPanelHeightRef.current - gestureState.dy
          );
          setQuestionPanelBottomInset(nextHeight + questionPanelBottomGap);
          setQuestionPanelHeightValue(nextHeight);
          questionPanelHeight.setValue(nextHeight);
        },
        onPanResponderRelease: (_, gestureState) => {
          if (draftVisible) {
            return;
          }

          settleQuestionPanel(questionPanelHeightRef.current - gestureState.dy);
        },
        onPanResponderTerminate: () => {
          if (draftVisible) {
            return;
          }

          settleQuestionPanel(questionPanelHeightRef.current);
        }
      }),
    [draftVisible, questionPanelHeight]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadDiagnostic() {
      try {
        const data = await fetchMockDiagnostic();

        if (isMounted) {
          setDiagnostic(data);
          setErrorMessage("");
        }
      } catch {
        if (isMounted) {
          setErrorMessage("题目数据加载失败，请确认后端服务已启动");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDiagnostic();

    return () => {
      isMounted = false;
    };
  }, []);

  function settleQuestionPanel(nextHeight: number) {
    const targetHeight = clampQuestionPanelHeight(nextHeight);

    questionPanelHeightRef.current = targetHeight;
    setQuestionPanelBottomInset(targetHeight + questionPanelBottomGap);
    setQuestionPanelHeightValue(targetHeight);
    Animated.spring(questionPanelHeight, {
      damping: 22,
      mass: 0.8,
      stiffness: 220,
      toValue: targetHeight,
      useNativeDriver: false
    }).start();
  }

  const progressText = diagnostic
    ? `${diagnostic.currentIndex} / ${diagnostic.totalCount}`
    : "- / -";
  const progressPercent = (
    diagnostic ? `${(diagnostic.currentIndex / diagnostic.totalCount) * 100}%` : "0%"
  ) as DimensionValue;
  const activeQuestionId = diagnostic?.questions[activePageIndex]?.id;
  const activeDrafts = activeQuestionId
    ? (drafts[activeQuestionId] ?? createEmptyQuestionDrafts())
    : createEmptyQuestionDrafts();
  const activeDraftSessionStrokes = activeQuestionId
    ? (draftSessionStrokes[activeQuestionId] ?? [])
    : [];
  const hasActiveDraft =
    activeDrafts.material.length > 0 ||
    activeDrafts.question.length > 0 ||
    activeDraftSessionStrokes.length > 0;

  function undoDraftStroke() {
    if (!activeQuestionId) {
      return;
    }

    const sessionStrokes = draftSessionStrokesRef.current[activeQuestionId] ?? [];

    if (sessionStrokes.length > 0) {
      const nextSessionStrokes = sessionStrokes.slice(0, -1);
      draftSessionStrokesRef.current = {
        ...draftSessionStrokesRef.current,
        [activeQuestionId]: nextSessionStrokes
      };
      setDraftSessionStrokes((currentStrokes) => ({
        ...currentStrokes,
        [activeQuestionId]: toRenderableSessionStrokes(nextSessionStrokes)
      }));
      return;
    }

    const history = draftStrokeHistory[activeQuestionId] ?? [];
    const lastLayer = history[history.length - 1];

    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [activeQuestionId]: lastLayer
        ? removeLastLayerStroke(
            currentDrafts[activeQuestionId] ?? createEmptyQuestionDrafts(),
            lastLayer
          )
        : undoQuestionDraft(
            currentDrafts[activeQuestionId] ?? createEmptyQuestionDrafts()
          )
    }));
    setDraftStrokeHistory((currentHistory) => ({
      ...currentHistory,
      [activeQuestionId]: history.slice(0, -1)
    }));
  }

  function clearDraftStrokes() {
    if (!activeQuestionId) {
      return;
    }

    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [activeQuestionId]: createEmptyQuestionDrafts()
    }));
    draftSessionStrokesRef.current = {
      ...draftSessionStrokesRef.current,
      [activeQuestionId]: []
    };
    setDraftSessionStrokes((currentStrokes) => ({
      ...currentStrokes,
      [activeQuestionId]: []
    }));
    setDraftStrokeHistory((currentHistory) => ({
      ...currentHistory,
      [activeQuestionId]: []
    }));
  }

  function scrollMaterialContent(questionId: number, deltaY: number) {
    const currentOffset = materialScrollOffsets.current[questionId] ?? 0;
    const maxOffset = materialScrollMaxOffsets.current[questionId];
    const nextOffset = clampScrollOffset(currentOffset + deltaY, maxOffset);

    materialScrollOffsets.current[questionId] = nextOffset;
    materialScrollRefs.current[questionId]?.scrollTo({
      animated: false,
      y: nextOffset
    });
  }

  function scrollQuestionContent(questionId: number, deltaY: number) {
    const currentOffset = questionScrollOffsets.current[questionId] ?? 0;
    const maxOffset = questionScrollMaxOffsets.current[questionId];
    const nextOffset = clampScrollOffset(currentOffset + deltaY, maxOffset);

    questionScrollOffsets.current[questionId] = nextOffset;
    questionScrollRefs.current[questionId]?.scrollTo({
      animated: false,
      y: nextOffset
    });
  }

  function handleDraftStart(point: DraftPoint) {
    if (!activeQuestionId) {
      return;
    }

    const strokeId = createDraftStrokeId("session");
    const sessionPoint = createSessionPoint(activeQuestionId, point);
    const nextSessionStrokes = [
      ...(draftSessionStrokesRef.current[activeQuestionId] ?? []),
      {
        id: strokeId,
        points: [sessionPoint]
      }
    ];

    activeDraftStrokeRef.current = {
      pointCount: 1,
      strokeId
    };
    draftSessionStrokesRef.current = {
      ...draftSessionStrokesRef.current,
      [activeQuestionId]: nextSessionStrokes
    };
    setDraftSessionStrokes((currentStrokes) => ({
      ...currentStrokes,
      [activeQuestionId]: toRenderableSessionStrokes(nextSessionStrokes)
    }));
  }

  function handleDraftMove(point: DraftPoint) {
    if (!activeQuestionId || !activeDraftStrokeRef.current) {
      return;
    }

    const currentStroke = activeDraftStrokeRef.current;
    const sessionPoint = createSessionPoint(activeQuestionId, point);
    const nextSessionStrokes = (
      draftSessionStrokesRef.current[activeQuestionId] ?? []
    ).map((stroke) =>
      stroke.id === currentStroke.strokeId
        ? {
            ...stroke,
            points: [...stroke.points, sessionPoint]
          }
        : stroke
    );

    draftSessionStrokesRef.current = {
      ...draftSessionStrokesRef.current,
      [activeQuestionId]: nextSessionStrokes
    };
    setDraftSessionStrokes((currentStrokes) => ({
      ...currentStrokes,
      [activeQuestionId]: toRenderableSessionStrokes(nextSessionStrokes)
    }));
    activeDraftStrokeRef.current = {
      ...currentStroke,
      pointCount: currentStroke.pointCount + 1
    };
  }

  function handleDraftEnd() {
    if (
      activeQuestionId &&
      activeDraftStrokeRef.current &&
      activeDraftStrokeRef.current.pointCount <= 1
    ) {
      const sessionStrokes = draftSessionStrokesRef.current[activeQuestionId] ?? [];
      const nextSessionStrokes = sessionStrokes.slice(0, -1);

      draftSessionStrokesRef.current = {
        ...draftSessionStrokesRef.current,
        [activeQuestionId]: nextSessionStrokes
      };
      setDraftSessionStrokes((currentStrokes) => ({
        ...currentStrokes,
        [activeQuestionId]: toRenderableSessionStrokes(nextSessionStrokes)
      }));
    }

    activeDraftStrokeRef.current = null;
  }

  function closeDraftMode() {
    if (activeQuestionId) {
      commitDraftSession(activeQuestionId);
    }

    activeDraftStrokeRef.current = null;
    setDraftVisible(false);
  }

  function handleDraftTwoFingerScroll(deltaY: number, centerY: number) {
    if (!activeQuestionId) {
      return;
    }

    const questionPanelTop = contentHeight - questionPanelHeightValue;

    if (centerY >= questionPanelTop) {
      scrollQuestionContent(activeQuestionId, deltaY);
      return;
    }

    scrollMaterialContent(activeQuestionId, deltaY);
  }

  function handleContentLayout(event: LayoutChangeEvent) {
    setContentHeight(event.nativeEvent.layout.height);
  }

  function handlePageLayout(event: LayoutChangeEvent) {
    setPageTop(event.nativeEvent.layout.y);
  }

  function createSessionPoint(
    questionId: number,
    point: DraftPoint
  ): DraftSessionPoint {
    const materialContentFrame = materialContentFrames.current[questionId] ?? {
      x: 0,
      y: 0
    };

    return {
      ...point,
      snapshot: {
        materialContentX: materialContentFrame.x,
        materialContentY: materialContentFrame.y,
        materialScrollY: materialScrollOffsets.current[questionId] ?? 0,
        pageTop,
        questionPanelTop: contentHeight - questionPanelHeightValue
      }
    };
  }

  function commitDraftSession(questionId: number) {
    const sessionStrokes = draftSessionStrokesRef.current[questionId] ?? [];

    if (sessionStrokes.length === 0) {
      return;
    }

    const nextDrafts = sessionStrokes.reduce(
      (mergedDrafts, stroke) =>
        mergeQuestionDrafts(mergedDrafts, splitSessionStroke(stroke)),
      createEmptyQuestionDrafts()
    );

    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [questionId]: mergeQuestionDrafts(
        currentDrafts[questionId] ?? createEmptyQuestionDrafts(),
        nextDrafts
      )
    }));
    setDraftStrokeHistory((currentHistory) => ({
      ...currentHistory,
      [questionId]: [
        ...(currentHistory[questionId] ?? []),
        ...nextDrafts.material.map(() => "material" as DraftLayer),
        ...nextDrafts.question.map(() => "question" as DraftLayer)
      ]
    }));
    draftSessionStrokesRef.current = {
      ...draftSessionStrokesRef.current,
      [questionId]: []
    };
    setDraftSessionStrokes((currentStrokes) => ({
      ...currentStrokes,
      [questionId]: []
    }));
  }

  function splitSessionStroke(stroke: DraftSessionStroke): QuestionDrafts {
    const splitDrafts: QuestionDrafts = {
      material: [],
      question: []
    };
    let segmentIndex = 0;
    let previousPoint: DraftSessionPoint | null = null;
    let previousLayer: DraftLayer | null = null;
    let currentLayer: DraftLayer | null = null;
    let currentPoints: DraftPoint[] = [];

    function flushSegment() {
      if (!currentLayer || currentPoints.length <= 1) {
        currentPoints = [];
        return;
      }

      splitDrafts[currentLayer] = [
        ...splitDrafts[currentLayer],
        {
          id: `${stroke.id}-${currentLayer}-${segmentIndex}`,
          points: currentPoints
        }
      ];
      segmentIndex += 1;
      currentPoints = [];
    }

    stroke.points.forEach((point) => {
      const layer = getSessionPointLayer(point);
      const layerPoint = convertSessionPointToLayerPoint(point, layer);

      if (previousPoint && previousLayer && previousLayer !== layer) {
        const boundaryPoint = getSessionBoundaryPoint(previousPoint, point);

        currentPoints.push(
          convertSessionPointToLayerPoint(boundaryPoint, previousLayer)
        );
        flushSegment();

        currentLayer = layer;
        currentPoints = [
          convertSessionPointToLayerPoint(boundaryPoint, layer),
          layerPoint
        ];
      } else {
        if (currentLayer !== layer) {
          flushSegment();
          currentLayer = layer;
        }

        currentPoints.push(layerPoint);
      }

      previousPoint = point;
      previousLayer = layer;
    });

    flushSegment();

    return splitDrafts;
  }

  function getSessionPointLayer(point: DraftSessionPoint): DraftLayer {
    return point.y >= point.snapshot.questionPanelTop ? "question" : "material";
  }

  function getSessionBoundaryPoint(
    startPoint: DraftSessionPoint,
    endPoint: DraftSessionPoint
  ): DraftSessionPoint {
    const distanceY = endPoint.y - startPoint.y;

    if (distanceY === 0) {
      return endPoint;
    }

    const progress = (startPoint.snapshot.questionPanelTop - startPoint.y) / distanceY;
    const clampedProgress = Math.min(1, Math.max(0, progress));

    return {
      x: startPoint.x + (endPoint.x - startPoint.x) * clampedProgress,
      y: startPoint.snapshot.questionPanelTop,
      snapshot: startPoint.snapshot
    };
  }

  function convertSessionPointToLayerPoint(
    point: DraftSessionPoint,
    layer: DraftLayer
  ): DraftPoint {
    if (layer === "question") {
      return {
        x: point.x,
        y: point.y - point.snapshot.questionPanelTop
      };
    }

    return {
      x: point.x - point.snapshot.materialContentX,
      y:
        point.y -
        point.snapshot.pageTop -
        point.snapshot.materialContentY +
        point.snapshot.materialScrollY
    };
  }

  return (
    <SafeAreaView className="flex-1 bg-glacier-background">
      <View className="flex-1" onLayout={handleContentLayout}>
        <View className="h-14 flex-row items-center justify-between px-3.5">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="返回上一页"
            className="h-11 w-11 items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft color={colors.textPrimary} size={24} />
          </Pressable>
          <Text className="text-lg font-bold text-glacier-textPrimary">
            {progressText}
          </Text>
          <View className="flex-row items-center">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="打开草稿纸"
              disabled={!activeQuestionId}
              className={[
                "relative h-11 w-11 items-center justify-center",
                activeQuestionId ? "" : "opacity-40"
              ].join(" ")}
              onPress={() => setDraftVisible(true)}
            >
              <PencilLine color={colors.textPrimary} size={22} />
              {hasActiveDraft ? (
                <View className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-glacier-primary" />
              ) : null}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="收藏本题"
              className="h-11 w-11 items-center justify-center"
            >
              <Bookmark color={colors.textPrimary} size={22} />
            </Pressable>
          </View>
        </View>
        <View className="h-[3px] bg-glacier-border">
          <View
            className="h-[3px] bg-glacier-primary"
            style={{ width: progressPercent }}
          />
        </View>

        {isLoading ? (
          <StateCard
            title="正在加载题目"
            description="正在从后端 mock 接口获取诊断题。"
          />
        ) : errorMessage ? (
          <StateCard title="加载失败" description={errorMessage} />
        ) : (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEnabled={!draftVisible}
            decelerationRate="fast"
            contentContainerClassName="items-stretch"
            className="flex-1"
            onLayout={handlePageLayout}
            onMomentumScrollEnd={(event) => {
              const nextIndex = Math.round(
                event.nativeEvent.contentOffset.x / screenWidth
              );
              setActivePageIndex(nextIndex);
            }}
          >
            {diagnostic?.questions.map((item) => (
              <View key={item.id} style={{ width: screenWidth }} className="flex-1">
                <ScrollView
                  ref={(ref) => {
                    materialScrollRefs.current[item.id] = ref;
                  }}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={!draftVisible}
                  className="flex-1"
                  contentContainerClassName="px-5 pb-6 pt-5"
                  contentContainerStyle={{
                    paddingBottom: questionPanelBottomInset
                  }}
                  onScroll={(event) => {
                    materialScrollOffsets.current[item.id] =
                      event.nativeEvent.contentOffset.y;
                  }}
                  onContentSizeChange={(_, contentHeight) => {
                    const viewportHeight =
                      materialViewportHeights.current[item.id] ?? 0;
                    materialScrollMaxOffsets.current[item.id] = Math.max(
                      0,
                      contentHeight - viewportHeight
                    );
                  }}
                  onLayout={(event) => {
                    materialViewportHeights.current[item.id] =
                      event.nativeEvent.layout.height;
                  }}
                  scrollEventThrottle={16}
                >
                  <View
                    className="relative gap-4 px-0.5 py-1"
                    onLayout={(event) => {
                      materialContentFrames.current[item.id] = {
                        x: event.nativeEvent.layout.x,
                        y: event.nativeEvent.layout.y
                      };
                    }}
                  >
                    {item.material.map((paragraph) => (
                      <Text
                        key={paragraph}
                        className="text-[15px] leading-[26px] text-glacier-textPrimary"
                      >
                        {paragraph}
                      </Text>
                    ))}
                    <DraftCanvas
                      enabled={false}
                      strokes={drafts[item.id]?.material ?? []}
                      onChange={() => undefined}
                    />
                  </View>
                </ScrollView>

                <Animated.View
                  className={[
                    "absolute bottom-0 left-0 right-0 overflow-hidden border-t bg-glacier-background",
                    draftVisible && item.id === activeQuestionId
                      ? "border-transparent"
                      : "border-glacier-border"
                  ].join(" ")}
                  style={{ height: questionPanelHeight }}
                >
                  <View
                    className="px-5 pb-2 pt-2"
                    {...questionPanelPanResponder.panHandlers}
                  >
                    <View className="mb-2 items-center">
                      <View className="h-1.5 w-10 rounded-full bg-glacier-border" />
                    </View>
                    <Text className="text-[17px] font-bold leading-[27px] text-glacier-textPrimary">
                      {item.question}
                    </Text>
                  </View>

                  <ScrollView
                    ref={(ref) => {
                      questionScrollRefs.current[item.id] = ref;
                    }}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={!draftVisible}
                    className="flex-1"
                    contentContainerClassName="gap-2.5 px-5 pb-5"
                    onScroll={(event) => {
                      questionScrollOffsets.current[item.id] =
                        event.nativeEvent.contentOffset.y;
                    }}
                    onContentSizeChange={(_, contentHeight) => {
                      const viewportHeight =
                        questionViewportHeights.current[item.id] ?? 0;
                      questionScrollMaxOffsets.current[item.id] = Math.max(
                        0,
                        contentHeight - viewportHeight
                      );
                    }}
                    onLayout={(event) => {
                      questionViewportHeights.current[item.id] =
                        event.nativeEvent.layout.height;
                    }}
                    scrollEventThrottle={16}
                  >
                    <View className="relative gap-2.5">
                      {item.options.map((option) => {
                        const selected = option.key === item.selectedAnswer;

                        return (
                          <Pressable
                            key={option.key}
                            accessibilityRole="button"
                            accessibilityLabel={`选项 ${option.key}，${option.value}`}
                            accessibilityState={{ selected }}
                            disabled={draftVisible}
                            className={[
                              "min-h-[54px] flex-row items-center gap-4 rounded-2xl border px-4",
                              selected
                                ? "border-glacier-primary bg-glacier-soft"
                                : "border-glacier-border bg-glacier-card"
                            ].join(" ")}
                          >
                            <Text
                              className={[
                                "text-base font-bold",
                                selected
                                  ? "text-glacier-primary"
                                  : "text-glacier-textPrimary"
                              ].join(" ")}
                            >
                              {option.key}
                            </Text>
                            <Text className="flex-1 text-base font-medium text-glacier-textPrimary">
                              {option.value}
                            </Text>
                            {selected ? (
                              <View className="h-6 w-6 items-center justify-center rounded-full bg-glacier-primary">
                                <Check color={colors.card} size={15} strokeWidth={3} />
                              </View>
                            ) : null}
                          </Pressable>
                        );
                      })}
                    </View>
                  </ScrollView>
                  <DraftCanvas
                    enabled={false}
                    strokes={drafts[item.id]?.question ?? []}
                    onChange={() => undefined}
                  />
                </Animated.View>
              </View>
            ))}
          </ScrollView>
        )}

        {draftVisible ? (
          <View
            pointerEvents="none"
            className="absolute bottom-0 left-0 right-0 bg-glacier-card/35"
            style={{ top: 57 }}
          />
        ) : null}

        <DraftCanvas
          enabled={draftVisible}
          inputOnly
          strokes={activeDraftSessionStrokes}
          onDrawEnd={handleDraftEnd}
          onDrawMove={handleDraftMove}
          onDrawStart={handleDraftStart}
          onTwoFingerScroll={handleDraftTwoFingerScroll}
          onChange={() => undefined}
        />

        {draftVisible ? (
          <View className="absolute left-0 right-0 top-0 z-50 border-b border-glacier-border bg-glacier-background px-5">
            <View className="h-14 flex-row items-center justify-between">
              <Text className="text-base font-extrabold text-glacier-textPrimary">
                草稿纸
              </Text>
              <View className="flex-row items-center gap-2">
                <DraftToolButton
                  label="撤销"
                  disabled={!hasActiveDraft}
                  onPress={undoDraftStroke}
                  icon={<RotateCcw color={colors.primary} size={18} />}
                />
                <DraftToolButton
                  label="清空"
                  disabled={!hasActiveDraft}
                  onPress={clearDraftStrokes}
                  icon={<Trash2 color={colors.error} size={18} />}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="关闭草稿纸"
                  className="h-9 w-9 items-center justify-center rounded-full bg-glacier-cardSoft"
                  onPress={closeDraftMode}
                >
                  <X color={colors.textSecondary} size={20} />
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function clampQuestionPanelHeight(height: number) {
  return Math.min(
    questionPanelExpandedHeight,
    Math.max(questionPanelCollapsedHeight, height)
  );
}

function clampScrollOffset(offset: number, maxOffset?: number) {
  const nextOffset = Math.max(0, offset);
  return typeof maxOffset === "number" ? Math.min(nextOffset, maxOffset) : nextOffset;
}

function createDraftStrokeId(layer: DraftLayer | "session") {
  return `${Date.now()}-${layer}-${Math.random().toString(36).slice(2)}`;
}

function mergeQuestionDrafts(
  currentDrafts: QuestionDrafts,
  nextDrafts: QuestionDrafts
) {
  return {
    material: [...currentDrafts.material, ...nextDrafts.material],
    question: [...currentDrafts.question, ...nextDrafts.question]
  };
}

function toRenderableSessionStrokes(strokes: DraftSessionStroke[]): DraftStroke[] {
  return strokes.map((stroke) => ({
    id: stroke.id,
    points: stroke.points.map(({ x, y }) => ({
      x,
      y
    }))
  }));
}

function removeLastLayerStroke(currentDrafts: QuestionDrafts, layer: DraftLayer) {
  return {
    ...currentDrafts,
    [layer]: currentDrafts[layer].slice(0, -1)
  };
}

function undoQuestionDraft(currentDrafts: QuestionDrafts) {
  if (currentDrafts.question.length > 0) {
    return {
      ...currentDrafts,
      question: currentDrafts.question.slice(0, -1)
    };
  }

  return {
    ...currentDrafts,
    material: currentDrafts.material.slice(0, -1)
  };
}

function StateCard({ description, title }: { description: string; title: string }) {
  return (
    <View className="flex-1 px-5 pt-4">
      <View className="rounded-3xl border border-glacier-border bg-glacier-card p-5">
        <Text className="text-base font-extrabold text-glacier-textPrimary">
          {title}
        </Text>
        <Text className="mt-2 text-sm leading-[22px] text-glacier-textSecondary">
          {description}
        </Text>
      </View>
    </View>
  );
}

function DraftToolButton({
  disabled,
  icon,
  label,
  onPress
}: {
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      className={[
        "h-9 w-9 items-center justify-center rounded-full bg-glacier-cardSoft",
        disabled ? "opacity-50" : ""
      ].join(" ")}
      onPress={onPress}
    >
      {icon}
    </Pressable>
  );
}
