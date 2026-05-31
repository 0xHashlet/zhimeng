import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle2, RotateCcw, Timer, Zap } from "lucide-react-native";
import { colors } from "../../theme/colors";

type OptionKey = "A" | "B" | "C" | "D";

type TrainingOption = {
  key: OptionKey;
  value: string;
};

type BaseWeightQuestion = {
  answer: OptionKey;
  explanation: string;
  id: number;
  material: string;
  options: TrainingOption[];
  question: string;
  tag: string;
};

const questions: BaseWeightQuestion[] = [
  {
    id: 1,
    tag: "工业增加值",
    material:
      "2023 年，某市规模以上工业增加值为 2,860 亿元，同比增长 8.6%。其中，高技术制造业增加值为 760 亿元，同比增长 12.1%。",
    question: "2022 年该市高技术制造业增加值占规模以上工业增加值的比重约为多少？",
    options: [
      { key: "A", value: "25.7%" },
      { key: "B", value: "26.6%" },
      { key: "C", value: "27.4%" },
      { key: "D", value: "28.1%" }
    ],
    answer: "A",
    explanation: "基期比重约为 760/2860 × (1+8.6%)/(1+12.1%)，约 25.7%。"
  },
  {
    id: 2,
    tag: "消费市场",
    material:
      "2023 年，某省社会消费品零售总额为 18,420 亿元，同比增长 6.9%。其中，网上零售额为 4,260 亿元，同比增长 11.8%。",
    question: "2022 年该省网上零售额占社会消费品零售总额的比重约为多少？",
    options: [
      { key: "A", value: "21.5%" },
      { key: "B", value: "22.1%" },
      { key: "C", value: "23.1%" },
      { key: "D", value: "24.2%" }
    ],
    answer: "B",
    explanation: "基期比重约为 4260/18420 × 1.069/1.118，约 22.1%。"
  },
  {
    id: 3,
    tag: "财政收入",
    material:
      "2023 年，某地区一般公共预算收入为 1,240 亿元，同比增长 6.7%。其中，税收收入为 910 亿元，同比增长 8.9%。",
    question: "2022 年该地区税收收入占一般公共预算收入的比重约为多少？",
    options: [
      { key: "A", value: "71.7%" },
      { key: "B", value: "72.4%" },
      { key: "C", value: "73.4%" },
      { key: "D", value: "74.9%" }
    ],
    answer: "A",
    explanation: "基期比重约为 910/1240 × 1.067/1.089，约 71.7%。"
  },
  {
    id: 4,
    tag: "进出口",
    material:
      "2023 年，某市进出口总额为 9,680 亿元，同比增长 4.5%。其中，出口额为 5,720 亿元，同比增长 7.2%。",
    question: "2022 年该市出口额占进出口总额的比重约为多少？",
    options: [
      { key: "A", value: "56.8%" },
      { key: "B", value: "57.7%" },
      { key: "C", value: "59.1%" },
      { key: "D", value: "60.6%" }
    ],
    answer: "B",
    explanation: "基期比重约为 5720/9680 × 1.045/1.072，约 57.7%。"
  },
  {
    id: 5,
    tag: "交通运输",
    material:
      "2023 年，某省货物周转量为 4,850 亿吨公里，同比增长 5.4%。其中，铁路货物周转量为 1,360 亿吨公里，同比增长 9.6%。",
    question: "2022 年该省铁路货物周转量占货物周转量的比重约为多少？",
    options: [
      { key: "A", value: "26.9%" },
      { key: "B", value: "27.4%" },
      { key: "C", value: "28.0%" },
      { key: "D", value: "29.1%" }
    ],
    answer: "A",
    explanation: "基期比重约为 1360/4850 × 1.054/1.096，约 26.9%。"
  },
  {
    id: 6,
    tag: "服务业",
    material:
      "2023 年，某地服务业增加值为 7,520 亿元，同比增长 7.8%。其中，信息传输、软件和信息技术服务业增加值为 1,180 亿元，同比增长 14.5%。",
    question: "2022 年该行业增加值占服务业增加值的比重约为多少？",
    options: [
      { key: "A", value: "14.1%" },
      { key: "B", value: "14.8%" },
      { key: "C", value: "15.7%" },
      { key: "D", value: "16.6%" }
    ],
    answer: "B",
    explanation: "基期比重约为 1180/7520 × 1.078/1.145，约 14.8%。"
  },
  {
    id: 7,
    tag: "固定资产投资",
    material:
      "2023 年，某市固定资产投资额为 6,340 亿元，同比增长 3.8%。其中，民间投资额为 3,120 亿元，同比下降 1.6%。",
    question: "2022 年该市民间投资额占固定资产投资额的比重约为多少？",
    options: [
      { key: "A", value: "48.5%" },
      { key: "B", value: "49.2%" },
      { key: "C", value: "50.3%" },
      { key: "D", value: "51.9%" }
    ],
    answer: "D",
    explanation: "基期比重约为 3120/6340 × 1.038/(1-1.6%)，约 51.9%。"
  },
  {
    id: 8,
    tag: "农业",
    material:
      "2023 年，某县农林牧渔业总产值为 865 亿元，同比增长 5.2%。其中，畜牧业产值为 286 亿元，同比增长 2.4%。",
    question: "2022 年该县畜牧业产值占农林牧渔业总产值的比重约为多少？",
    options: [
      { key: "A", value: "32.1%" },
      { key: "B", value: "33.1%" },
      { key: "C", value: "34.0%" },
      { key: "D", value: "35.2%" }
    ],
    answer: "C",
    explanation: "基期比重约为 286/865 × 1.052/1.024，约 34.0%。"
  },
  {
    id: 9,
    tag: "旅游收入",
    material:
      "2023 年，某省旅游总收入为 5,680 亿元，同比增长 18.4%。其中，入境旅游收入为 420 亿元，同比增长 26.5%。",
    question: "2022 年该省入境旅游收入占旅游总收入的比重约为多少？",
    options: [
      { key: "A", value: "6.9%" },
      { key: "B", value: "7.4%" },
      { key: "C", value: "7.9%" },
      { key: "D", value: "8.3%" }
    ],
    answer: "A",
    explanation: "基期比重约为 420/5680 × 1.184/1.265，约 6.9%。"
  },
  {
    id: 10,
    tag: "研发投入",
    material:
      "2023 年，某市研究与试验发展经费支出为 960 亿元，同比增长 12.6%。其中，企业研发经费支出为 742 亿元，同比增长 15.9%。",
    question: "2022 年该市企业研发经费支出占研发经费支出的比重约为多少？",
    options: [
      { key: "A", value: "72.6%" },
      { key: "B", value: "74.0%" },
      { key: "C", value: "75.6%" },
      { key: "D", value: "77.3%" }
    ],
    answer: "C",
    explanation: "基期比重约为 742/960 × 1.126/1.159，约 75.6%。"
  }
];

