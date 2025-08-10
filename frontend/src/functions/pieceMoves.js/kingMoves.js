import { whitechessArray } from "../../constants/chessConstants";
import { chessCoordinates } from "../../constants/chessConstants";


export function kingMoves(piece, id, loc){
    // piece: dom of specific piece 
    // id: 'k-w'
    // loc: current piece location in algrebiac chess notation - "61"
    const squares = document.getElementsByClassName("square")
    const row = parseInt(loc[0])
    const col = parseInt(loc[1])
    const whitePieces = ["p", "r", "k", "n", "q", "b"]
    const blackPieces = ["P", "R", "K", "N", "Q", "B"]
    //returns array of possible notation
    let possibleMoves = []
    const deltas = [
        [-1,-1], [0,1], 
        [1,0], [1,1],
        [-1,0], [0,-1],
        [1,-1], [-1,1]
    ]

    // Check all possible deltas
    if (id === "k-w"){
        for (const[dr,dc] of deltas){
            // New Hypothetical Location of Piece
            const newRow = row + dr
            const newCol = col + dc

            // check if cords are still  2d array bound
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                if (whitechessArray[newRow][newCol] === "0" || blackPieces.includes(whitechessArray[newRow][newCol])) {
                    possibleMoves.push(chessCoordinates[newRow][newCol]);
                }
            }
        }
    }else{
        for (const[dr,dc] of deltas){
            // New Hypothetical Location of Piece
            const newRow = 7- row + dr
            const newCol = 7- col + dc

            // check if cords are still  2d array bound
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                if (whitechessArray[newRow][newCol] === "0" || whitePieces.includes(whitechessArray[newRow][newCol])) {
                    possibleMoves.push(chessCoordinates[newRow][newCol]);
                }
            }
        }
    }
    
    
    // Check for Castle

    return possibleMoves
}