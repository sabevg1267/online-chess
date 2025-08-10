import { chessCoordinates, blackChessCoordinates } from "../constants/chessConstants";
import { setUp } from "../functions/setUp";
import { useEffect, useState } from "react";
import { dropPiece } from "../functions/dropPiece";
import { getLegalMoves } from "../functions/legalMoves";
import { socket } from "../functions/online";
import { move } from "../functions/move";

export function Board({ inGame, playerColor, turn, setTurn }) {
  const [squares, setSquares] = useState([]);

  // Renders board squares based on player's color perspective
  const renderSquares = () => {
    const coords = playerColor === "black" ? blackChessCoordinates : chessCoordinates;
    const squareElements = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        squareElements.push(
          <div
            className="square"
            id={`${i}${j}`}
            key={`${i}${j}`}
            data-notation={coords[i][j]}
            style={{
              backgroundColor: (i + j) % 2 === 0 ? "white" : "#E8988A",
              width: "80px",
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          ></div>
        );
      }
    }
    return squareElements;
  };

  // Update board layout when game starts or color changes
  useEffect(() => {
    const rendered = renderSquares();
    setSquares(rendered);

    // Clear old pieces before setting up new ones
    const oldPieces = document.querySelectorAll(".piece");
    oldPieces.forEach((p) => p.remove());

    // Wait for React to render squares before placing pieces
    setTimeout(() => {
      setUp(playerColor);
    }, 50);
  }, [inGame, playerColor]);

  // Update board movement for both users
  useEffect(() => {
    const handleMove = (data) => {
      // update board visually with received move
      move(data.notation, data.from, data.to, playerColor, turn, data.check)
      if (turn == "white"){
        setTurn("black")
      }else{
        setTurn("white")
      }
    };
    socket.on("move", handleMove);
    return () => {
      socket.off("move", handleMove); // Clean up on unmount
    };
  }, [playerColor, turn]); // empty dependency array

  // Set up drag-and-drop interactions
  useEffect(() => {
    // Wait a bit to ensure pieces exist
    const timeout = setTimeout(() => {
      const board = document.querySelector(".backBoard");
      const pieces = document.getElementsByClassName("piece");
      if (!board || pieces.length === 0) return;

      let isDragging = false;
      let currPiece = null;
      let oldSquare = null;
      let possibleMoves = [];

      const handleMouseMove = (event) => {
        if (isDragging && currPiece) {
          const boardRect = board.getBoundingClientRect();
          const offsetX = currPiece.offsetWidth / 2;
          const offsetY = currPiece.offsetHeight / 2;
          currPiece.style.left = event.clientX - boardRect.left - offsetX + "px";
          currPiece.style.top = event.clientY - boardRect.top - offsetY + "px";
        }
      };

      const handleMouseUp = (event) => {
        if (!currPiece) return;
        document.body.style.cursor = "auto";

        const boardRect = board.getBoundingClientRect();
        const offsetX = currPiece.offsetWidth / 2;
        const offsetY = currPiece.offsetHeight / 2;

        currPiece.style.left = event.clientX - boardRect.left - offsetX + "px";
        currPiece.style.top = event.clientY - boardRect.top - offsetY + "px";

        dropPiece(currPiece, event.clientX, event.clientY, possibleMoves, oldSquare, turn);
        isDragging = false;
        currPiece = null;
      };

      for (let piece of pieces) {
        piece.onmousedown = (event) => {
          if (!inGame) return;
          event.preventDefault();

          currPiece = event.target;
          possibleMoves = getLegalMoves(currPiece, currPiece.id, currPiece.parentElement.id);
          console.log(possibleMoves)
          oldSquare = currPiece.parentElement;

          isDragging = true;
          currPiece.style.position = "absolute";
          document.body.style.cursor = "grabbing";
        };
      }

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      // Cleanup
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }, 100); // Slight delay to ensure DOM is ready

    return () => clearTimeout(timeout);
  }, [squares, inGame, turn]);
  return (
    <div
      className="backBoard"
      style={{
        width: "640px",
        height: "640px",
        display: "grid",
        gridTemplateColumns: "repeat(8, 80px)",
        gridTemplateRows: "repeat(8, 80px)",
        border: "solid 3px",
        position: "relative",
      }}
    >
      {squares}
    </div>
  );
}
