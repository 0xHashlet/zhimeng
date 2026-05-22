import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";

export function DiagnosticReportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>提速诊断报告</Text>
      <Text style={styles.description}>诊断报告页</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.background
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700"
  },
  description: {
    marginTop: 8,
    color: colors.textMuted,
    fontSize: 15
  }
});
