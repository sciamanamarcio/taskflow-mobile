import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { STATUSES, STATUS_LABELS, type TaskStatus } from "../lib/tasks-api";
import { colors } from "../theme";

interface Props {
  value: TaskStatus | undefined;
  onChange: (status: TaskStatus | undefined) => void;
}

const OPTIONS: { value: TaskStatus | undefined; label: string }[] = [
  { value: undefined, label: "All" },
  ...STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
];

export function StatusFilter({ value, onChange }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.label}
            accessibilityRole="button"
            accessibilityLabel={`Filter: ${option.label}`}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 14 },
  chipTextSelected: { color: colors.primaryText, fontWeight: "600" },
});
