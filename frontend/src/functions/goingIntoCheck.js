import { whitechessArray } from "../constants/chessConstants";
import { getLegalMoves } from "./legalMoves";

export function goingIntoCheck(currPiece, id, from, to, cm = ""){
    // currPiece: DOM of curr piece
    // id: piece id (p-w)
    // from: DOM sqaure
    // to: DOM Square

    let takenSquare = null
    const whiteKing = document.getElementById("k-w")
    const blackKing = document.getElementById("k-b")
    const pieces = document.getElementsByClassName("piece")

    if (id[2] === "w"){
        // Check IF White King is in Check from Move

        //Update Chess Array/ Board
        let tempPiece = null
        whitechessArray[parseInt(from.id[0])][parseInt(from.id[1])] = "0"
        whitechessArray[parseInt(to.id[0])][parseInt(to.id[1])] = id[0]
        from.removeChild(from.firstChild)
        if (to.firstChild){
            tempPiece = to.firstChild
            to.removeChild(to.firstChild)
        }
        to.appendChild(currPiece)
        for (const piece of pieces){
            if (piece.id[2] === "b"){
                let modI = (7-parseInt(piece.parentElement.id[0])).toString()
                let modJ = (7-parseInt(piece.parentElement.id[1])).toString()
                // Black Piece Possible Moves
                let bpms = getLegalMoves(piece, piece.id, modI + modJ)
                
                if (bpms.includes(whiteKing.parentElement.getAttribute("data-notation"))){
                    whitechessArray[parseInt(from.id[0])][parseInt(from.id[1])] = id[0]
                    whitechessArray[parseInt(to.id[0])][parseInt(to.id[1])] = "0"
                    to.removeChild(to.firstChild)
                    if (tempPiece){
                        to.appendChild(tempPiece)
                        to.style.display = "flex";
                        to.style.alignItems = "center";
                        to.style.justifyContent = "center";
                        tempPiece.style.position = "static";
                    }
                    from.appendChild(currPiece)
                    return true
                }
            }
        }

        whitechessArray[parseInt(from.id[0])][parseInt(from.id[1])] = id[0]
        whitechessArray[parseInt(to.id[0])][parseInt(to.id[1])] = "0"
        to.removeChild(to.firstChild)
        if (tempPiece){
            to.appendChild(tempPiece)
            to.style.display = "flex";
            to.style.alignItems = "center";
            to.style.justifyContent = "center";
            tempPiece.style.position = "static";
        }
        from.appendChild(currPiece)
    }else{
        // Check IF Black King is in Check from Move

        //Update Chess Array/ Board
        let tempPiece = null
        whitechessArray[7-parseInt(from.id[0])][7-parseInt(from.id[1])] = "0"
        whitechessArray[7-parseInt(to.id[0])][7-parseInt(to.id[1])] = id[0]
        from.removeChild(from.firstChild)
        if (to.firstChild){
            tempPiece = to.firstChild
            to.removeChild(to.firstChild)
        }
        to.appendChild(currPiece)
        for (const piece of pieces){
            if (piece.id[2] === "w"){
                let modI = (7-parseInt(piece.parentElement.id[0])).toString()
                let modJ = (7-parseInt(piece.parentElement.id[1])).toString()
                // Black Piece Possible Moves
                let wpms = getLegalMoves(piece, piece.id, modI + modJ)
                
                if (wpms.includes(blackKing.parentElement.getAttribute("data-notation"))){
                    whitechessArray[7-parseInt(from.id[0])][7-parseInt(from.id[1])] = id[0]
                    whitechessArray[7-parseInt(to.id[0])][7-parseInt(to.id[1])] = "0"
                    to.removeChild(to.firstChild)
                    if (tempPiece){
                        to.appendChild(tempPiece)
                        to.style.display = "flex";
                        to.style.alignItems = "center";
                        to.style.justifyContent = "center";
                        tempPiece.style.position = "static";
                    }
                    from.appendChild(currPiece)
                    return true
                }
            }
        }

        whitechessArray[7-parseInt(from.id[0])][7-parseInt(from.id[1])] = id[0]
        whitechessArray[7-parseInt(to.id[0])][7-parseInt(to.id[1])] = "0"
        to.removeChild(to.firstChild)
        if (tempPiece){
            to.appendChild(tempPiece)
            to.style.display = "flex";
            to.style.alignItems = "center";
            to.style.justifyContent = "center";
            tempPiece.style.position = "static";
        }
        from.appendChild(currPiece)
        return false
    }


    
    return false

}

