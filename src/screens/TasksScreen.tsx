import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../auth/AuthContext";
import { StatusFilter } from "../components/StatusFilter";
import { TaskFormModal } from "../components/TaskFormModal";
import { TaskItem } from "../components/TaskItem";
import { getErrorMessage } from "../lib/api";
import type { Task, TaskInput, TaskStatus } from "../lib/tasks-api";
import { useCreateTask, useTasks, useUpdateTask } from "../lib/useTasks";
import { colors } from "../theme";

export function TasksScreen() {
  const { user, logout } = useAuth();
  const [status, setStatus] = useState<TaskStatus | undefined>(undefined);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const query = useTasks(status);
  const create = useCreateTask();
  const update = useUpdateTask();

  const tasks = query.data?.pages.flatMap((page) => page.data) ?? [];

  async function handleCreate(input: TaskInput) {
    await create.mutateAsync(input);
    setCreating(false);
  }

  async function handleUpdate(input: TaskInput) {
    if (!editing) return;
    await update.mutateAsync({ id: editing.id, input });
    setEditing(null);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Hello, {user?.name}</Text>
          <Text style={styles.title}>Your tasks</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Log out" onPress={logout}>
          <Text style={styles.logout}>Log out</Text>
        </Pressable>
      </View>

      <StatusFilter value={status} onChange={setStatus} />

      {query.isPending ? (
        <ActivityIndicator style={styles.center} color={colors.primary} />
      ) : query.isError ? (
        <View style={styles.center}>
          <Text accessibilityRole="alert" style={styles.error}>
            {getErrorMessage(query.error)}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry"
            onPress={() => {
              void query.refetch();
            }}
          >
            <Text style={styles.retry}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(task) => task.id}
          renderItem={({ item }) => <TaskItem task={item} onEdit={setEditing} />}
          contentContainerStyle={styles.list}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
          }}
          refreshControl={
            <RefreshControl
              refreshing={query.isRefetching && !query.isFetchingNextPage}
              onRefresh={() => {
                void query.refetch();
              }}
            />
          }
          ListEmptyComponent={<Text style={styles.empty}>No tasks yet.</Text>}
          ListFooterComponent={
            query.isFetchingNextPage ? <ActivityIndicator style={styles.footer} /> : undefined
          }
        />
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="New task"
        onPress={() => setCreating(true)}
        style={styles.fab}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      {creating && <TaskFormModal onSubmit={handleCreate} onClose={() => setCreating(false)} />}
      {editing && (
        <TaskFormModal
          key={editing.id}
          task={editing}
          onSubmit={handleUpdate}
          onClose={() => setEditing(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  hello: { fontSize: 13, color: colors.muted },
  title: { fontSize: 24, fontWeight: "700", color: colors.text },
  logout: { color: colors.primary, fontSize: 14 },
  list: { paddingBottom: 100 },
  center: { marginTop: 48, alignItems: "center", gap: 12 },
  error: { color: colors.danger, fontSize: 14 },
  retry: { color: colors.primary, fontWeight: "600" },
  empty: { textAlign: "center", marginTop: 48, color: colors.muted },
  footer: { marginVertical: 16 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    elevation: 4,
  },
  fabText: { color: colors.primaryText, fontSize: 30, lineHeight: 34 },
});