export function DashboardScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, OptionKey>>({});
  const [startedAt, setStartedAt] = useState(Date.now());
  const currentQuestion = questions[currentIndex];
  const selectedAnswer = selectedAnswers[currentQuestion.id];
  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = useMemo(
    () =>
      questions.filter((question) => selectedAnswers[question.id] === question.answer)
        .length,
    [selectedAnswers]
  );
  const isCompleted = answeredCount === questions.length;
  const elapsedSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
  const averageSeconds = Math.round(elapsedSeconds / Math.max(1, answeredCount));

  function selectAnswer(answer: OptionKey) {
    if (selectedAnswer) {
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

  function restart() {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setStartedAt(Date.now());
  }

  return (
    <SafeAreaView className="flex-1 bg-glacier-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-8 pt-4"
      >
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-[25px] font-extrabold leading-8 text-glacier-textPrimary">
              基期比重提速训练
            </Text>
            <Text className="mt-2 text-sm leading-[22px] text-glacier-textSecondary">
              一次 10 题，专练“现期比重 × 增速修正”的资料分析高频题型。
            </Text>
          </View>
          <View className="h-11 w-11 items-center justify-center rounded-full bg-glacier-soft">
            <Zap color={colors.primary} size={22} />
          </View>
        </View>

        <View className="mt-5 flex-row gap-2.5">
          <MetricCard label="进度" value={`${answeredCount}/10`} />
          <MetricCard label="正确" value={`${correctCount}`} />
          <MetricCard label="均时" value={`${averageSeconds}s`} />
        </View>

        <View className="mt-5 overflow-hidden rounded-[26px] bg-glacier-card shadow-sm">
          <View className="border-b border-glacier-border px-4 py-4">
            <View className="flex-row items-center justify-between">
              <View className="rounded-full bg-glacier-soft px-3 py-1.5">
                <Text className="text-xs font-bold text-glacier-primary">
                  {currentQuestion.tag}
                </Text>
              </View>
              <Text className="text-sm font-bold text-glacier-textSecondary">
                {currentIndex + 1} / {questions.length}
              </Text>
            </View>
            <Text className="mt-4 text-base leading-[29px] text-glacier-textPrimary">
              {currentQuestion.material}
            </Text>
          </View>

          <View className="px-4 py-4">
            <Text className="text-lg font-extrabold leading-[30px] text-glacier-textPrimary">
              {currentQuestion.question}
            </Text>

            <View className="mt-4 gap-3">
              {currentQuestion.options.map((option) => {
                const selected = selectedAnswer === option.key;
                const correct = currentQuestion.answer === option.key;
                const showResult = Boolean(selectedAnswer);

                return (
                  <Pressable
                    key={option.key}
                    accessibilityRole="button"
                    accessibilityLabel={`选项 ${option.key}，${option.value}`}
                    disabled={Boolean(selectedAnswer)}
                    className={[
                      "min-h-[58px] flex-row items-center gap-4 rounded-2xl border px-4",
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
                        "text-base font-extrabold",
                        showResult && correct
                          ? "text-glacier-success"
                          : selected
                            ? "text-glacier-error"
                            : "text-glacier-textPrimary"
                      ].join(" ")}
                    >
                      {option.key}
                    </Text>
                    <Text className="flex-1 text-base font-semibold text-glacier-textPrimary">
                      {option.value}
                    </Text>
                    {showResult && correct ? (
                      <CheckCircle2 color={colors.success} size={21} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            {selectedAnswer ? (
              <View className="mt-4 rounded-2xl bg-glacier-cardSoft p-4">
                <Text className="text-sm font-bold text-glacier-textPrimary">
                  快速思路
                </Text>
                <Text className="mt-2 text-sm leading-[23px] text-glacier-textSecondary">
                  {currentQuestion.explanation}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="mt-5 flex-row gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="重练本组"
            className="h-12 w-12 items-center justify-center rounded-2xl border border-glacier-border bg-glacier-card"
            onPress={restart}
          >
            <RotateCcw color={colors.textSecondary} size={20} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isCompleted ? "查看本组结果" : "下一题"}
            disabled={!selectedAnswer}
            className={[
              "h-12 flex-1 items-center justify-center rounded-2xl",
              selectedAnswer ? "bg-glacier-primary" : "bg-glacier-border"
            ].join(" ")}
            onPress={goNext}
          >
            <Text className="text-base font-extrabold text-white">
              {isCompleted ? "本组完成" : "下一题"}
            </Text>
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
              做对 {correctCount} / 10，平均每题 {averageSeconds} 秒。目标是先稳定 80%
              正确率，再把单题压到 45 秒内。
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-2xl bg-glacier-card p-3 shadow-sm">
      <Text className="text-xs font-semibold text-glacier-textMuted">{label}</Text>
      <Text className="mt-1.5 text-xl font-extrabold text-glacier-textPrimary">
        {value}
      </Text>
    </View>
  );
}
