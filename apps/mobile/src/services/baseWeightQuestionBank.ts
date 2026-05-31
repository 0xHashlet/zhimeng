import type {
  BaseWeightQuestion,
  DifficultyLevel,
  OptionKey,
  TrainingConfig,
  TrainingOption
} from "../types/training";

type QuestionTemplate = {
  currentPart: number;
  currentWhole: number;
  distractors: string[];
  partGrowth: number;
  partName: string;
  region: string;
  tag: string;
  unit: string;
  wholeGrowth: number;
  wholeName: string;
  year: number;
};

const answerCycle: OptionKey[] = ["A", "B", "C", "D", "B", "A", "D", "C"];

const optionStepMap: Record<DifficultyLevel, number> = {
  easy: 1.8,
  medium: 0.9,
  hard: 0.4
};

const templates: QuestionTemplate[] = [
  template(
    2023,
    "某市",
    "工业增加值",
    "规模以上工业增加值",
    2860,
    8.6,
    "高技术制造业增加值",
    760,
    12.1,
    ["装备制造业增加值为 1120 亿元，同比增长 10.4%。"]
  ),
  template(
    2023,
    "某省",
    "社会消费品",
    "社会消费品零售总额",
    15420,
    7.8,
    "网上零售额",
    3920,
    13.6,
    ["限额以上单位消费品零售额为 6210 亿元，同比增长 5.1%。"]
  ),
  template(
    2022,
    "某地区",
    "财政收入",
    "一般公共预算收入",
    1240,
    6.7,
    "税收收入",
    910,
    8.9,
    ["非税收入为 330 亿元，同比下降 4.8%。"]
  ),
  template(
    2023,
    "某市",
    "进出口",
    "货物进出口总额",
    4380,
    5.4,
    "机电产品出口额",
    1260,
    9.8,
    ["高新技术产品出口额为 820 亿元，同比增长 6.2%。"]
  ),
  template(
    2023,
    "某省",
    "固定资产投资",
    "固定资产投资额",
    18200,
    4.9,
    "制造业投资额",
    4860,
    12.5,
    ["基础设施投资额为 3920 亿元，同比增长 3.4%。"]
  ),
  template(
    2022,
    "某市",
    "服务业",
    "第三产业增加值",
    9200,
    6.1,
    "金融业增加值",
    1480,
    8.4,
    ["批发和零售业增加值为 1730 亿元，同比增长 5.2%。"]
  ),
  template(
    2023,
    "某省",
    "交通运输",
    "货运总量",
    188000,
    3.6,
    "铁路货运量",
    25400,
    6.8,
    ["公路货运量为 132000 万吨，同比增长 2.4%。"],
    "万吨"
  ),
  template(2023, "某市", "旅游", "旅游总收入", 2140, 18.5, "入境旅游收入", 286, 22.4, [
    "国内旅游收入为 1854 亿元，同比增长 17.9%。"
  ]),
  template(
    2022,
    "某地区",
    "软件业务",
    "软件业务收入",
    7600,
    11.2,
    "信息技术服务收入",
    4380,
    14.7,
    ["软件产品收入为 1890 亿元，同比增长 7.3%。"]
  ),
  template(
    2023,
    "某省",
    "居民收入",
    "居民人均可支配收入",
    48600,
    6.3,
    "工资性收入",
    27800,
    7.1,
    ["经营净收入为 6120 元，同比增长 4.8%。"],
    "元"
  ),
  template(
    2022,
    "某市",
    "能源生产",
    "规模以上工业发电量",
    3250,
    4.4,
    "新能源发电量",
    760,
    18.2,
    ["火电发电量为 1840 亿千瓦时，同比下降 1.6%。"],
    "亿千瓦时"
  ),
  template(
    2023,
    "某省",
    "农业",
    "农林牧渔业总产值",
    5380,
    5.9,
    "畜牧业产值",
    1460,
    3.8,
    ["种植业产值为 2860 亿元，同比增长 6.7%。"]
  ),
  template(
    2023,
    "某市",
    "医药制造",
    "规模以上医药工业营收",
    2180,
    9.6,
    "生物药品营收",
    540,
    15.3,
    ["化学药品制剂营收为 810 亿元，同比增长 6.1%。"]
  ),
  template(
    2022,
    "某地区",
    "教育经费",
    "教育经费总投入",
    1680,
    7.4,
    "义务教育经费",
    920,
    8.8,
    ["高等教育经费为 310 亿元，同比增长 5.6%。"]
  ),
  template(
    2023,
    "某省",
    "邮政快递",
    "邮政行业业务收入",
    1320,
    10.1,
    "快递业务收入",
    960,
    13.9,
    ["邮政寄递服务收入为 120 亿元，同比增长 4.2%。"]
  ),
  template(
    2023,
    "某市",
    "数字经济",
    "数字经济核心产业营收",
    6850,
    12.4,
    "电子信息制造业营收",
    2410,
    15.8,
    ["互联网服务营收为 1180 亿元，同比增长 10.7%。"]
  ),
  template(
    2022,
    "某省",
    "银行业",
    "金融机构贷款余额",
    48600,
    9.3,
    "制造业贷款余额",
    7820,
    16.4,
    ["房地产贷款余额为 6420 亿元，同比增长 2.1%。"]
  ),
  template(
    2023,
    "某地区",
    "保险",
    "原保险保费收入",
    2260,
    6.8,
    "健康险保费收入",
    520,
    11.9,
    ["财产险保费收入为 740 亿元，同比增长 5.6%。"]
  ),
  template(
    2023,
    "某市",
    "餐饮",
    "住宿和餐饮业营业额",
    1860,
    14.2,
    "餐饮业营业额",
    1480,
    16.7,
    ["住宿业营业额为 380 亿元，同比增长 5.3%。"]
  ),
  template(
    2022,
    "某省",
    "外资",
    "实际使用外资金额",
    920,
    4.7,
    "高技术产业实际使用外资",
    310,
    9.5,
    ["制造业实际使用外资为 260 亿元，同比增长 6.2%。"]
  ),
  template(
    2023,
    "某市",
    "环保投资",
    "生态环保投资额",
    1240,
    8.1,
    "水环境治理投资额",
    420,
    12.6,
    ["大气治理投资额为 260 亿元，同比增长 4.9%。"]
  ),
  template(
    2023,
    "某省",
    "文化产业",
    "规模以上文化企业营收",
    3560,
    7.9,
    "内容创作生产营收",
    860,
    11.2,
    ["文化装备生产营收为 540 亿元，同比增长 5.6%。"]
  ),
  template(
    2022,
    "某地区",
    "物流",
    "社会物流总额",
    84200,
    5.5,
    "工业品物流总额",
    61200,
    6.4,
    ["进口货物物流总额为 7200 亿元，同比增长 3.1%。"]
  ),
  template(
    2023,
    "某市",
    "房地产",
    "商品房销售额",
    3120,
    -2.6,
    "住宅销售额",
    2640,
    -1.1,
    ["办公楼销售额为 210 亿元，同比下降 8.4%。"]
  ),
  template(
    2023,
    "某省",
    "科技经费",
    "研究与试验发展经费",
    2850,
    10.6,
    "企业研发经费",
    2180,
    12.7,
    ["高校研发经费为 360 亿元，同比增长 6.8%。"]
  ),
  template(
    2022,
    "某市",
    "城镇就业",
    "城镇新增就业人数",
    78,
    3.2,
    "高校毕业生就业人数",
    22,
    6.7,
    ["失业人员再就业人数为 15 万人，同比增长 1.8%。"],
    "万人"
  ),
  template(
    2023,
    "某省",
    "卫生服务",
    "医疗卫生机构诊疗人次",
    46800,
    9.4,
    "基层医疗机构诊疗人次",
    19200,
    12.2,
    ["医院诊疗人次为 24600 万人次，同比增长 7.5%。"],
    "万人次"
  ),
  template(
    2023,
    "某地区",
    "水利建设",
    "水利建设投资额",
    1460,
    13.5,
    "防洪工程投资额",
    410,
    18.6,
    ["农田水利投资额为 360 亿元，同比增长 9.4%。"]
  ),
  template(
    2022,
    "某省",
    "新能源汽车",
    "汽车产量",
    420,
    8.8,
    "新能源汽车产量",
    96,
    28.5,
    ["乘用车产量为 280 万辆，同比增长 6.1%。"],
    "万辆"
  ),
  template(
    2023,
    "某市",
    "港口运输",
    "港口货物吞吐量",
    92000,
    4.6,
    "外贸货物吞吐量",
    35600,
    3.2,
    ["集装箱吞吐量为 1840 万标箱，同比增长 7.9%。"],
    "万吨"
  ),
  template(
    2023,
    "某省",
    "互联网",
    "互联网业务收入",
    5120,
    13.8,
    "云计算服务收入",
    1260,
    22.6,
    ["网络游戏收入为 940 亿元，同比增长 4.7%。"]
  ),
  template(
    2022,
    "某市",
    "批发零售",
    "批发和零售业销售额",
    12600,
    6.2,
    "限额以上零售业销售额",
    3280,
    8.5,
    ["批发业销售额为 9120 亿元，同比增长 5.4%。"]
  ),
  template(
    2023,
    "某地区",
    "粮食生产",
    "粮食总产量",
    2480,
    2.1,
    "小麦产量",
    720,
    3.8,
    ["玉米产量为 960 万吨，同比增长 1.6%。"],
    "万吨"
  ),
  template(
    2023,
    "某省",
    "海洋经济",
    "海洋生产总值",
    6840,
    6.9,
    "海洋装备制造业增加值",
    1120,
    11.4,
    ["滨海旅游业增加值为 1860 亿元，同比增长 5.2%。"]
  ),
  template(
    2022,
    "某市",
    "体育产业",
    "体育产业总规模",
    1180,
    8.3,
    "体育服务业规模",
    760,
    10.9,
    ["体育用品制造规模为 320 亿元，同比增长 4.1%。"]
  ),
  template(
    2023,
    "某省",
    "养老服务",
    "养老服务业收入",
    940,
    12.8,
    "社区养老服务收入",
    260,
    18.4,
    ["机构养老服务收入为 430 亿元，同比增长 9.6%。"]
  ),
  template(
    2023,
    "某市",
    "电商",
    "电子商务交易额",
    8600,
    9.7,
    "跨境电商交易额",
    1420,
    19.5,
    ["农村电商交易额为 980 亿元，同比增长 12.2%。"]
  ),
  template(
    2022,
    "某地区",
    "建筑业",
    "建筑业总产值",
    5680,
    5.8,
    "房屋建筑业产值",
    3260,
    4.2,
    ["土木工程建筑业产值为 1720 亿元，同比增长 8.6%。"]
  ),
  template(
    2023,
    "某省",
    "矿业",
    "规模以上采矿业营收",
    3940,
    -3.4,
    "煤炭开采营收",
    1860,
    -5.8,
    ["有色金属采选营收为 620 亿元，同比增长 2.7%。"]
  ),
  template(
    2023,
    "某市",
    "公共交通",
    "公共交通客运量",
    228000,
    15.6,
    "轨道交通客运量",
    126000,
    21.4,
    ["常规公交客运量为 89000 万人次，同比增长 8.5%。"],
    "万人次"
  ),
  template(
    2022,
    "某省",
    "家电生产",
    "家用电器产量",
    18200,
    4.9,
    "空调产量",
    4680,
    7.6,
    ["冰箱产量为 3120 万台，同比增长 2.8%。"],
    "万台"
  ),
  template(
    2023,
    "某地区",
    "林业",
    "林业总产值",
    1320,
    6.5,
    "经济林产品产值",
    410,
    9.7,
    ["木材加工产值为 520 亿元，同比增长 4.3%。"]
  ),
  template(
    2023,
    "某省",
    "水产品",
    "水产品总产量",
    860,
    3.7,
    "海水产品产量",
    520,
    5.9,
    ["淡水产品产量为 340 万吨，同比增长 0.6%。"],
    "万吨"
  ),
  template(
    2022,
    "某市",
    "通信",
    "电信业务收入",
    2860,
    18.6,
    "移动数据及互联网业务收入",
    960,
    27.4,
    ["固定互联网宽带接入用户为 420 万户，同比增长 6.2%。"]
  ),
  template(
    2023,
    "某省",
    "纺织",
    "规模以上纺织业营收",
    3240,
    2.9,
    "化纤制造业营收",
    940,
    6.8,
    ["服装制造业营收为 1120 亿元，同比下降 1.4%。"]
  ),
  template(
    2023,
    "某市",
    "食品制造",
    "规模以上食品工业营收",
    4120,
    7.2,
    "乳制品制造营收",
    860,
    9.6,
    ["饮料制造营收为 740 亿元，同比增长 5.1%。"]
  ),
  template(
    2022,
    "某地区",
    "会议展览",
    "会展业直接收入",
    520,
    16.4,
    "展览服务收入",
    310,
    20.5,
    ["会议服务收入为 140 亿元，同比增长 9.8%。"]
  ),
  template(
    2023,
    "某省",
    "半导体",
    "集成电路产业销售额",
    2260,
    18.2,
    "芯片设计销售额",
    760,
    25.6,
    ["封装测试销售额为 640 亿元，同比增长 11.3%。"]
  ),
  template(
    2023,
    "某市",
    "新材料",
    "新材料产业产值",
    3580,
    14.6,
    "先进高分子材料产值",
    920,
    19.8,
    ["特种金属材料产值为 780 亿元，同比增长 10.1%。"]
  ),
  template(
    2022,
    "某省",
    "人工智能",
    "人工智能核心产业规模",
    1680,
    21.5,
    "智能软件产业规模",
    620,
    28.4,
    ["智能硬件产业规模为 540 亿元，同比增长 17.2%。"]
  )
];

