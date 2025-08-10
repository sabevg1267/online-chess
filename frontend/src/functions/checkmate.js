import { getLegalMoves } from "./legalMoves";
import { getRidOfCheck } from "./getRidOfCheck";


export function checkmate(color){
    const pieces = document.getElementsByClassName('piece')
    // Is White Player Checkmating??
    if (color === "white"){

        for (const piece of pieces){
            if (piece.id[2] === "b"){
                let modI = (7-parseInt(piece.parentElement.id[0])).toString()
                let modJ = (7-parseInt(piece.parentElement.id[1])).toString()
                const lms = getLegalMoves(piece, piece.id, modI+modJ)
                console.log(piece, lms)

                for (const m of lms){
                    const from = piece.parentElement
                    const to = getSquare(m)
                    if (to) {
                        console.log(getRidOfCheck(piece, piece.id, from, to))
                    }
                }
            }
        }

    }else{
        //Is Black Player Checkmating
        // TODO: implement black checkmating logic when needed
    }
}

function getSquare(notation){
    const squares = document.getElementsByClassName("square")
    for (const square of squares){
        if (square.getAttribute("data-notation") === notation){
            return square
        }
    }
}