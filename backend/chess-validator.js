// chess-validator.js
// Server-side chess move validation to prevent cheating

class ChessValidator {
    constructor() {
        this.reset();
    }

    reset() {
        // Initial board state (white pieces on bottom)
        this.board = this.getInitialBoard();
        this.currentTurn = 'white';
        this.castlingRights = {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
        this.enPassantTarget = null;
        this.halfMoveClock = 0;
        this.fullMoveNumber = 1;
        this.moveHistory = [];
    }

    getInitialBoard() {
        return [
            ['rb', 'nb', 'bb', 'qb', 'kb', 'bb', 'nb', 'rb'],
            ['pb', 'pb', 'pb', 'pb', 'pb', 'pb', 'pb', 'pb'],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            ['pw', 'pw', 'pw', 'pw', 'pw', 'pw', 'pw', 'pw'],
            ['rw', 'nw', 'bw', 'qw', 'kw', 'bw', 'nw', 'rw']
        ];
    }

    // Parse chess notation (e.g., "a2-a4" or "e7-e8=Q")
    parseMove(moveNotation) {
        const regex = /^([a-h])([1-8])-([a-h])([1-8])(?:=([QRBN]))?$/;
        const match = moveNotation.match(regex);
        
        if (!match) {
            return null;
        }

        return {
            from: {
                file: match[1].charCodeAt(0) - 'a'.charCodeAt(0),
                rank: 8 - parseInt(match[2])
            },
            to: {
                file: match[3].charCodeAt(0) - 'a'.charCodeAt(0),
                rank: 8 - parseInt(match[4])
            },
            promotion: match[5] ? match[5].toLowerCase() : null
        };
    }

    // Get piece at position
    getPiece(file, rank) {
        if (file < 0 || file > 7 || rank < 0 || rank > 7) {
            return null;
        }
        return this.board[rank][file];
    }

    // Get piece color
    getPieceColor(piece) {
        if (!piece) return null;
        return piece[1] === 'w' ? 'white' : 'black';
    }

    // Get piece type
    getPieceType(piece) {
        if (!piece) return null;
        return piece[0];
    }

    // Check if move is valid
    isValidMove(moveNotation) {
        const move = this.parseMove(moveNotation);
        if (!move) {
            return { valid: false, reason: 'Invalid move notation' };
        }

        const piece = this.getPiece(move.from.file, move.from.rank);
        if (!piece) {
            return { valid: false, reason: 'No piece at source position' };
        }

        const pieceColor = this.getPieceColor(piece);
        const pieceType = this.getPieceType(piece);

        // Check if it's the correct player's turn
        if (pieceColor !== this.currentTurn) {
            return { valid: false, reason: 'Not your turn' };
        }

        // Check if destination is occupied by own piece
        const destPiece = this.getPiece(move.to.file, move.to.rank);
        if (destPiece && this.getPieceColor(destPiece) === pieceColor) {
            return { valid: false, reason: 'Cannot capture your own piece' };
        }

        // Validate move based on piece type
        let validMove = false;
        switch (pieceType) {
            case 'p':
                validMove = this.isValidPawnMove(move, piece);
                break;
            case 'n':
                validMove = this.isValidKnightMove(move);
                break;
            case 'b':
                validMove = this.isValidBishopMove(move);
                break;
            case 'r':
                validMove = this.isValidRookMove(move);
                break;
            case 'q':
                validMove = this.isValidQueenMove(move);
                break;
            case 'k':
                validMove = this.isValidKingMove(move, piece);
                break;
        }

        if (!validMove) {
            return { valid: false, reason: 'Invalid move for this piece' };
        }

        // Check if move puts own king in check
        if (this.wouldBeInCheck(move, pieceColor)) {
            return { valid: false, reason: 'Move would leave king in check' };
        }

        return { valid: true };
    }

    // Validate pawn move
    isValidPawnMove(move, piece) {
        const color = this.getPieceColor(piece);
        const direction = color === 'white' ? -1 : 1;
        const startRank = color === 'white' ? 6 : 1;
        const promotionRank = color === 'white' ? 0 : 7;

        const fileDiff = Math.abs(move.to.file - move.from.file);
        const rankDiff = (move.to.rank - move.from.rank) * direction;

        // Moving forward
        if (fileDiff === 0) {
            const destPiece = this.getPiece(move.to.file, move.to.rank);
            if (destPiece) return false; // Can't capture forward

            if (rankDiff === 1) {
                return true;
            }
            if (rankDiff === 2 && move.from.rank === startRank) {
                // Check if path is clear
                const middleRank = move.from.rank + direction;
                return !this.getPiece(move.from.file, middleRank);
            }
            return false;
        }

        // Capturing diagonally
        if (fileDiff === 1 && rankDiff === 1) {
            const destPiece = this.getPiece(move.to.file, move.to.rank);
            if (destPiece && this.getPieceColor(destPiece) !== color) {
                return true;
            }
            // En passant
            if (this.enPassantTarget && 
                move.to.file === this.enPassantTarget.file && 
                move.to.rank === this.enPassantTarget.rank) {
                return true;
            }
        }

        return false;
    }

    // Validate knight move
    isValidKnightMove(move) {
        const fileDiff = Math.abs(move.to.file - move.from.file);
        const rankDiff = Math.abs(move.to.rank - move.from.rank);
        
        return (fileDiff === 2 && rankDiff === 1) || (fileDiff === 1 && rankDiff === 2);
    }

    // Validate bishop move
    isValidBishopMove(move) {
        const fileDiff = Math.abs(move.to.file - move.from.file);
        const rankDiff = Math.abs(move.to.rank - move.from.rank);
        
        if (fileDiff !== rankDiff) return false;
        
        return this.isPathClear(move.from, move.to);
    }

    // Validate rook move
    isValidRookMove(move) {
        const fileDiff = Math.abs(move.to.file - move.from.file);
        const rankDiff = Math.abs(move.to.rank - move.from.rank);
        
        if (fileDiff !== 0 && rankDiff !== 0) return false;
        
        return this.isPathClear(move.from, move.to);
    }

    // Validate queen move
    isValidQueenMove(move) {
        return this.isValidBishopMove(move) || this.isValidRookMove(move);
    }

    // Validate king move
    isValidKingMove(move, piece) {
        const fileDiff = Math.abs(move.to.file - move.from.file);
        const rankDiff = Math.abs(move.to.rank - move.from.rank);
        
        // Normal king move
        if (fileDiff <= 1 && rankDiff <= 1) {
            return true;
        }

        // Castling
        const color = this.getPieceColor(piece);
        if (rankDiff === 0 && fileDiff === 2) {
            return this.isValidCastling(move, color);
        }

        return false;
    }

    // Check if castling is valid
    isValidCastling(move, color) {
        const rank = color === 'white' ? 7 : 0;
        
        // Check if king hasn't moved
        if (!this.castlingRights[color].kingside && !this.castlingRights[color].queenside) {
            return false;
        }

        // Kingside castling
        if (move.to.file === 6) {
            if (!this.castlingRights[color].kingside) return false;
            // Check path is clear
            if (this.getPiece(5, rank) || this.getPiece(6, rank)) return false;
            // Check not castling through check
            if (this.isSquareAttacked(4, rank, color) || 
                this.isSquareAttacked(5, rank, color) || 
                this.isSquareAttacked(6, rank, color)) {
                return false;
            }
            return true;
        }

        // Queenside castling
        if (move.to.file === 2) {
            if (!this.castlingRights[color].queenside) return false;
            // Check path is clear
            if (this.getPiece(1, rank) || this.getPiece(2, rank) || this.getPiece(3, rank)) return false;
            // Check not castling through check
            if (this.isSquareAttacked(4, rank, color) || 
                this.isSquareAttacked(3, rank, color) || 
                this.isSquareAttacked(2, rank, color)) {
                return false;
            }
            return true;
        }

        return false;
    }

    // Check if path is clear for sliding pieces
    isPathClear(from, to) {
        const fileStep = Math.sign(to.file - from.file);
        const rankStep = Math.sign(to.rank - from.rank);
        
        let currentFile = from.file + fileStep;
        let currentRank = from.rank + rankStep;
        
        while (currentFile !== to.file || currentRank !== to.rank) {
            if (this.getPiece(currentFile, currentRank)) {
                return false;
            }
            currentFile += fileStep;
            currentRank += rankStep;
        }
        
        return true;
    }

    // Check if a square is attacked by the opponent
    isSquareAttacked(file, rank, byColor) {
        const opponentColor = byColor === 'white' ? 'black' : 'white';
        
        for (let r = 0; r < 8; r++) {
            for (let f = 0; f < 8; f++) {
                const piece = this.getPiece(f, r);
                if (piece && this.getPieceColor(piece) === opponentColor) {
                    const testMove = {
                        from: { file: f, rank: r },
                        to: { file, rank }
                    };
                    
                    const pieceType = this.getPieceType(piece);
                    let canAttack = false;
                    
                    switch (pieceType) {
                        case 'p':
                            const direction = opponentColor === 'white' ? -1 : 1;
                            const fileDiff = Math.abs(file - f);
                            const rankDiff = (rank - r) * direction;
                            canAttack = fileDiff === 1 && rankDiff === 1;
                            break;
                        case 'n':
                            canAttack = this.isValidKnightMove(testMove);
                            break;
                        case 'b':
                            canAttack = this.isValidBishopMove(testMove);
                            break;
                        case 'r':
                            canAttack = this.isValidRookMove(testMove);
                            break;
                        case 'q':
                            canAttack = this.isValidQueenMove(testMove);
                            break;
                        case 'k':
                            const fDiff = Math.abs(file - f);
                            const rDiff = Math.abs(rank - r);
                            canAttack = fDiff <= 1 && rDiff <= 1;
                            break;
                    }
                    
                    if (canAttack) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    // Check if move would put own king in check
    wouldBeInCheck(move, color) {
        // Make temporary move
        const piece = this.getPiece(move.from.file, move.from.rank);
        const capturedPiece = this.getPiece(move.to.file, move.to.rank);
        
        this.board[move.to.rank][move.to.file] = piece;
        this.board[move.from.rank][move.from.file] = null;
        
        // Find king
        let kingFile = -1, kingRank = -1;
        for (let r = 0; r < 8; r++) {
            for (let f = 0; f < 8; f++) {
                const p = this.getPiece(f, r);
                if (p && this.getPieceType(p) === 'k' && this.getPieceColor(p) === color) {
                    kingFile = f;
                    kingRank = r;
                    break;
                }
            }
            if (kingFile !== -1) break;
        }
        
        const inCheck = this.isSquareAttacked(kingFile, kingRank, color);
        
        // Undo temporary move
        this.board[move.from.rank][move.from.file] = piece;
        this.board[move.to.rank][move.to.file] = capturedPiece;
        
        return inCheck;
    }

    // Make a move on the board
    makeMove(moveNotation) {
        const validation = this.isValidMove(moveNotation);
        if (!validation.valid) {
            return validation;
        }

        const move = this.parseMove(moveNotation);
        const piece = this.getPiece(move.from.file, move.from.rank);
        const pieceType = this.getPieceType(piece);
        const pieceColor = this.getPieceColor(piece);
        const capturedPiece = this.getPiece(move.to.file, move.to.rank);

        // Update castling rights
        if (pieceType === 'k') {
            this.castlingRights[pieceColor].kingside = false;
            this.castlingRights[pieceColor].queenside = false;
        }
        if (pieceType === 'r') {
            if (move.from.file === 0) {
                this.castlingRights[pieceColor].queenside = false;
            }
            if (move.from.file === 7) {
                this.castlingRights[pieceColor].kingside = false;
            }
        }

        // Handle en passant
        this.enPassantTarget = null;
        if (pieceType === 'p' && Math.abs(move.to.rank - move.from.rank) === 2) {
            const direction = pieceColor === 'white' ? 1 : -1;
            this.enPassantTarget = {
                file: move.from.file,
                rank: move.from.rank + direction
            };
        }

        // Make the move
        this.board[move.to.rank][move.to.file] = piece;
        this.board[move.from.rank][move.from.file] = null;

        // Handle pawn promotion
        if (pieceType === 'p' && (move.to.rank === 0 || move.to.rank === 7)) {
            const promotionPiece = move.promotion || 'q';
            this.board[move.to.rank][move.to.file] = promotionPiece + pieceColor[0];
        }

        // Update turn
        this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';

        // Update move counters
        if (pieceType === 'p' || capturedPiece) {
            this.halfMoveClock = 0;
        } else {
            this.halfMoveClock++;
        }

        if (pieceColor === 'black') {
            this.fullMoveNumber++;
        }

        // Add to move history
        this.moveHistory.push({
            notation: moveNotation,
            piece,
            captured: capturedPiece,
            from: move.from,
            to: move.to
        });

        return { valid: true, move: moveNotation };
    }

    // Get current game state
    getGameState() {
        return {
            board: this.board,
            currentTurn: this.currentTurn,
            castlingRights: this.castlingRights,
            enPassantTarget: this.enPassantTarget,
            halfMoveClock: this.halfMoveClock,
            fullMoveNumber: this.fullMoveNumber,
            moveHistory: this.moveHistory
        };
    }

    // Load game state
    loadGameState(state) {
        this.board = state.board;
        this.currentTurn = state.currentTurn;
        this.castlingRights = state.castlingRights;
        this.enPassantTarget = state.enPassantTarget;
        this.halfMoveClock = state.halfMoveClock;
        this.fullMoveNumber = state.fullMoveNumber;
        this.moveHistory = state.moveHistory;
    }
}

module.exports = ChessValidator;