export function buildBaseWeightQuestions(config: TrainingConfig, count = 10) {
  const startIndex = Math.floor(Date.now() / 1000) % templates.length;

  return Array.from({ length: count }, (_, index) => {
    const templateItem = templates[(startIndex + index) % templates.length];
    const answer = answerCycle[(startIndex + index) % answerCycle.length];

    return buildQuestion(templateItem, config, index + 1, answer);
  });
}

function buildQuestion(
  questionTemplate: QuestionTemplate,
  config: TrainingConfig,
  id: number,
  answer: OptionKey
): BaseWeightQuestion {
  const correctValue =
    (questionTemplate.currentPart / questionTemplate.currentWhole) *
    ((1 + questionTemplate.wholeGrowth / 100) /
      (1 + questionTemplate.partGrowth / 100)) *
    100;

  return {
    id,
    tag: questionTemplate.tag,
    material: buildMaterial(questionTemplate, config.materialDifficulty),
    question: `${questionTemplate.year - 1} 年，${questionTemplate.region}${questionTemplate.partName}占${questionTemplate.wholeName}的比重约为多少？`,
    options: buildOptions(correctValue, config.optionDifficulty, answer),
    answer,
    explanation: `基期比重 = ${questionTemplate.currentPart}/${questionTemplate.currentWhole} × (1+${formatGrowth(questionTemplate.wholeGrowth)})/(1+${formatGrowth(questionTemplate.partGrowth)})，约为 ${correctValue.toFixed(1)}%。`
  };
}

