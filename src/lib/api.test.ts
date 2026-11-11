import { api, ApiError, clearToken, getErrorMessage, setToken, setUnauthorizedHandler } from "./api";

function mockFetch(status: number, body?: unknown) {
  const fn = jest.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    json: () => (body === undefined ? Promise.reject(new Error("no body")) : Promise.resolve(body)),
  });
  globalThis.fetch = fn as unknown as typeof fetch;
  return fn;
}

describe("api client", () => {
  afterEach(async () => {
    setUnauthorizedHandler(null);
    await clearToken();
  });

  it("sends the bearer token on authenticated requests", async () => {
    await setToken("abc");
    const fetchMock = mockFetch(200, { user: { id: "1", name: "A", email: "a@a.com", createdAt: "" } });

    await api.me();

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe("Bearer abc");
  });

  it("throws an ApiError carrying the server error code", async () => {
    mockFetch(409, { error: { code: "EMAIL_IN_USE", message: "Email is already registered" } });

    await expect(
      api.register({ name: "Ann", email: "ann@example.com", password: "password123" }),
    ).rejects.toMatchObject({ status: 409, code: "EMAIL_IN_USE" });
  });

  it("calls the unauthorized handler on 401 for authenticated requests", async () => {
    const handler = jest.fn();
    setUnauthorizedHandler(handler);
    await setToken("expired");
    mockFetch(401, { error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } });

    await expect(api.me()).rejects.toBeInstanceOf(ApiError);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("does not trigger the unauthorized handler when login fails", async () => {
    const handler = jest.fn();
    setUnauthorizedHandler(handler);
    mockFetch(401, { error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } });

    await expect(api.login({ email: "a@a.com", password: "wrong" })).rejects.toBeInstanceOf(ApiError);
    expect(handler).not.toHaveBeenCalled();
  });

  it("maps network failures to a NETWORK_ERROR", async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new TypeError("fetch failed")) as unknown as typeof fetch;

    await expect(api.me()).rejects.toMatchObject({ code: "NETWORK_ERROR" });
  });

  it("shows the first validation message from the API", () => {
    const error = new ApiError(400, "VALIDATION_ERROR", "Invalid request data", {
      email: ["Invalid email"],
    });

    expect(getErrorMessage(error)).toBe("email: Invalid email");
  });
});
