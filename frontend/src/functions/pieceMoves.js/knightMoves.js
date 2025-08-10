import { whitechessArray } from "../../constants/chessConstants";
import { chessCoordinates } from "../../constants/chessConstants";

export function knightMoves(piece, id, loc){
    // piece: dom of specific piece 
    // id: 'k-w' or 'k-b'
    // loc: current piece location in algrebiac chess notation - "61"
    const squares = document.getElementsByClassName("square")
    const row = parseInt(loc[0])
    const col = parseInt(loc[1])
    const whitePieces = ["p", "r", "k", "n", "q", "b"]
    const blackPieces = ["P", "R", "K", "N", "Q", "B"]
    //returns array of possible notation
    let possibleMoves = []
    const deltas = [
        [-2,-1], [-2,1], 
        [-1,-2], [-1,2],
        [1,-2], [1,2],
        [2,-1], [2,1]
    ]
    if (piece.id[2] === "w"){
        for (const[dr, dc] of deltas){
            const newRow = row + dr;
            const newCol = col + dc;
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                if (whitechessArray[newRow][newCol] === "0"|| blackPieces.includes(whitechessArray[newRow][newCol])) {
                    possibleMoves.push(chessCoordinates[newRow][newCol]);
                }
            }
        }
    }else{
        for (const[dr, dc] of deltas){
            const newRow = 7- row + dr;
            const newCol = 7- col + dc;
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                if (whitechessArray[newRow][newCol] === "0" || whitePieces.includes(whitechessArray[newRow][newCol])) {
                    possibleMoves.push(chessCoordinates[newRow][newCol]);
                }
            }
        }
    }
    
    return possibleMoves
}