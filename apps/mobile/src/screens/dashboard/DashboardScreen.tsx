import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import {
  CheckCircle2,
  KeyRound,
  RotateCcw,
  Settings,
  Timer,
  Zap
} from "lucide-react-native";
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

type GeneratedQuestionsPayload = {
  questions: BaseWeightQuestion[];
};

const apiKeyStoreKey = "zhimeng.deepseek_api_key";
const modelStoreKey = "zhimeng.deepseek_model";
const defaultModel = "deepseek-v4-flash";
const modelOptions = [
  "deepseek-v4-flash",
  "deepseek-v4-pro",
  "deepseek-chat",
  "deepseek-reasoner"
] as const;

const sampleQuestions: BaseWeightQuestion[] = [
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
    explanation: "基期比重 = 760/2860 × (1+8.6%)/(1+12.1%)，约为 25.7%。"
  }
];

export function DashboardScreen() {
  const [apiKey, setApiKey] = useState("");
  const [draftApiKey, setDraftApiKey] = useState("");
  const [model, setModel] = useState(defaultModel);
  const [draftModel, setDraftModel] = useState(defaultModel);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [questions, setQuestions] = useState<BaseWeightQuestion[]>(sampleQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, OptionKey>>({});
  const [startedAt, setStartedAt] = useState(Date.now());
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
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

  useEffect(() => {
    async function loadSettings() {
      const storedApiKey = await SecureStore.getItemAsync(apiKeyStoreKey);
      const storedModel = await SecureStore.getItemAsync(modelStoreKey);

      if (storedApiKey) {
        setApiKey(storedApiKey);
        setDraftApiKey(storedApiKey);
      }

      if (storedModel) {
        setModel(storedModel);
        setDraftModel(storedModel);
      }
    }

    void loadSettings();
  }, []);

  async function saveSettings() {
    const nextApiKey = draftApiKey.trim();
    const nextModel = draftModel.trim() || defaultModel;

    if (!nextApiKey) {
      await SecureStore.deleteItemAsync(apiKeyStoreKey);
      setApiKey("");
      await SecureStore.setItemAsync(modelStoreKey, nextModel);
      setModel(nextModel);
      setDraftModel(nextModel);
      setSettingsVisible(false);
      return;
    }

    await SecureStore.setItemAsync(apiKeyStoreKey, nextApiKey);
    await SecureStore.setItemAsync(modelStoreKey, nextModel);
    setApiKey(nextApiKey);
    setModel(nextModel);
    setDraftModel(nextModel);
    setSettingsVisible(false);
  }

  async function generateQuestions() {
    if (!apiKey) {
      setDraftApiKey("");
      setDraftModel(model);
      setSettingsVisible(true);
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");

    try {
      const generatedQuestions = await requestGeneratedQuestions(apiKey, model);
      setQuestions(generatedQuestions);
      resetTraining(generatedQuestions);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "题目生成失败，请检查 API Key 和网络后重试。"
      );
    } finally {
      setIsGenerating(false);
    }
  }

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

  function resetTraining(nextQuestions = questions) {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setStartedAt(Date.now());
    setQuestions(nextQuestions);
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
              填入 API Key 后直接由大模型生成 10 道模拟真题，不经过后台。
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="打开设置"
            className="h-11 w-11 items-center justify-center rounded-full bg-glacier-soft"
            onPress={() => {
              setDraftApiKey(apiKey);
              setDraftModel(model);
              setSettingsVisible(true);
            }}
          >
            <Settings color={colors.primary} size={22} />
          </Pressable>
        </View>

        <View className="mt-5 flex-row gap-2.5">
          <MetricCard label="进度" value={`${answeredCount}/${questions.length}`} />
          <MetricCard label="正确" value={`${correctCount}`} />
          <MetricCard label="均时" value={`${averageSeconds}s`} />
        </View>

        <View className="mt-5 flex-row gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="生成新题"
            disabled={isGenerating}
            className={[
              "h-12 flex-1 flex-row items-center justify-center gap-2 rounded-2xl",
              isGenerating ? "bg-glacier-border" : "bg-glacier-primary"
            ].join(" ")}
            onPress={generateQuestions}
          >
            {isGenerating ? (
              <ActivityIndicator color={colors.card} />
            ) : (
              <Zap color={colors.card} size={18} />
            )}
            <Text className="text-base font-extrabold text-white">
              {isGenerating ? "正在生成" : "生成 10 题"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="重练本组"
            className="h-12 w-12 items-center justify-center rounded-2xl border border-glacier-border bg-glacier-card"
            onPress={() => resetTraining()}
          >
            <RotateCcw color={colors.textSecondary} size={20} />
          </Pressable>
        </View>

        {errorMessage ? (
          <View className="mt-4 rounded-2xl border border-glacier-error bg-glacier-card p-3">
            <Text className="text-sm leading-[22px] text-glacier-error">
              {errorMessage}
            </Text>
          </View>
        ) : null}

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

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isCompleted ? "本组完成" : "下一题"}
          disabled={!selectedAnswer || isCompleted}
          className={[
            "mt-5 h-12 items-center justify-center rounded-2xl",
            selectedAnswer && !isCompleted ? "bg-glacier-primary" : "bg-glacier-border"
          ].join(" ")}
          onPress={goNext}
        >
          <Text className="text-base font-extrabold text-white">
            {isCompleted ? "本组完成" : "下一题"}
          </Text>
        </Pressable>

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
              秒。目标是先稳定 80% 正确率，再把单题压到 45 秒内。
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={settingsVisible}
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/20">
          <View className="rounded-t-[28px] bg-glacier-card px-5 pb-8 pt-5">
            <View className="flex-row items-center gap-2">
              <KeyRound color={colors.primary} size={20} />
              <Text className="text-lg font-extrabold text-glacier-textPrimary">
                大模型设置
              </Text>
            </View>
            <Text className="mt-2 text-sm leading-[22px] text-glacier-textSecondary">
              API Key 仅保存在本机 SecureStore。前端会直接调用 DeepSeek API
              生成题目，不经过你的后台。
            </Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              placeholder="填写 DeepSeek API Key"
              placeholderTextColor={colors.textMuted}
              value={draftApiKey}
              className="mt-4 h-12 rounded-2xl border border-glacier-border bg-glacier-background px-4 text-base text-glacier-textPrimary"
              onChangeText={setDraftApiKey}
            />
            <Text className="mt-5 text-sm font-bold text-glacier-textPrimary">
              生成模型
            </Text>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {modelOptions.map((modelOption) => {
                const selected = draftModel.trim() === modelOption;

                return (
                  <Pressable
                    key={modelOption}
                    accessibilityRole="button"
                    accessibilityLabel={`选择模型 ${modelOption}`}
                    className={[
                      "rounded-full border px-3 py-2",
                      selected
                        ? "border-glacier-primary bg-glacier-soft"
                        : "border-glacier-border bg-glacier-card"
                    ].join(" ")}
                    onPress={() => setDraftModel(modelOption)}
                  >
                    <Text
                      className={[
                        "text-sm font-bold",
                        selected ? "text-glacier-primary" : "text-glacier-textSecondary"
                      ].join(" ")}
                    >
                      {modelOption}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="也可以填写自定义模型名"
              placeholderTextColor={colors.textMuted}
              value={draftModel}
              className="mt-3 h-12 rounded-2xl border border-glacier-border bg-glacier-background px-4 text-base text-glacier-textPrimary"
              onChangeText={setDraftModel}
            />
            <View className="mt-4 flex-row gap-3">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="取消设置"
                className="h-12 flex-1 items-center justify-center rounded-2xl border border-glacier-border bg-glacier-card"
                onPress={() => setSettingsVisible(false)}
              >
                <Text className="text-base font-bold text-glacier-textSecondary">
                  取消
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="保存大模型设置"
                className="h-12 flex-1 items-center justify-center rounded-2xl bg-glacier-primary"
                onPress={saveSettings}
              >
                <Text className="text-base font-extrabold text-white">保存</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

async function requestGeneratedQuestions(apiKey: string, model: string) {
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            '你是公务员考试资料分析命题专家。只生成严谨的基期比重题，数据要自洽，答案唯一。必须只输出合法 json，不要输出 markdown。JSON 格式示例：{"questions":[{"id":1,"tag":"工业增加值","material":"材料","question":"问题","options":[{"key":"A","value":"25.7%"},{"key":"B","value":"26.6%"},{"key":"C","value":"27.4%"},{"key":"D","value":"28.1%"}],"answer":"A","explanation":"解析"}]}'
        },
        {
          role: "user",
          content:
            "生成 10 道资料分析基期比重提速训练题，并以 json 返回。每题包含 tag、material、question、options、answer、explanation。题干要像真题材料，有现期总量、现期部分量、总量同比增速、部分同比增速。选项为百分数，四个选项接近但答案唯一。explanation 要给出基期比重公式：部分/总体 × (1+总体增速)/(1+部分增速)。"
        }
      ],
      response_format: { type: "json_object" },
      stream: false,
      max_tokens: 8192
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`题目生成失败：${response.status} ${errorText.slice(0, 120)}`);
  }

  const data = await response.json();
  const outputText = extractResponseText(data);
  const parsed = JSON.parse(outputText) as GeneratedQuestionsPayload;

  return normalizeQuestions(parsed.questions);
}

function extractResponseText(data: unknown) {
  const text = (
    data as {
      choices?: Array<{ message?: { content?: string } }>;
    }
  ).choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("大模型返回格式异常，未找到题目 JSON。");
  }

  return text;
}

function normalizeQuestions(questions: BaseWeightQuestion[]) {
  if (!Array.isArray(questions) || questions.length !== 10) {
    throw new Error("大模型没有返回 10 道题，请重试。");
  }

  return questions.map((question, index) => ({
    ...question,
    id: index + 1,
    options: question.options.map((option, optionIndex) => ({
      key: ["A", "B", "C", "D"][optionIndex] as OptionKey,
      value: option.value
    }))
  }));
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
