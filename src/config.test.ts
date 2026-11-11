import { resolveApiUrl } from "./config";

describe("resolveApiUrl", () => {
  it("prefers the EXPO_PUBLIC_API_URL value and trims the trailing slash", () => {
    expect(resolveApiUrl("https://api.example.com/", "192.168.0.10:8081")).toBe(
      "https://api.example.com",
    );
  });

  it("falls back to the Metro host on port 3333", () => {
    expect(resolveApiUrl(undefined, "192.168.0.10:8081")).toBe("http://192.168.0.10:3333");
  });

  it("falls back to localhost when nothing is known", () => {
    expect(resolveApiUrl(undefined, undefined)).toBe("http://localhost:3333");
  });
});
