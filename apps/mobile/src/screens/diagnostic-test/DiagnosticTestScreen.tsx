import { Dimensions, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bookmark, Check, ChevronLeft } from "lucide-react-native";
import { colors } from "../../theme/colors";

const screenWidth = Dimensions.get("window").width;

const questions = [
  {
    id: 1,
    type: "增长量",
    selectedAnswer: "C",
    material: [
      "2023 年，某市规模以上工业增加值为 2,860 亿元，比上年增长 8.6%。其中，新兴型增加值为 2,410 亿元，比上年增长 9.3%。",
      "2022 年，该市规模以上工业增加值为 2,635 亿元。"
    ],
    question: "2023 年该市规模以上工业增加值比上年增加了多少亿元？",
    options: [
      { key: "A", value: "185.5" },
      { key: "B", value: "201.0" },
      { key: "C", value: "225.5" },
      { key: "D", value: "246.6" }
    ]
  },
  {
    id: 2,
    type: "比重",
    selectedAnswer: "B",
    material: [
      "2023 年，某地区一般公共预算收入 1,240 亿元，其中税收收入 910 亿元。",
      "同年，该地区非税收入同比下降 4.8%。"
    ],
    question: "2023 年该地区税收收入占一般公共预算收入的比重约为多少？",
    options: [
      { key: "A", value: "68.2%" },
      { key: "B", value: "73.4%" },
      { key: "C", value: "78.8%" },
      { key: "D", value: "82.1%" }
    ]
  },
  {
    id: 3,
    type: "平均数",
    selectedAnswer: "A",
    material: [
      "2023 年，某市完成快递业务量 18.6 亿件，同比增长 12.4%；快递业务收入 156.2 亿元。",
      "其中同城业务收入占比为 18.5%。"
    ],
    question: "2023 年该市平均每件快递业务收入约为多少元？",
    options: [
      { key: "A", value: "8.4" },
      { key: "B", value: "9.6" },
      { key: "C", value: "10.8" },
      { key: "D", value: "12.1" }
    ]
  }
] as const;

export function DiagnosticTestScreen() {
  return (
    <SafeAreaView className="flex-1 bg-glacier-background">
      <View className="flex-1">
        <View className="h-14 flex-row items-center justify-between px-3.5">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="返回上一页"
            className="h-11 w-11 items-center justify-center"
          >
            <ChevronLeft color={colors.textPrimary} size={24} />
          </Pressable>
          <Text className="text-lg font-bold text-glacier-textPrimary">3 / 10</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="收藏本题"
            className="h-11 w-11 items-center justify-center"
          >
            <Bookmark color={colors.textPrimary} size={22} />
          </Pressable>
        </View>
        <View className="h-[3px] bg-glacier-border">
          <View className="h-[3px] w-[30%] bg-glacier-primary" />
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          contentContainerClassName="items-stretch"
        >
          {questions.map((item) => (
            <ScrollView
              key={item.id}
              showsVerticalScrollIndicator={false}
              style={{ width: screenWidth }}
              contentContainerClassName="gap-3.5 px-5 pb-6"
            >
              <View className="mt-4 min-h-[30px] self-start rounded-full bg-glacier-cardSoft px-3">
                <Text className="py-1.5 text-[13px] font-extrabold text-glacier-primary">
                  {item.type}
                </Text>
              </View>

              <View className="gap-2 rounded-[22px] border border-glacier-border bg-glacier-card p-4">
                {item.material.map((paragraph) => (
                  <Text
                    key={paragraph}
                    className="text-sm leading-6 text-glacier-textPrimary"
                  >
                    {paragraph}
                  </Text>
                ))}
              </View>

              <View className="py-1">
                <Text className="text-lg font-bold leading-7 text-glacier-textPrimary">
                  {item.question}
                </Text>
              </View>

              <View className="gap-3">
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
              </View>
            </ScrollView>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
