/*
 Simple two-player integration test against the local Socket.IO server.
 Steps:
 1) Connect Alice and Bob, emit find_game
 2) Wait for start_game on both; determine colors
 3) White plays e2-e4 (valid)
 4) Black attempts invalid move e2-e5 (should be rejected)
 5) Black plays e7-e5 (valid)
 6) Alice leaves game; Bob should receive userLeft
 */

const { io } = require("socket.io-client");

function waitForEvent(socket, event) {
  return new Promise((resolve) => {
    socket.once(event, (data) => resolve(data));
  });
}

function waitForEventWithTimeout(socket, event, ms) {
  return Promise.race([
    waitForEvent(socket, event),
    new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout waiting for ${event}`)), ms)),
  ]);
}

async function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  const serverUrl = process.env.SERVER_URL || "http://localhost:3001";

  const commonOpts = {
    transports: ["polling"],
    timeout: 10000,
    reconnectionAttempts: 3,
    reconnectionDelay: 250,
  };
  const alice = io(serverUrl, { ...commonOpts, forceNew: true });
  const bob = io(serverUrl, { ...commonOpts, forceNew: true });

  // Logging helpers
  alice.on("connect_error", (e) => console.error("Alice connect_error:", e.message));
  bob.on("connect_error", (e) => console.error("Bob connect_error:", e.message));
  alice.on("error", (e) => console.log("Alice error:", e));
  bob.on("error", (e) => console.log("Bob error:", e));
  alice.on("invalid_move", (e) => console.log("Alice invalid_move:", e));
  bob.on("invalid_move", (e) => console.log("Bob invalid_move:", e));
  alice.on("move", (e) => console.log("Alice saw move:", e));
  bob.on("move", (e) => console.log("Bob saw move:", e));
  alice.on("update_players", (e) => console.log("Alice update_players:", e));
  bob.on("update_players", (e) => console.log("Bob update_players:", e));
  alice.on("start_game", (e) => console.log("Alice start_game:", e));
  bob.on("start_game", (e) => console.log("Bob start_game:", e));
  alice.on("userLeft", (e) => console.log("Alice userLeft:", e));
  bob.on("userLeft", (e) => console.log("Bob userLeft:", e));
  alice.on("playerDisconnected", (e) => console.log("Alice playerDisconnected:", e));
  bob.on("playerDisconnected", (e) => console.log("Bob playerDisconnected:", e));
  alice.on("playerReconnected", (e) => console.log("Alice playerReconnected:", e));
  bob.on("playerReconnected", (e) => console.log("Bob playerReconnected:", e));

  // Connect with timeout
  try {
    await Promise.race([
      Promise.all([
        new Promise((res) => alice.on("connect", res)),
        new Promise((res) => bob.on("connect", res)),
      ]),
      new Promise((_, reject) => setTimeout(() => reject(new Error("connect timeout")), 4000)),
    ]);
  } catch (e) {
    console.error("Failed to connect both clients:", e.message);
    process.exit(1);
  }
  console.log("Both clients connected.");

  // Find game
  alice.emit("find_game", { email: "alice@example.com", name: "Alice" });
  bob.emit("find_game", { email: "bob@example.com", name: "Bob" });

  let startGameAlice, startGameBob;
  try {
    [startGameAlice, startGameBob] = await Promise.all([
      waitForEventWithTimeout(alice, "start_game", 4000),
      waitForEventWithTimeout(bob, "start_game", 4000),
    ]);
  } catch (err) {
    console.error("Timed out waiting for start_game:", err.message);
    alice.disconnect();
    bob.disconnect();
    process.exit(1);
  }
  console.log("start_game received on both.");

  const whiteSocket = startGameAlice.players[0] === alice.id ? alice : bob;
  const blackSocket = whiteSocket === alice ? bob : alice;
  console.log("White:", whiteSocket === alice ? "Alice" : "Bob");

  // 3) White plays e2-e4 (valid)
  whiteSocket.emit("move", { notation: "e2-e4" });
  await delay(250);

  // 4) Black attempts invalid move e2-e5 (should be rejected)
  // Notation attempts to move a white pawn while it's black's turn
  blackSocket.emit("move", { notation: "e2-e5" });
  await delay(250);

  // 5) Black plays e7-e5 (valid)
  blackSocket.emit("move", { notation: "e7-e5" });
  await delay(250);

  // 6) White leaves game
  const userLeftPromise = waitForEvent(blackSocket, "userLeft");
  whiteSocket.emit("leaveGame", { user: whiteSocket === alice ? "Alice" : "Bob", email: whiteSocket === alice ? "alice@example.com" : "bob@example.com" });
  const leftData = await userLeftPromise;
  console.log("Other player received userLeft:", leftData);

  // Cleanup
  alice.disconnect();
  bob.disconnect();
  console.log("Test complete.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});


