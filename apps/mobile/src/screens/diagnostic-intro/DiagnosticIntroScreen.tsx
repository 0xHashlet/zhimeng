import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check, Clock3 } from "lucide-react-native";
import { colors } from "../../theme/colors";

const introItems = [
  "覆盖增长量、基期量、比重、平均数、综合分析",
  "记录每题用时",
  "做错后选择错因",
  "完成后生成提速报告"
] as const;

export function DiagnosticIntroScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>10 题诊断测试</Text>
          <Text style={styles.description}>通过 10 题诊断，精准定位提速关键</Text>
        </View>

        <View style={styles.card}>
          {introItems.map((item) => (
            <View key={item} style={styles.checkItem}>
              <View style={styles.checkIcon}>
                <Check color={colors.surface} size={16} strokeWidth={3} />
              </View>
              <Text style={styles.checkText}>{item}</Text>
            </View>
          ))}

          <View style={styles.estimate}>
            <Clock3 color={colors.textMuted} size={18} />
            <Text style={styles.estimateText}>预计耗时 12 分钟</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="开始测试"
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>开始测试</Text>
        </Pressable>
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
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 44,
    paddingBottom: 28
  },
  header: {
    alignItems: "center",
    marginBottom: 28
  },
  title: {
    color: colors.text,
    fontSize: 27,
    fontWeight: "800",
    lineHeight: 34,
    textAlign: "center"
  },
  description: {
    marginTop: 10,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center"
  },
  card: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#111827",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6
    },
    elevation: 2
  },
  checkItem: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  checkIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary
  },
  checkText: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24
  },
  estimate: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  estimateText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "500"
  },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 58,
    marginTop: 24,
    borderRadius: 12,
    backgroundColor: colors.primary
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: "700"
  }
});