function buildMaterial(
  questionTemplate: QuestionTemplate,
  difficulty: DifficultyLevel
) {
  const core = `${questionTemplate.year} 年，${questionTemplate.region}${questionTemplate.wholeName}为 ${formatNumber(questionTemplate.currentWhole, questionTemplate.unit)}，同比增长 ${formatGrowth(questionTemplate.wholeGrowth)}。其中，${questionTemplate.partName}为 ${formatNumber(questionTemplate.currentPart, questionTemplate.unit)}，同比增长 ${formatGrowth(questionTemplate.partGrowth)}。`;

  if (difficulty === "easy") {
    return core;
  }

  if (difficulty === "medium") {
    return `${core}${questionTemplate.distractors[0] ?? ""}`;
  }

  return [
    `${questionTemplate.year} 年，${questionTemplate.region}相关产业运行总体平稳，${questionTemplate.wholeName}为 ${formatNumber(questionTemplate.currentWhole, questionTemplate.unit)}，同比增长 ${formatGrowth(questionTemplate.wholeGrowth)}。`,
    `${questionTemplate.distractors.join("")}`,
    `同期，${questionTemplate.partName}为 ${formatNumber(questionTemplate.currentPart, questionTemplate.unit)}，同比增长 ${formatGrowth(questionTemplate.partGrowth)}，增速高于整体 ${Math.abs(questionTemplate.partGrowth - questionTemplate.wholeGrowth).toFixed(1)} 个百分点。`
  ].join("\n\n");
}

