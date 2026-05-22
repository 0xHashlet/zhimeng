import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bookmark, Check, ChevronLeft, Clock3 } from "lucide-react-native";
import { colors } from "../../theme/colors";

const options = [
  { key: "A", value: "185.5" },
  { key: "B", value: "201.0" },
  { key: "C", value: "225.5" },
  { key: "D", value: "246.6" }
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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.metaBar}>
            <Text style={styles.metaText}>题型：增长量</Text>
            <Text style={styles.metaText}>建议 75 秒</Text>
          </View>

          <View style={styles.timerRow}>
            <Clock3 color={colors.primary} size={22} />
            <Text style={styles.timerText}>00:42</Text>
          </View>

          <View style={styles.materialCard}>
            <Text style={styles.materialText}>
              2023 年，某市规模以上工业增加值为 2,860 亿元，比上年增长
              8.6%。其中，新兴型增加值为 2,410 亿元，比上年增长 9.3%。
            </Text>
            <Text style={styles.materialText}>
              2022 年，该市规模以上工业增加值为 2,635 亿元。
            </Text>
          </View>

          <View style={styles.questionCard}>
            <Text style={styles.questionText}>
              2023 年该市规模以上工业增加值比上年增加了多少亿元？
            </Text>
          </View>

          <View style={styles.options}>
            {options.map((option) => {
              const selected = option.key === "C";

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
                      <Check color={colors.surface} size={15} strokeWidth={3} />
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="提交答案"
            style={styles.submitButton}
          >
            <Text style={styles.submitButtonText}>提交答案</Text>
          </Pressable>
        </View>
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
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 14
  },
  metaBar: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#F1F5F9"
  },
  metaText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600"
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 2
  },
  timerText: {
    color: colors.primary,
    fontSize: 27,
    fontWeight: "700"
  },
  materialCard: {
    gap: 8,
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.surface,
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
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: "#F8FBFF"
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
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: colors.background
  },
  submitButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    borderRadius: 12,
    backgroundColor: colors.primary
  },
  submitButtonText: {
    color: colors.surface,
    fontSize: 17,
    fontWeight: "700"
  }
});
