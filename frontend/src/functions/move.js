import { whitechessArray } from "../constants/chessConstants"
import { convertToFEN } from "./convertToFEN"

export function move (notation, from, to, playerColor, turn, check = false){
    // Move the piece using chess algebriac notation
    const pieces = document.getElementsByClassName("piece")
    const squares = document.getElementsByClassName("square")
    let movingPiece = null
    let fromi = null
    let fromj = null
    let toi = null
    let toj = null


    // Reset the Kings Background color
    if (check == "whiteKing"){
        const whiteKing = document.getElementById("k-w")
        whiteKing.style.backgroundColor = "red"
    }else if(check == "blackKing"){
        console.log("Check!")
        const blackKing = document.getElementById("k-b")
        blackKing.style.backgroundColor = "red"
    }else{
        const blackKing = document.getElementById("k-b")
        const whiteKing = document.getElementById("k-w")
        blackKing.style.backgroundColor = "transparent"
        whiteKing.style.backgroundColor = "transparent"
    }

    // Find the piece 
    for (const piece of pieces){
        if (piece.parentElement.getAttribute('data-notation') === from){
            movingPiece = piece
            fromi = parseInt(piece.parentElement.id[0])
            fromj = parseInt(piece.parentElement.id[1])
            break
        }
    }

    // Move the piece to the landing square
    for (const square of squares){
        if (square.getAttribute('data-notation') === to){
            // Update Visually
            while (square.firstChild){
                square.removeChild(square.firstChild)
            }
            square.appendChild(movingPiece)
            square.style.display = "flex";
            square.style.alignItems = "center";
            square.style.justifyContent = "center";
            movingPiece.style.position = "static";

            //Update Chess Array
            toi = parseInt(square.id[0])
            toj = parseInt(square.id[1])

            if (movingPiece.id[2] === "w"){
                if (playerColor == "white"){
                    whitechessArray[fromi][fromj] = "0"
                    whitechessArray[toi][toj] = movingPiece.id[0]
                }else{
                    whitechessArray[7-fromi][7-fromj] = "0"
                    whitechessArray[7-toi][7-toj] = movingPiece.id[0]
                }
            }else{
                if (playerColor === "black"){
                    whitechessArray[7-fromi][7-fromj] = "0"
                    whitechessArray[7-toi][7-toj] = movingPiece.id[0].toUpperCase()
                }else{
                    whitechessArray[fromi][fromj] = "0"
                    whitechessArray[toi][toj] = movingPiece.id[0].toUpperCase()
                }
            }
            break
        }
    }


    console.log(whitechessArray)
    convertToFEN(whitechessArray)

}

