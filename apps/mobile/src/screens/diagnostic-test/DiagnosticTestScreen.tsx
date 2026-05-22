import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="返回上一页"
            style={styles.iconButton}
          >
            <ChevronLeft color={colors.text} size={24} />
          </Pressable>
          <Text style={styles.progressText}>3 / 10</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="收藏本题"
            style={styles.iconButton}
          >
            <Bookmark color={colors.text} size={22} />
          </Pressable>
        </View>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          contentContainerStyle={styles.pagerContent}
        >
          {questions.map((item) => (
            <ScrollView
              key={item.id}
              showsVerticalScrollIndicator={false}
              style={styles.questionPage}
              contentContainerStyle={styles.questionContent}
            >
              <View style={styles.typePill}>
                <Text style={styles.typeText}>{item.type}</Text>
              </View>

              <View style={styles.materialCard}>
                {item.material.map((paragraph) => (
                  <Text key={paragraph} style={styles.materialText}>
                    {paragraph}
                  </Text>
                ))}
              </View>

              <View style={styles.questionCard}>
                <Text style={styles.questionText}>{item.question}</Text>
              </View>

              <View style={styles.options}>
                {item.options.map((option) => {
                  const selected = option.key === item.selectedAnswer;

                  return (
                    <Pressable
                      key={option.key}
                      accessibilityRole="button"
                      accessibilityLabel={`选项 ${option.key}，${option.value}`}
                      accessibilityState={{ selected }}
                      style={[
                        styles.optionItem,
                        selected ? styles.optionSelected : null
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionKey,
                          selected ? styles.optionSelectedText : null
                        ]}
                      >
                        {option.key}
                      </Text>
                      <Text style={styles.optionValue}>{option.value}</Text>
                      {selected ? (
                        <View style={styles.selectedIcon}>
                          <Check
                            color={colors.card}
                            size={15}
                            strokeWidth={3}
                          />
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    flex: 1
  },
  topBar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44
  },
  progressText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700"
  },
  progressTrack: {
    height: 3,
    backgroundColor: colors.border
  },
  progressFill: {
    width: "30%",
    height: 3,
    backgroundColor: colors.primary
  },
  pagerContent: {
    alignItems: "stretch"
  },
  questionPage: {
    width: screenWidth
  },
  questionContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 14
  },
  typePill: {
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 30,
    paddingHorizontal: 12,
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: colors.cardSoft
  },
  typeText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800"
  },
  materialCard: {
    gap: 8,
    padding: 16,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  materialText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 24
  },
  questionCard: {
    paddingVertical: 4
  },
  questionText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 28
  },
  options: {
    gap: 12
  },
  optionItem: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.cyanSoft
  },
  optionKey: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  optionSelectedText: {
    color: colors.primary
  },
  optionValue: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: "500"
  },
  selectedIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary
  }
});
