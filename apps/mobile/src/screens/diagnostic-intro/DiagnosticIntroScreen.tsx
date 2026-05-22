import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";

export function DiagnosticIntroScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>10 题诊断测试</Text>
      <Text style={styles.description}>诊断测试说明页</Text>
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
