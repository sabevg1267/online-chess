import { whitechessArray } from "../../constants/chessConstants";
import { chessCoordinates } from "../../constants/chessConstants";
import { blackchessArray } from "../../constants/chessConstants";
import { blackChessCoordinates } from "../../constants/chessConstants";

// check legal moves of piece
export function pawnMoves(piece, id, loc){
    // piece: dom of specific piece 
    // id: 'p-w'
    // loc: current piece location in algrebiac chess notation - "61"
    const squares = document.getElementsByClassName("square")
    const row = parseInt(loc[0])
    const col = parseInt(loc[1])
    const whitePieces = ["p", "r", "k", "n", "q", "b"]
    const blackPieces = ["P", "R", "K", "N", "Q", "B"]
    //returns array of possible notation
    let possibleMoves = []

    // White Perspective
    if (id === "p-w"){ 
        if (loc[0] == "6"){
            // Can Move 2 Spaces 
            if (whitechessArray[row-1][col] === "0"){
                possibleMoves.push(chessCoordinates[row-1][col])
            }
            if (whitechessArray[row-2][col] === "0"){
                possibleMoves.push(chessCoordinates[row-2][col])
            }
            if (blackPieces.includes(whitechessArray[row-1][col-1])){
                possibleMoves.push(chessCoordinates[row-1][col-1])
            }
            if (blackPieces.includes(whitechessArray[row-1][col+1])){
                possibleMoves.push(chessCoordinates[row-1][col+1])
            }
        }else{
            // Can move 1 spaces
            if (whitechessArray[row-1][col] === "0"){
                possibleMoves.push(chessCoordinates[row-1][col])
            }
            if (blackPieces.includes(whitechessArray[row-1][col-1])){
                possibleMoves.push(chessCoordinates[row-1][col-1])
            }
            if (blackPieces.includes(whitechessArray[row-1][col+1])){
                possibleMoves.push(chessCoordinates[row-1][col+1])
            }
        }
    }else{
        if (loc[0] == "6"){
            // Can Move 2 Spaces 
            if (whitechessArray[7-row+1][7-col] === "0"){
                possibleMoves.push(chessCoordinates[7-row+1][7-col])
            }
            if (whitechessArray[7-row+2][7-col] === "0"){
                possibleMoves.push(chessCoordinates[7-row+2][7-col])
            }
            if (whitePieces.includes(whitechessArray[7-row+1][7-col+1])){
                possibleMoves.push(chessCoordinates[7-row+1][7-col+1])
            }
            if (whitePieces.includes(whitechessArray[7-row+1][7-col-1])){
                possibleMoves.push(chessCoordinates[7-row+1][7-col-1])
            }
        }else{
            // Can move 1 spaces
            // Can Move 2 Spaces 
            if (whitechessArray[7-row+1][7-col] === "0"){
                possibleMoves.push(chessCoordinates[7-row+1][7-col])
            }
            if (whitePieces.includes(whitechessArray[7-row+1][7-col+1])){
                possibleMoves.push(chessCoordinates[7-row+1][7-col+1])
            }
            if (whitePieces.includes(whitechessArray[7-row+1][7-col-1])){
                possibleMoves.push(chessCoordinates[7-row+1][7-col-1])
            }
        }
    }

    return possibleMoves
}