import { whitechessArray } from "../constants/chessConstants";
import { getLegalMoves } from "./legalMoves";


export function checkmate(color){
    const pieces = document.getElementsByClassName('piece')
    // Is White Player Checkmating??
    if (color === "white"){

        const blackKing = document.getElementById("k-b")
        for (const piece of pieces){
            if (piece.id[2] === "b"){
                let modI = (7-parseInt(piece.parentElement.id[0])).toString()
                let modJ = (7-parseInt(piece.parentElement.id[1])).toString()
                const lms = getLegalMoves(piece, piece.id, modI+modJ)
                console.log(piece, lms)

                for (const m of lms){
                    const to = getSquare(m)
                    console.log(getRidOfCheck(piece, piece.id, from, to))
                }
            }
        }

    }else{
        //Is Black Player Checkmating
        const whiteKing = document.getElementById("k-w")
    }
}

function getSquare(notation){
    const squares = document.getElementsByClassName("square")
    for (const square of squares){
        if (square.getAttribute("data-notation")){
            return square
        }
    }
}