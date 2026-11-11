import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { getErrorMessage } from "../lib/api";
import {
  STATUSES,
  STATUS_LABELS,
  type Task,
  type TaskInput,
  type TaskStatus,
} from "../lib/tasks-api";
import { colors } from "../theme";

interface Props {
  task?: Task;
  onSubmit: (input: TaskInput) => Promise<unknown>;
  onClose: () => void;
}

// Render this component only while the modal should be open: state starts fresh each time
export function TaskFormModal({ task, onSubmit, onClose }: Props) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "TODO");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSave() {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), status });
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.sheet}>
          <Text style={styles.heading}>{task ? "Edit task" : "New task"}</Text>

          <Text style={styles.label}>Title</Text>
          <TextInput
            accessibilityLabel="Title"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            maxLength={120}
            autoFocus
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            accessibilityLabel="Description"
            style={[styles.input, styles.multiline]}
            value={description}
            onChangeText={setDescription}
            maxLength={1000}
            multiline
          />

          <Text style={styles.label}>Status</Text>
          <View style={styles.statusRow}>
            {STATUSES.map((s) => (
              <Pressable
                key={s}
                accessibilityRole="button"
                accessibilityLabel={`Status: ${STATUS_LABELS[s]}`}
                accessibilityState={{ selected: s === status }}
                onPress={() => setStatus(s)}
                style={[styles.chip, s === status && styles.chipSelected]}
              >
                <Text style={[styles.chipText, s === status && styles.chipTextSelected]}>
                  {STATUS_LABELS[s]}
                </Text>
              </Pressable>
            ))}
          </View>

          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}

          <View style={styles.buttons}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              onPress={onClose}
              style={[styles.button, styles.buttonGhost]}
            >
              <Text style={styles.buttonGhostText}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save task"
              disabled={submitting}
              onPress={handleSave}
              style={[styles.button, styles.buttonPrimary, submitting && styles.disabled]}
            >
              <Text style={styles.buttonPrimaryText}>{submitting ? "Saving..." : "Save"}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    padding: 20,
    paddingBottom: 32,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: colors.surface,
  },
  heading: { fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: 8 },
  label: { marginTop: 12, marginBottom: 6, fontSize: 13, fontWeight: "600", color: colors.text },
  input: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    color: colors.text,
    fontSize: 16,
  },
  multiline: { minHeight: 80, textAlignVertical: "top" },
  statusRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 14 },
  chipTextSelected: { color: colors.primaryText, fontWeight: "600" },
  error: { marginTop: 12, color: colors.danger, fontSize: 14 },
  buttons: { flexDirection: "row", gap: 12, marginTop: 20 },
  button: { flex: 1, padding: 14, borderRadius: 10, alignItems: "center" },
  buttonGhost: { borderWidth: 1, borderColor: colors.border },
  buttonGhostText: { color: colors.text, fontWeight: "600" },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonPrimaryText: { color: colors.primaryText, fontWeight: "600" },
  disabled: { opacity: 0.6 },
});