function buildOptions(
  correctValue: number,
  difficulty: DifficultyLevel,
  answer: OptionKey
): TrainingOption[] {
  const step = optionStepMap[difficulty];
  const offsetsByAnswer: Record<OptionKey, number[]> = {
    A: [0, step, step * 2, step * 3],
    B: [-step, 0, step, step * 2],
    C: [-step * 2, -step, 0, step],
    D: [-step * 3, -step * 2, -step, 0]
  };

  return offsetsByAnswer[answer].map((offset, index) => ({
    key: ["A", "B", "C", "D"][index] as OptionKey,
    value: `${Math.max(0.1, correctValue + offset).toFixed(1)}%`
  }));
}

function formatGrowth(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatNumber(value: number, unit: string) {
  return `${value.toLocaleString("zh-CN")} ${unit}`;
}

function template(
  year: number,
  region: string,
  tag: string,
  wholeName: string,
  currentWhole: number,
  wholeGrowth: number,
  partName: string,
  currentPart: number,
  partGrowth: number,
  distractors: string[],
  unit = "亿元"
): QuestionTemplate {
  return {
    year,
    region,
    tag,
    unit,
    wholeName,
    currentWhole,
    wholeGrowth,
    partName,
    currentPart,
    partGrowth,
    distractors
  };
}
