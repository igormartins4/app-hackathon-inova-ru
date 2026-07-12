import { ActivityIndicator, Text, View } from "react-native";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
  message?: string;
}

export function LoadingSpinner({
  size = "large",
  color = "#2563eb",
  message,
}: LoadingSpinnerProps) {
  const label = message ? `Carregando: ${message}` : "Carregando";

  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="progressbar"
      className="flex-1 items-center justify-center gap-3 py-8"
    >
      <ActivityIndicator size={size} color={color} />
      {message ? <Text className="text-sm text-gray-500">{message}</Text> : null}
    </View>
  );
}
