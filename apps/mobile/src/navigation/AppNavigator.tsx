import { DashboardScreen } from "../screens/dashboard/DashboardScreen";

export type RootStackParamList = {
  Dashboard: undefined;
};

export function AppNavigator() {
  return <DashboardScreen />;
}
