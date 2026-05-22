import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";

export function DiagnosticTestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>3 / 10</Text>
      <Text style={styles.description}>做题页</Text>
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
