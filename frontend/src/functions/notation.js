

export function notation(currPiece, newSquare, take = false, doubleh = false, doublev = false){
    // Pawns 
    if (currPiece.id[0] == "p" && !take){
        return newSquare.getAttribute("data-notation")
    }
    if (currPiece.id[0] == "p" && take && !doubleh){
        return "x"+newSquare.getAttribute("data-notation")
    }
    if (currPiece.id[0] == "p" && take && doubleh){
        return currPiece.parentElement.getAttribute("data-notation")[0] + "x" + newSquare.getAttribute("data-notation")
    }

    // Bisops
    if (currPiece.id[0] == "b" && !take){
        return "B"+newSquare.getAttribute("data-notation")
    }
    if (currPiece.id[0] == "b" && take){
        return "Bx" + newSquare.getAttribute("data-notation")
    }

    // Kings
    if (currPiece.id[0] == "k" && !take){
        return "K"+newSquare.getAttribute("data-notation")
    }
    if (currPiece.id[0] == "k" && take){
        return "Kx" + newSquare.getAttribute("data-notation")
    }

    // Queen 
    if (currPiece.id[0] == "q" && !take){
        return "Q"+newSquare.getAttribute("data-notation")
    }
    if (currPiece.id[0] == "q" && take){
        return "Qx" + newSquare.getAttribute("data-notation")
    }
    
    // Rook
    if (currPiece.id[0] == "r" && !take && !doubleh && !doublev){
        return "R"+newSquare.getAttribute("data-notation")
    }
    if (currPiece.id[0] == "r" && take){
        return "Rx" + newSquare.getAttribute("data-notation")
    }
    if (currPiece.id[0] == "r" && !take && doubleh){
        return "R"+currPiece.parentElement.getAttribute("data-notation")[0] + newSquare.getAttribute("data-notation")
    } 
    if (currPiece.id[0] == "r" && !take && doublev){
        return "R"+currPiece.parentElement.getAttribute("data-notation")[1] + newSquare.getAttribute("data-notation")
    } 

    // Knight
    if (currPiece.id[0] == "n" && !take && !doubleh && !doublev){
        return "N"+newSquare.getAttribute("data-notation")
    }
    if (currPiece.id[0] == "n" && take){
        return "Nx" + newSquare.getAttribute("data-notation")
    }
    if (currPiece.id[0] == "n" && !take && doubleh){
        return "N"+currPiece.parentElement.getAttribute("data-notation")[0] + newSquare.getAttribute("data-notation")
    } 
    if (currPiece.id[0] == "n" && !take && doublev){
        return "N"+currPiece.parentElement.getAttribute("data-notation")[1] + newSquare.getAttribute("data-notation")
    } 
}



