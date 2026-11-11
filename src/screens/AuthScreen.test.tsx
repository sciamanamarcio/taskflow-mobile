import { render, screen, userEvent } from "@testing-library/react-native";
import { ApiError } from "../lib/api";
import { AuthScreen } from "./AuthScreen";

const mockLogin = jest.fn();
const mockRegister = jest.fn();

jest.mock("../auth/AuthContext", () => ({
  useAuth: () => ({
    login: (...args: unknown[]) => mockLogin(...args),
    register: (...args: unknown[]) => mockRegister(...args),
  }),
}));

describe("AuthScreen", () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockRegister.mockReset();
  });

  it("submits the typed credentials", async () => {
    mockLogin.mockResolvedValue(undefined);
    const user = userEvent.setup();
    await render(<AuthScreen />);

    await user.type(screen.getByLabelText("Email"), "  jane@example.com ");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.press(screen.getByLabelText("Sign in"));

    expect(mockLogin).toHaveBeenCalledWith("jane@example.com", "password123");
  });

  it("shows the API error message", async () => {
    mockLogin.mockRejectedValue(new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password"));
    const user = userEvent.setup();
    await render(<AuthScreen />);

    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong-password");
    await user.press(screen.getByLabelText("Sign in"));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password");
  });

  it("switches to registration and sends the name", async () => {
    mockRegister.mockResolvedValue(undefined);
    const user = userEvent.setup();
    await render(<AuthScreen />);

    await user.press(screen.getByLabelText("Go to create account"));
    await user.type(screen.getByLabelText("Name"), "Jane");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.press(screen.getByLabelText("Create account"));

    expect(mockRegister).toHaveBeenCalledWith("Jane", "jane@example.com", "password123");
  });
});
