import { whitechessArray } from "../constants/chessConstants";
import { blackchessArray } from "../constants/chessConstants";
import { blackChessCoordinates } from "../constants/chessConstants";

// Map of piece symbols to image file names
const pieceMap = {
    "K": "kb.svg",
    "k": "kw.svg",
    "Q": "qb.svg",
    "q": "qw.svg",
    "R": "rb.svg",
    "r": "rw.svg",
    "B": "bb.svg",
    "b": "bw.svg",
    "N": "nb.svg",
    "n": "nw.svg",
    "P": "pb.svg",
    "p": "pw.svg"
};

// Set Up Pieces on the Board
export function setUp(color = "white") {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let pieceSymbol = null
            // Chooses Perspective For Set Up
            if (color === "white"){
                pieceSymbol = whitechessArray[i][j];
            }else{
                pieceSymbol = blackchessArray[i][j]
            }
            
            if (pieceMap[pieceSymbol]) {
                const piece = document.createElement("img");
                const square = document.getElementById(`${i}${j}`);
                piece.className = "piece"
                piece.id = pieceColor(pieceSymbol)
                piece.key = pieceSymbol
                piece.src = `${process.env.PUBLIC_URL}/pieces/${pieceMap[pieceSymbol]}`;
                piece.style.width = "80px";
                piece.draggable = false;
                piece.style.height = "80px";
                piece.style.position = "static"; // Essential for moving it later
                square.appendChild(piece);
            }
        }
    }
}

function pieceColor(symbol) {
    const isWhite = symbol === symbol.toLowerCase(); // Lowercase symbols are white
    const color = isWhite ? "w" : "b";

    const pieceType = symbol.toLowerCase(); // Get type in lowercase for consistency

    // Map pieceType to readable names
    const typeMap = {
        k: "k",
        q: "q",
        r: "r",
        b: "b",
        n: "n",
        p: "p"
    };

    return `${typeMap[pieceType]}-${color}`;
}
