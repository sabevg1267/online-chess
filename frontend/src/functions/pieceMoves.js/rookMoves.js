import { whitechessArray } from "../../constants/chessConstants";
import { chessCoordinates } from "../../constants/chessConstants";

export function rookMoves(piece, id, loc){
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
    const deltas = [
        [1,0], [0,1], 
        [-1,0], [0,-1]
    ]
    if (id === "r-w"){
        for (const [dr, dc] of deltas){
            for (let i = 1; i <= 8; i++){
                const newRow = row + (dr*i)
                const newCol = col + (dc*i)

                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                    if (whitechessArray[newRow][newCol] === "0") {
                        possibleMoves.push(chessCoordinates[newRow][newCol]);
                    }else if (blackPieces.includes(whitechessArray[newRow][newCol])){
                        possibleMoves.push(chessCoordinates[newRow][newCol]);
                        break
                    }else{
                        break
                    }
                }
            }
        }
    }else{
        for (const [dr, dc] of deltas){
            for (let i = 1; i <= 8; i++){
                const newRow = 7- row + (dr*i)
                const newCol = 7 - col + (dc*i)

                if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                    if (whitechessArray[newRow][newCol] === "0" ) {
                        possibleMoves.push(chessCoordinates[newRow][newCol]);
                    }else if(whitePieces.includes(whitechessArray[newRow][newCol])){
                        possibleMoves.push(chessCoordinates[newRow][newCol]);
                        break
                    }else{
                        break
                    }
                }
            }
        }
    }
    return possibleMoves
}


