
export const whitechessArray = [
  ["R", "N", "B", "Q", "K", "B", "N", "R"],  // Black major pieces
  ["P", "P", "P", "P", "P", "P", "P", "P"],  // Black pawns
  ["0", "0", "0", "0", "0", "0", "0", "0"],  // Empty row
  ["0", "0", "0", "0", "0", "0", "0", "0"],  // Empty row
  ["0", "0", "0", "0", "0", "0", "0", "0"],  // Empty row
  ["0", "0", "0", "0", "0", "0", "0", "0"],  // Empty row
  ["p", "p", "p", "p", "p", "p", "p", "p"],  // White pawns
  ["r", "n", "b", "q", "k", "b", "n", "r"]   // White major pieces
];

export const blackchessArray = [
  ["r", "n", "b", "k", "q", "b", "n", "r"],  // White major pieces (top)
  ["p", "p", "p", "p", "p", "p", "p", "p"],  // White pawns
  ["0", "0", "0", "0", "0", "0", "0", "0"],  // Empty row
  ["0", "0", "0", "0", "0", "0", "0", "0"],  // Empty row
  ["0", "0", "0", "0", "0", "0", "0", "0"],  // Empty row
  ["0", "0", "0", "0", "0", "0", "0", "0"],  // Empty row
  ["P", "P", "P", "P", "P", "P", "P", "P"],  // Black pawns
  ["R", "N", "B", "K", "Q", "B", "N", "R"]   // Black major pieces (bottom)
];


export const chessCoordinates = [
  ["a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8"],
  ["a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7"],
  ["a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6"],
  ["a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5"],
  ["a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4"],
  ["a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3"],
  ["a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2"],
  ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"]
]

export const blackChessCoordinates = [
  ["h1", "g1", "f1", "e1", "d1", "c1", "b1", "a1"],
  ["h2", "g2", "f2", "e2", "d2", "c2", "b2", "a2"],
  ["h3", "g3", "f3", "e3", "d3", "c3", "b3", "a3"],
  ["h4", "g4", "f4", "e4", "d4", "c4", "b4", "a4"],
  ["h5", "g5", "f5", "e5", "d5", "c5", "b5", "a5"],
  ["h6", "g6", "f6", "e6", "d6", "c6", "b6", "a6"],
  ["h7", "g7", "f7", "e7", "d7", "c7", "b7", "a7"],
  ["h8", "g8", "f8", "e8", "d8", "c8", "b8", "a8"]
];



// Setup Chess Squares (White Perspective)
export let squares = [];
for (let i = 0; i < 8; i++) {
  for (let j = 0; j < 8; j++) {
      squares.push(
        <div 
            className="square"
            id = {`${i}${j}`}
            key = {`${i}${j}`}
            data-notation = {chessCoordinates[i][j]}
            style={{
            backgroundColor: (i + j) % 2 === 0 ? "white" : "#E8988A",
            width: "80px",
            height: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
            }}
        ></div>
      );
  }
}

