import {
  copyNightLink,
  forgetRoom,
  nightRequest,
  recentRooms,
  rememberRoom,
  roomSession,
} from "./movieNight";
const room = {
  code: "aabbccddee",
  name: "Weekend night",
  expiresAt: Date.now() + 60000,
};
beforeEach(() => localStorage.clear());
afterEach(() => {
  forgetRoom(room.code);
  jest.restoreAllMocks();
  delete global.fetch;
});
test("participant sessions persist separately from the library and expired rooms are omitted", () => {
  localStorage.setItem("eh-watchlist-v1", "keep");
  expect(rememberRoom(room, "participant-token")).toBe(true);
  expect(roomSession(room.code).token).toBe("participant-token");
  expect(
    recentRooms().some(
      (entry) => entry.code === room.code && entry.name === room.name,
    ),
  ).toBe(true);
  expect(localStorage.getItem("eh-watchlist-v1")).toBe("keep");
  forgetRoom(room.code);
  expect(roomSession(room.code)).toBe(null);
  rememberRoom({ ...room, expiresAt: 0 }, "expired");
  expect(roomSession(room.code)).toBe(null);
});
test("blocked storage retains the participant for this visit", () => {
  jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  expect(rememberRoom(room, "memory-token")).toBe(false);
  expect(roomSession(room.code).token).toBe("memory-token");
});
test("room API uses an authorization header and never puts participant tokens in invite URLs", async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({ phase: "voting" }) });
  await expect(
    nightRequest("/rooms/" + room.code, { token: "private-token" }),
  ).resolves.toEqual({ phase: "voting" });
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toBe("/api/movie-night/rooms/" + room.code);
  expect(url).not.toContain("private-token");
  expect(options.headers.Authorization).toBe("Bearer private-token");
  expect(options.cache).toBe("no-store");
});
test("API failures preserve useful messages and server status for reconnect handling", async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ error: "Seat removed" }),
    })
    .mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => {
        throw new Error("not JSON");
      },
    });
  await expect(nightRequest("/rooms/" + room.code)).rejects.toMatchObject({
    status: 403,
    message: "Seat removed",
  });
  await expect(nightRequest("/rooms/" + room.code)).rejects.toThrow(
    /rooms are offline/,
  );
});
test("manual copy fallback restores keyboard focus", async () => {
  const button = document.createElement("button");
  document.body.appendChild(button);
  button.focus();
  const original = document.execCommand;
  document.execCommand = jest.fn().mockReturnValue(true);
  expect(
    await copyNightLink("https://example.test/movie-night/" + room.code),
  ).toBe(true);
  expect(document.execCommand).toHaveBeenCalledWith("copy");
  expect(document.activeElement).toBe(button);
  button.remove();
  document.execCommand = original;
});
