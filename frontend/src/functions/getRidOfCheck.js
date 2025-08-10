import { goingIntoCheck } from "./goingIntoCheck";

// Returns true if this move removes check on the mover's king
// i.e., after making the move, the mover's king is NOT still in check
export function getRidOfCheck(currPiece, id, from, to) {
  // goingIntoCheck returns true if the move leaves the mover's king in check
  // So we invert it: if not going into check, then it gets rid of (or avoids) check
  return !goingIntoCheck(currPiece, id, from, to);
}