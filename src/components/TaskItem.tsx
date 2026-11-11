import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { getErrorMessage } from "../lib/api";
import { STATUS_LABELS, type Task } from "../lib/tasks-api";
import { useDeleteTask, useUpdateTask } from "../lib/useTasks";
import { colors } from "../theme";

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskItem({ task, onEdit }: Props) {
  const update = useUpdateTask();
  const remove = useDeleteTask();
  const done = task.status === "DONE";
  const actionError = update.error ?? remove.error;

  function confirmDelete() {
    Alert.alert("Delete task", `Delete "${task.title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => remove.mutate(task.id) },
    ]);
  }

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={`Mark ${task.title} as ${done ? "not done" : "done"}`}
        accessibilityState={{ checked: done, busy: update.isPending }}
        disabled={update.isPending}
        onPress={() => update.mutate({ id: task.id, input: { status: done ? "TODO" : "DONE" } })}
        style={[styles.checkbox, done && styles.checkboxDone]}
      >
        {done ? <Text style={styles.check}>✓</Text> : null}
      </Pressable>

      <View style={styles.body}>
        <Text style={[styles.title, done && styles.titleDone]}>{task.title}</Text>
        {task.description ? <Text style={styles.description}>{task.description}</Text> : null}
        <Text style={styles.status}>{STATUS_LABELS[task.status]}</Text>
        {actionError ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {getErrorMessage(actionError)}
          </Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Edit ${task.title}`}
          onPress={() => onEdit(task)}
          hitSlop={8}
        >
          <Text style={styles.action}>Edit</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Delete ${task.title}`}
          disabled={remove.isPending}
          onPress={confirmDelete}
          hitSlop={8}
        >
          <Text style={[styles.action, styles.danger]}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxDone: { backgroundColor: colors.success, borderColor: colors.success },
  check: { color: colors.primaryText, fontSize: 14, fontWeight: "700" },
  body: { flex: 1 },
  title: { fontSize: 16, fontWeight: "600", color: colors.text },
  titleDone: { textDecorationLine: "line-through", color: colors.muted },
  description: { marginTop: 2, fontSize: 14, color: colors.muted },
  status: { marginTop: 6, fontSize: 12, color: colors.muted },
  error: { marginTop: 6, fontSize: 13, color: colors.danger },
  actions: { alignItems: "flex-end", gap: 10 },
  action: { fontSize: 14, color: colors.primary },
  danger: { color: colors.danger },
});
