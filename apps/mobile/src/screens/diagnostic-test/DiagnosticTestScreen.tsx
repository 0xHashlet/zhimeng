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
import { Bookmark, Check, ChevronLeft, PencilLine } from "lucide-react-native";
import { DraftSheet } from "../../components/DraftSheet";
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

export function DiagnosticTestScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [diagnostic, setDiagnostic] = useState<MockDiagnostic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [draftVisible, setDraftVisible] = useState(false);
  const [drafts, setDrafts] = useState<Record<number, DraftStroke[]>>({});
  const [questionPanelBottomInset, setQuestionPanelBottomInset] = useState(
    questionPanelExpandedHeight + questionPanelBottomGap
  );
  const materialScrollRefs = useRef<Record<number, ScrollView | null>>({});
  const materialScrollOffsets = useRef<Record<number, number>>({});
  const materialViewportHeights = useRef<Record<number, number>>({});
  const materialScrollMaxOffsets = useRef<Record<number, number>>({});
  const questionPanelHeight = useRef(
    new Animated.Value(questionPanelExpandedHeight)
  ).current;
  const questionPanelHeightRef = useRef(questionPanelExpandedHeight);

  const questionPanelPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 4,
        onPanResponderGrant: () => {
          questionPanelHeight.stopAnimation((value) => {
            questionPanelHeightRef.current = value;
          });
        },
        onPanResponderMove: (_, gestureState) => {
          const nextHeight = clampQuestionPanelHeight(
            questionPanelHeightRef.current - gestureState.dy
          );
          setQuestionPanelBottomInset(nextHeight + questionPanelBottomGap);
          questionPanelHeight.setValue(nextHeight);
        },
        onPanResponderRelease: (_, gestureState) => {
          settleQuestionPanel(questionPanelHeightRef.current - gestureState.dy);
        },
        onPanResponderTerminate: () => {
          settleQuestionPanel(questionPanelHeightRef.current);
        }
      }),
    [questionPanelHeight]
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
    const clampedHeight = clampQuestionPanelHeight(nextHeight);
    const midpoint = (questionPanelCollapsedHeight + questionPanelExpandedHeight) / 2;
    const targetHeight =
      clampedHeight > midpoint
        ? questionPanelExpandedHeight
        : questionPanelCollapsedHeight;

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
  const activeDraftStrokes = activeQuestionId ? (drafts[activeQuestionId] ?? []) : [];
  const hasActiveDraft = activeDraftStrokes.length > 0;

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
                  <View className="gap-3 rounded-[22px] border border-glacier-border bg-glacier-card p-4">
                    {item.material.map((paragraph) => (
                      <Text
                        key={paragraph}
                        className="text-[15px] leading-[26px] text-glacier-textPrimary"
                      >
                        {paragraph}
                      </Text>
                    ))}
                  </View>
                </ScrollView>

                <Animated.View
                  className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-t-[28px] border-t border-glacier-border bg-glacier-background shadow-sm"
                  style={{ height: questionPanelHeight }}
                >
                  <View
                    className="px-5 pb-3 pt-2"
                    {...questionPanelPanResponder.panHandlers}
                  >
                    <View className="mb-2 items-center">
                      <View className="h-1.5 w-10 rounded-full bg-glacier-border" />
                    </View>
                    <Text className="text-lg font-bold leading-7 text-glacier-textPrimary">
                      {item.question}
                    </Text>
                  </View>

                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    className="flex-1"
                    contentContainerClassName="gap-3 px-5 pb-5"
                  >
                    {item.options.map((option) => {
                      const selected = option.key === item.selectedAnswer;

                      return (
                        <Pressable
                          key={option.key}
                          accessibilityRole="button"
                          accessibilityLabel={`选项 ${option.key}，${option.value}`}
                          accessibilityState={{ selected }}
                          className={[
                            "min-h-[58px] flex-row items-center gap-4 rounded-[18px] border px-4",
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
                  </ScrollView>
                </Animated.View>
              </View>
            ))}
          </ScrollView>
        )}
        <DraftSheet
          visible={draftVisible}
          strokes={activeDraftStrokes}
          onClose={() => setDraftVisible(false)}
          onTwoFingerScroll={(deltaY) => {
            if (!activeQuestionId) {
              return;
            }

            const currentOffset = materialScrollOffsets.current[activeQuestionId] ?? 0;
            const maxOffset = materialScrollMaxOffsets.current[activeQuestionId];
            const nextOffset = clampScrollOffset(currentOffset + deltaY, maxOffset);

            materialScrollOffsets.current[activeQuestionId] = nextOffset;
            materialScrollRefs.current[activeQuestionId]?.scrollTo({
              animated: false,
              y: nextOffset
            });
          }}
          onChange={(nextStrokes) => {
            if (!activeQuestionId) {
              return;
            }

            setDrafts((currentDrafts) => ({
              ...currentDrafts,
              [activeQuestionId]: nextStrokes
            }));
          }}
        />
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
