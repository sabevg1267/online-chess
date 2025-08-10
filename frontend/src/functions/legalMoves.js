import { pawnMoves } from "./pieceMoves.js/pawnMove";
import { knightMoves } from "./pieceMoves.js/knightMoves";
import { bishopMoves } from "./pieceMoves.js/bishopMoves";
import { rookMoves } from "./pieceMoves.js/rookMoves";
import { queenMoves } from "./pieceMoves.js/queenMoves";
import { kingMoves } from "./pieceMoves.js/kingMoves";
// Main function to get legal moves
export function getLegalMoves(piece, id, loc) {
  switch (id) {
    case "p-w": return pawnMoves(piece, id, loc)
    case "n-w": return knightMoves(piece, id, loc)
    case "b-w": return bishopMoves(piece, id, loc)
    case "r-w": return rookMoves(piece, id, loc)
    case "q-w": return queenMoves(piece, id, loc)
    case "k-w": return kingMoves(piece, id, loc)
    case "k-b": return kingMoves(piece, id, loc)
    case "p-b": return pawnMoves(piece, id, loc)
    case "b-b": return bishopMoves(piece, id, loc)
    case "n-b": return knightMoves(piece, id, loc)
    case "r-b": return rookMoves(piece, id, loc)
    case "q-b": return queenMoves(piece, id, loc)
  
    default: return [];
  }
}