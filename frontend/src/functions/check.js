import { whitechessArray } from "../constants/chessConstants"
import { getLegalMoves } from "./legalMoves"
import { goingIntoCheck } from "./goingIntoCheck"
import { checkmate } from "./checkmate"

export function check(currPiece, id, from, to, turn){

    const pieces = document.getElementsByClassName('piece')
    
    if (turn === "white"){
        const kingBlack = document.getElementById("k-b")
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
            if (piece.id[2] === "w"){
                let modI = (parseInt(piece.parentElement.id[0])).toString()
                let modJ = (parseInt(piece.parentElement.id[1])).toString()
                // Black Piece Possible Moves
                let bpms = getLegalMoves(piece, piece.id, modI + modJ)
                
                if (bpms.includes(kingBlack.parentElement.getAttribute("data-notation"))){
                    const isMate = checkmate("white")
                    console.log("Checkmate:", isMate)
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
        return false
    }else{
        const kingWhite = document.getElementById("k-w")
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
            if (piece.id[2] === "b"){
                let modI = (parseInt(piece.parentElement.id[0])).toString()
                let modJ = (parseInt(piece.parentElement.id[1])).toString()
                // Black Piece Possible Moves
                let bpms = getLegalMoves(piece, piece.id, modI + modJ)
                if (bpms.includes(kingWhite.parentElement.getAttribute("data-notation"))){
                    const isMate = checkmate("black")
                    console.log("Checkmate:", isMate)
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
    
}






