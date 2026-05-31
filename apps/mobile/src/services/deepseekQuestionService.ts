import type {
  BaseWeightQuestion,
  DifficultyLevel,
  OptionKey,
  TrainingConfig
} from "../types/training";

type GeneratedQuestionsPayload = {
  questions: BaseWeightQuestion[];
};

const materialDifficultyText: Record<DifficultyLevel, string> = {
  easy: "题干直接给出现期总量、现期部分量、总量同比增速、部分同比增速，不加入明显干扰数据。",
  medium:
    "题干包含 1 到 2 个相关但不参与计算的干扰数据，例如其他行业、其他月份或其他收入项，核心数据仍能定位。",
  hard: "题干接近真题材料，包含多段文字和 3 个以上干扰数据，核心数据分散出现，但不得缺失。"
};

const optionDifficultyText: Record<DifficultyLevel, string> = {
  easy: "四个选项差距较大，正确答案与相邻选项至少相差 1.5 个百分点。",
  medium: "四个选项接近，正确答案与相邻选项约相差 0.8 到 1.5 个百分点。",
  hard: "四个选项非常接近，正确答案与相邻选项约相差 0.3 到 0.8 个百分点。"
};

export async function requestGeneratedQuestions(
  apiKey: string,
  model: string,
  config: TrainingConfig
) {
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
          content: [
            "生成 10 道资料分析基期比重提速训练题，并以 json 返回。",
            "每题包含 tag、material、question、options、answer、explanation。",
            "题型固定为基期比重：基期部分量占基期总体量的比重。",
            `题干难度：${materialDifficultyText[config.materialDifficulty]}`,
            `选项难度：${optionDifficultyText[config.optionDifficulty]}`,
            "题干必须像真题材料，有现期总量、现期部分量、总量同比增速、部分同比增速。",
            "选项必须为百分数，四个选项接近但答案唯一。",
            "explanation 要给出基期比重公式：部分/总体 × (1+总体增速)/(1+部分增速)。"
          ].join("\n")
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
