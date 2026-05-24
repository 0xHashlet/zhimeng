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
  View
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
import type { DraftStroke } from "../../types/draft";
import type { MockDiagnostic } from "../../types/practice";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;
const questionPanelCollapsedHeight = 156;
const questionPanelExpandedHeight = Math.min(screenHeight * 0.58, 440);
const questionPanelBottomGap = 32;

type DraftLayer = "material" | "question";

type QuestionDrafts = Record<DraftLayer, DraftStroke[]>;

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
  const [questionPanelBottomInset, setQuestionPanelBottomInset] = useState(
    questionPanelExpandedHeight + questionPanelBottomGap
  );
  const materialScrollRefs = useRef<Record<number, ScrollView | null>>({});
  const materialScrollOffsets = useRef<Record<number, number>>({});
  const materialViewportHeights = useRef<Record<number, number>>({});
  const materialScrollMaxOffsets = useRef<Record<number, number>>({});
  const questionScrollRefs = useRef<Record<number, ScrollView | null>>({});
  const questionScrollOffsets = useRef<Record<number, number>>({});
  const questionViewportHeights = useRef<Record<number, number>>({});
  const questionScrollMaxOffsets = useRef<Record<number, number>>({});
  const questionPanelHeight = useRef(
    new Animated.Value(questionPanelExpandedHeight)
  ).current;
  const questionPanelHeightRef = useRef(questionPanelExpandedHeight);

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
  const hasActiveDraft =
    activeDrafts.material.length > 0 || activeDrafts.question.length > 0;

  function updateDraftLayer(layer: DraftLayer, nextStrokes: DraftStroke[]) {
    if (!activeQuestionId) {
      return;
    }

    setDrafts((currentDrafts) => {
      const currentQuestionDrafts =
        currentDrafts[activeQuestionId] ?? createEmptyQuestionDrafts();

      return {
        ...currentDrafts,
        [activeQuestionId]: {
          ...currentQuestionDrafts,
          [layer]: nextStrokes
        }
      };
    });
  }

  function undoDraftStroke() {
    if (!activeQuestionId) {
      return;
    }

    setDrafts((currentDrafts) => {
      const currentQuestionDrafts =
        currentDrafts[activeQuestionId] ?? createEmptyQuestionDrafts();
      const targetLayer =
        currentQuestionDrafts.question.length > 0 ? "question" : "material";

      return {
        ...currentDrafts,
        [activeQuestionId]: {
          ...currentQuestionDrafts,
          [targetLayer]: currentQuestionDrafts[targetLayer].slice(0, -1)
        }
      };
    });
  }

  function clearDraftStrokes() {
    if (!activeQuestionId) {
      return;
    }

    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [activeQuestionId]: createEmptyQuestionDrafts()
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

  return (
    <SafeAreaView className="flex-1 bg-glacier-background">
      <View className="flex-1">
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
                  <View className="relative gap-4 px-0.5 py-1">
                    {item.material.map((paragraph) => (
                      <Text
                        key={paragraph}
                        className="text-[15px] leading-[26px] text-glacier-textPrimary"
                      >
                        {paragraph}
                      </Text>
                    ))}
                    <DraftCanvas
                      enabled={draftVisible}
                      strokes={drafts[item.id]?.material ?? []}
                      onTwoFingerScroll={(deltaY) =>
                        scrollMaterialContent(item.id, deltaY)
                      }
                      onChange={(nextStrokes) =>
                        updateDraftLayer("material", nextStrokes)
                      }
                    />
                  </View>
                </ScrollView>

                <Animated.View
                  className="absolute bottom-0 left-0 right-0 overflow-hidden border-t border-glacier-border bg-glacier-background"
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
                      <DraftCanvas
                        enabled={draftVisible}
                        strokes={drafts[item.id]?.question ?? []}
                        onTwoFingerScroll={(deltaY) =>
                          scrollQuestionContent(item.id, deltaY)
                        }
                        onChange={(nextStrokes) =>
                          updateDraftLayer("question", nextStrokes)
                        }
                      />
                    </View>
                  </ScrollView>
                </Animated.View>
              </View>
            ))}
          </ScrollView>
        )}

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
                  onPress={() => setDraftVisible(false)}
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
