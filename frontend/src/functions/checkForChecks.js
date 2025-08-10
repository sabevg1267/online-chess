import { chessCoordinates, whitechessArray } from "../constants/chessConstants";


// checks if any of the kings are in check
export function checkForChecks(color){

    if (color === "white"){
        const pieces = document.getElementsByClassName("piece")
        // dom 
        let whiteKing = null
        // algebraic notation location 
        let whiteKingLoc = null

        // get king piece from array :0
        // get king algebriac locaiton 
        for(let i = 0; i < 8; i++){
            for (let j = 0; j < 8; j++){
                if (whitechessArray[i][j] === "k"){
                    whiteKingLoc = chessCoordinates[i][j]
                    break
                }
            }
        }
        // get black pieces potential moves
        for (const piece of pieces){
            if ((piece.id)[2] === "b"){

            }
        }
    
    
    }


}