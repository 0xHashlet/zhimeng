import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  CheckCircle2,
  PenLine,
  RotateCcw,
  Timer,
  Trash2,
  Undo2
} from "lucide-react-native";
import { DraftLayer } from "../../components/DraftLayer";
import { colors } from "../../theme/colors";
import type {
  BaseWeightQuestion,
  OptionKey,
  TrainingConfig
} from "../../types/training";

type QuestionTrainingScreenProps = {
  config: TrainingConfig;
  questions: BaseWeightQuestion[];
  onBack: () => void;
};

const difficultyLabel = {
  easy: "简单",
  medium: "标准",
  hard: "困难"
};

export function QuestionTrainingScreen({
  config,
  questions,
  onBack
}: QuestionTrainingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, OptionKey>>({});
  const [startedAt, setStartedAt] = useState(Date.now());
  const [draftActive, setDraftActive] = useState(false);
  const [clearSignal, setClearSignal] = useState(0);
  const [undoSignal, setUndoSignal] = useState(0);
  const currentQuestion = questions[currentIndex];
  const selectedAnswer = selectedAnswers[currentQuestion.id];
  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = useMemo(
    () =>
      questions.filter((question) => selectedAnswers[question.id] === question.answer)
        .length,
    [questions, selectedAnswers]
  );
  const isCompleted = answeredCount === questions.length;
  const elapsedSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
  const averageSeconds = Math.round(elapsedSeconds / Math.max(1, answeredCount));

  function selectAnswer(answer: OptionKey) {
    if (selectedAnswer || draftActive) {
      return;
    }

    setSelectedAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentQuestion.id]: answer
    }));
  }

  function goNext() {
    setCurrentIndex((index) => Math.min(questions.length - 1, index + 1));
  }

  function resetTraining() {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setStartedAt(Date.now());
    setClearSignal((value) => value + 1);
  }

  return (
    <SafeAreaView className="flex-1 bg-glacier-background">
      <View className="relative flex-1">
        <View className="border-b border-glacier-border bg-glacier-card px-5 pb-3 pt-2">
          <View className="flex-row items-center justify-between">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="返回首页"
              className="h-11 w-11 items-center justify-center rounded-full"
              onPress={onBack}
            >
              <ArrowLeft color={colors.textPrimary} size={25} />
            </Pressable>
            <Text className="text-xl font-extrabold text-glacier-textPrimary">
              {currentIndex + 1} / {questions.length}
            </Text>
            <View className="flex-row gap-2">
              {draftActive ? (
                <>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="撤销草稿"
                    className="h-11 w-11 items-center justify-center rounded-full bg-glacier-soft"
                    onPress={() => setUndoSignal((value) => value + 1)}
                  >
                    <Undo2 color={colors.primary} size={21} />
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="清空草稿"
                    className="h-11 w-11 items-center justify-center rounded-full bg-red-50"
                    onPress={() => setClearSignal((value) => value + 1)}
                  >
                    <Trash2 color={colors.error} size={21} />
                  </Pressable>
                </>
              ) : null}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={draftActive ? "关闭草稿" : "打开草稿"}
                className={[
                  "h-11 w-11 items-center justify-center rounded-full",
                  draftActive ? "bg-glacier-primary" : "bg-glacier-soft"
                ].join(" ")}
                onPress={() => setDraftActive((value) => !value)}
              >
                <PenLine color={draftActive ? colors.card : colors.primary} size={21} />
              </Pressable>
            </View>
          </View>
          <View className="mt-2 h-1 overflow-hidden rounded-full bg-glacier-border">
            <View
              className="h-full rounded-full bg-glacier-primary"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </View>
        </View>

        {draftActive ? (
          <View className="absolute inset-0 z-10 bg-glacier-background/50" />
        ) : null}

        <ScrollView
          scrollEnabled={!draftActive}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-5 pb-8 pt-5"
        >
          <View className="flex-row flex-wrap gap-2">
            <View className="rounded-full bg-glacier-soft px-3 py-1.5">
              <Text className="text-xs font-bold text-glacier-primary">
                {currentQuestion.tag}
              </Text>
            </View>
            <View className="rounded-full bg-glacier-cardSoft px-3 py-1.5">
              <Text className="text-xs font-bold text-glacier-textSecondary">
                题干 {difficultyLabel[config.materialDifficulty]}
              </Text>
            </View>
            <View className="rounded-full bg-glacier-cardSoft px-3 py-1.5">
              <Text className="text-xs font-bold text-glacier-textSecondary">
                选项 {difficultyLabel[config.optionDifficulty]}
              </Text>
            </View>
          </View>

          <Text className="mt-5 text-[20px] font-extrabold leading-8 text-glacier-textPrimary">
            {currentQuestion.question}
          </Text>

          <Text className="mt-4 text-base leading-[31px] text-glacier-textSecondary">
            {currentQuestion.material}
          </Text>

          <View className="mt-5 gap-3">
            {currentQuestion.options.map((option) => {
              const selected = selectedAnswer === option.key;
              const correct = currentQuestion.answer === option.key;
              const showResult = Boolean(selectedAnswer);

              return (
                <Pressable
                  key={option.key}
                  accessibilityRole="button"
                  accessibilityLabel={`选项 ${option.key}，${option.value}`}
                  disabled={Boolean(selectedAnswer) || draftActive}
                  className={[
                    "min-h-[64px] flex-row items-center gap-4 rounded-[22px] border px-5",
                    selected
                      ? correct
                        ? "border-glacier-success bg-glacier-cardSoft"
                        : "border-glacier-error bg-glacier-card"
                      : showResult && correct
                        ? "border-glacier-success bg-glacier-cardSoft"
                        : "border-glacier-border bg-glacier-card"
                  ].join(" ")}
                  onPress={() => selectAnswer(option.key)}
                >
                  <Text
                    className={[
                      "text-lg font-extrabold",
                      showResult && correct
                        ? "text-glacier-success"
                        : selected
                          ? "text-glacier-error"
                          : "text-glacier-textPrimary"
                    ].join(" ")}
                  >
                    {option.key}
                  </Text>
                  <Text className="flex-1 text-lg font-semibold text-glacier-textPrimary">
                    {option.value}
                  </Text>
                  {showResult && correct ? (
                    <CheckCircle2 color={colors.success} size={23} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          {selectedAnswer ? (
            <View className="mt-5 rounded-[22px] bg-glacier-cardSoft p-4">
              <Text className="text-sm font-bold text-glacier-textPrimary">
                快速思路
              </Text>
              <Text className="mt-2 text-sm leading-[23px] text-glacier-textSecondary">
                {currentQuestion.explanation}
              </Text>
            </View>
          ) : null}

          <View className="mt-5 flex-row gap-3">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isCompleted ? "本组完成" : "下一题"}
              disabled={!selectedAnswer || isCompleted || draftActive}
              className={[
                "h-12 flex-1 items-center justify-center rounded-2xl",
                selectedAnswer && !isCompleted && !draftActive
                  ? "bg-glacier-primary"
                  : "bg-glacier-border"
              ].join(" ")}
              onPress={goNext}
            >
              <Text className="text-base font-extrabold text-white">
                {isCompleted ? "本组完成" : "下一题"}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="重练本组"
              className="h-12 w-12 items-center justify-center rounded-2xl border border-glacier-border bg-glacier-card"
              onPress={resetTraining}
            >
              <RotateCcw color={colors.textSecondary} size={20} />
            </Pressable>
          </View>

          {isCompleted ? (
            <View className="mt-5 rounded-[24px] bg-glacier-card p-4 shadow-sm">
              <View className="flex-row items-center gap-2">
                <Timer color={colors.primary} size={20} />
                <Text className="text-base font-extrabold text-glacier-textPrimary">
                  本组结果
                </Text>
              </View>
              <Text className="mt-3 text-sm leading-[23px] text-glacier-textSecondary">
                做对 {correctCount} / {questions.length}，平均每题 {averageSeconds}
                秒。目标是先稳定正确率，再把单题时间压下来。
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <DraftLayer
          active={draftActive}
          clearSignal={clearSignal}
          onClearHandled={() => undefined}
          undoSignal={undoSignal}
          onUndoHandled={() => undefined}
        />
      </View>
    </SafeAreaView>
  );
}
