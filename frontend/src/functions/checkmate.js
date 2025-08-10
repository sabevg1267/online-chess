import { getLegalMoves } from "./legalMoves";
import { getRidOfCheck } from "./getRidOfCheck";


export function checkmate(color){
    const pieces = document.getElementsByClassName('piece')
    let escapeExists = false

    if (color === "white"){
        // White has delivered check on Black. Can Black escape?
        outer: for (const piece of pieces){
            if (piece.id[2] === "b"){
                const row = (7 - parseInt(piece.parentElement.id[0])).toString()
                const col = (7 - parseInt(piece.parentElement.id[1])).toString()
                const moves = getLegalMoves(piece, piece.id, row + col)
                for (const notation of moves){
                    const from = piece.parentElement
                    const to = getSquare(notation)
                    if (!to) continue
                    if (getRidOfCheck(piece, piece.id, from, to)){
                        escapeExists = true
                        break outer
                    }
                }
            }
        }

        if (!escapeExists){
            console.log("CHECKMATE - White wins")
            return true
        }
        return false
    }else{
        // Black has delivered check on White. Can White escape?
        outer2: for (const piece of pieces){
            if (piece.id[2] === "w"){
                const row = (parseInt(piece.parentElement.id[0])).toString()
                const col = (parseInt(piece.parentElement.id[1])).toString()
                const moves = getLegalMoves(piece, piece.id, row + col)
                for (const notation of moves){
                    const from = piece.parentElement
                    const to = getSquare(notation)
                    if (!to) continue
                    if (getRidOfCheck(piece, piece.id, from, to)){
                        escapeExists = true
                        break outer2
                    }
                }
            }
        }

        if (!escapeExists){
            console.log("CHECKMATE - Black wins")
            return true
        }
        return false
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