import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, userEvent, waitFor } from "@testing-library/react-native";
import { Alert, type AlertButton } from "react-native";
import type { Task } from "../lib/tasks-api";
import { TasksScreen } from "./TasksScreen";

const mockList = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockRemove = jest.fn();

jest.mock("../auth/AuthContext", () => ({
  useAuth: () => ({ user: { id: "u1", name: "Jane" }, logout: jest.fn() }),
}));

jest.mock("../lib/tasks-api", () => ({
  ...jest.requireActual("../lib/tasks-api"),
  tasksApi: {
    list: (...args: unknown[]) => mockList(...args),
    create: (...args: unknown[]) => mockCreate(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    remove: (...args: unknown[]) => mockRemove(...args),
  },
}));

const task: Task = {
  id: "t1",
  title: "Write tests",
  description: "Cover the main flows",
  status: "TODO",
  dueDate: null,
  userId: "u1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const pageOf = (tasks: Task[]) => ({
  data: tasks,
  meta: { page: 1, limit: 10, total: tasks.length, totalPages: tasks.length > 0 ? 1 : 0 },
});

async function renderScreen() {
  // gcTime: Infinity avoids leaving 5-minute garbage-collection timers open after the tests
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <TasksScreen />
    </QueryClientProvider>,
  );
}

describe("TasksScreen", () => {
  beforeEach(() => {
    mockList.mockReset().mockResolvedValue(pageOf([task]));
    mockCreate.mockReset();
    mockUpdate.mockReset();
    mockRemove.mockReset();
  });

  it("lists the tasks returned by the API", async () => {
    await renderScreen();

    expect(await screen.findByText("Write tests")).toBeOnTheScreen();
    expect(screen.getByText("Cover the main flows")).toBeOnTheScreen();
  });

  it("shows an empty state when there are no tasks", async () => {
    mockList.mockResolvedValue(pageOf([]));
    await renderScreen();

    expect(await screen.findByText("No tasks yet.")).toBeOnTheScreen();
  });

  it("shows an error with a retry button when loading fails", async () => {
    mockList.mockRejectedValueOnce(new Error("boom")).mockResolvedValue(pageOf([task]));
    const user = userEvent.setup();
    await renderScreen();

    expect(await screen.findByRole("alert")).toBeOnTheScreen();
    await user.press(screen.getByLabelText("Retry"));

    expect(await screen.findByText("Write tests")).toBeOnTheScreen();
  });

  it("creates a task from the modal", async () => {
    mockCreate.mockResolvedValue({ ...task, id: "t2", title: "Ship it" });
    const user = userEvent.setup();
    await renderScreen();
    await screen.findByText("Write tests");

    await user.press(screen.getByLabelText("New task"));
    await user.type(screen.getByLabelText("Title"), "Ship it");
    await user.press(screen.getByLabelText("Save task"));

    await waitFor(() =>
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ title: "Ship it" })),
    );
  });

  it("filters by status", async () => {
    const user = userEvent.setup();
    await renderScreen();
    await screen.findByText("Write tests");

    await user.press(screen.getByLabelText("Filter: Done"));

    await waitFor(() =>
      expect(mockList).toHaveBeenLastCalledWith({ status: "DONE", page: 1, limit: 10 }),
    );
  });

  it("marks a task as done", async () => {
    mockUpdate.mockResolvedValue({ ...task, status: "DONE" });
    const user = userEvent.setup();
    await renderScreen();
    await screen.findByText("Write tests");

    await user.press(screen.getByLabelText("Mark Write tests as done"));

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith("t1", { status: "DONE" }));
  });

  it("deletes a task after confirmation", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    mockRemove.mockResolvedValue(undefined);
    const user = userEvent.setup();
    await renderScreen();
    await screen.findByText("Write tests");

    await user.press(screen.getByLabelText("Delete Write tests"));

    const buttons = alertSpy.mock.calls[0][2] as AlertButton[];
    buttons.find((b) => b.style === "destructive")?.onPress?.();

    await waitFor(() => expect(mockRemove).toHaveBeenCalledWith("t1"));
    alertSpy.mockRestore();
  });
});
