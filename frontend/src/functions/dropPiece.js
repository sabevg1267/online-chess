import { whitechessArray } from "../constants/chessConstants";
import { checkForChecks } from "./checkForChecks";
import {notation} from "./notation.js"
import { getLegalMoves } from "./legalMoves.js";
import { socket } from "./online.js";
import { goingIntoCheck } from "./goingIntoCheck.js";
import { check } from "./check.js";

export function dropPiece(currPiece, x, y, pms, oldSquare, turn) {
    currPiece.style.visibility = "hidden";
    let landingSquare = document.elementFromPoint(x, y);
    let take = false
    let doubleh = false
    let doublev = false

    if (landingSquare.id[1] == "-"){
        landingSquare = landingSquare.parentElement
        take = true
    }
    currPiece.style.visibility = "visible";
    

    // check if the landingSquare exists, if it is square element, and if the squares notation is in the pms for that piece 
    if (landingSquare && landingSquare.classList.contains("square") 
        && pms.includes(landingSquare.getAttribute("data-notation")) 
        && turn[0] === currPiece.id[2]) {
        // Get Piece, From Location, To Location
        const pieaces = document.getElementsByClassName("piece")
        let toLocation = landingSquare.getAttribute("data-notation")
        let fromLocation = currPiece.parentElement.getAttribute("data-notation") 
        
        // Is Same Color King Under Attack w/ this move???
        let gic = goingIntoCheck(currPiece, currPiece.id, oldSquare, landingSquare)
        if (gic){
            // Return to previous parent square
            undoBoard(currPiece)
            return
        }

        // Check for Check/Checkmate
        let chk = check(currPiece, currPiece.id, oldSquare, landingSquare, turn)
        if (chk && turn == "white"){
            chk = "blackKing"
        }else if (chk && turn == "black"){
            chk = "whiteKing"
        }
        
        // Create Chess Move Notation
        for (const piece of pieaces){
            if (piece.id === currPiece.id && piece.parentElement.id !== currPiece.parentElement.id){
                let pms_piece = getLegalMoves(piece, piece.id, piece.parentElement.id)
                if (pms_piece.includes(landingSquare.getAttribute("data-notation"))){
                    if (piece.parentElement.getAttribute("data-notation")[0] != currPiece.parentElement.getAttribute('data-notation')[0]){
                        doubleh = true
                    }else {
                        doublev  = true
                    }
                    break
                }
            }
        }
        const chessNotation = notation(currPiece, landingSquare, take, doubleh, doublev)
    
        // Move the Piece for both players
        socket.emit("move", {notation: chessNotation, from: fromLocation, to: toLocation, 
                            check: chk})
    }else{
        // Return to previous parent square
        undoBoard(currPiece)
    }
}


function undoBoard(piece){
    console.log("Cannot go here!")
    piece.parentNode.appendChild(piece);
    piece.parentNode.style.display = "flex";
    piece.parentNode.style.alignItems = "center";
    piece.parentNode.style.justifyContent = "center";
    piece.style.position = "static";
}