import React, { useState } from 'react';
import './Chessboard.css';

const Chessboard =()=>{
    //Define the initial chessboard state
    const [board, setBoard] = useState([
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        ['','', '', '', '', '','', ''],
        ['','', '', '', '', '','', ''],
        ['','', '', '', '', '','', ''],
        ['','', '', '', '', '','', ''],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ]);
    const [selectedPiece, setSelectedPiece]=useState(null);
    const [destination, setDestination] = useState(null);
    const [currentPlayer, setCurrentPlayer] = useState('white');
    const [isCheck, setIsCheck] = useState(false);

    //Function to determine square color based on row and column index

    const getSquareColor = (rowIndex, colIndex) => {
        return (rowIndex + colIndex) %2 ===0 ? 'light-square' : 'dark-square';
    };



    //Function to handle moving a piece on the board
    const movePiece = (fromRow, fromCol, toRow, toCol) => {
        console.log('Moving Piece:', fromRow, fromCol, toRow, toCol);
        const newBoard = [...board];
        const piece = newBoard[fromRow][fromCol];
        newBoard[fromRow][fromCol] = '';
        newBoard[toRow][toCol] = piece;
        setBoard(newBoard);
        setSelectedPiece(null);
        setDestination({row: toRow, col: toCol});

        //Switch players
        setCurrentPlayer(currentPlayer==='white' ? 'black' : 'white');
    };

    //Function to check if a move is valid
    const isValidMove = (fromRow, fromCol, toRow, toCol) => {
        const piece = board[fromRow][fromCol];
        const targetPiece = board[toRow][toCol];
        console.log('Piece:', piece);
        console.log('Target Piece:', targetPiece);

        //Check if the target square is occupied by a friendly piece
        if (targetPiece && piece.toUpperCase() === targetPiece.toUpperCase()) {
            return false; //Invalid move: cannot capture friendly piece

        }

        switch (piece.toLowerCase()) {
            case 'p': // Pawn
                if (fromCol ===toCol) {
                    //Moving forward
                    if(targetPiece) {
                        return false; //Invalid move: cannot capture friendly piece

                    } else if (Math.abs(toRow - fromRow) > 2){
                        return false; //Invalid move: cannot move more than 2 squares

                    } else if (fromRow === 1 && toRow ===3 && !board[2][fromCol]){
                        return true; // valid move: first move for pawn
                    } else if (toRow - fromRow === 1){
                        return true; //valid move: normal forward move
                    }

                } else if (Math.abs(fromCol - toCol)===1 && toRow - fromRow ===1 && targetPiece){
                    return true; // valid move: capturing diagonally
                }
                break;
            case 'r': // Rook
                if (fromRow === toRow || fromCol === toCol){
                    if (isPathClear(fromRow, fromCol, toRow, toCol)){
                        return true; // valid move: moving horizontally or vertically

                    }
                }
                break;
            case 'n': //Knight
                if(
                    (Math.abs(fromRow-toRow)===2 && Math.abs(fromCol-toCol)===1) ||
                    (Math.abs(fromRow-toRow)===1  && Math.abs(fromCol-toCol)===2)
                ) {
                    return true; // valid move: L-shape move
                }
                break;
            case 'b': //Bishop
                if(Math.abs(fromRow-toRow) === Math.abs(fromCol-toCol)) {
                    if (isPathClear(fromRow, fromCol, toRow, toCol)) {
                        return true; // valid move:moving diagonally 
                    }
                }
                break;
            case 'q': //Queen
                if ((fromRow === toRow || fromCol === toCol)|| Math.abs(fromRow-toRow) ===Math.abs(fromCol-toCol)) {
                    if (isPathClear(fromRow, fromCol, toRow, toCol)) {
                        return true; // valid move: moving horizontally, vertically, or diagonally
                    }
                }
                break; 
            case 'k': // King
                if (Math.abs(fromRow-toRow) <=1 && Math.abs(fromCol-toCol) <=1) {
                    return true; // valid move: moving one square in any direction

                }
                break;
            default: 
                return false; // invalid move: unknown piece 
        }
        return true; //Invalid move: default case
    };

    //Function to check if the king is in check
    const checkKing = () => {
        const kingPosition = findKingPosition(currentPlayer);
        const opponentPieces = currentPlayer==='white'?['r', 'n', 'b', 'q', 'k', 'p']:['R', 'N','B', 'Q', 'K', 'P'];

        for (let i=0; i<8; i++){
            for (let j=0; j<8; j++){
                if (opponentPieces.includes(board[i][j])){
                    if (isValidMove(i, j, kingPosition.row, kingPosition.col)){
                        return true; //King is in check
                    }
                }
            }
        }


        return false;  //King is not in check
    };

    // Function to find the position of the current player's king
    const findKingPosition= (player)=>{
        const kingPiece = player === 'white'? 'K': 'k';

        for (let i=0; i<8; i++) {
            for (let j=0; j<8; j++) {
                if (board[i][j] === kingPiece){
                    return {row:i, col:j};
                }
            }
        }
        return null; // King not found (should not happen in a valid game state)
    };

    //Function to handle piece click
    const handlePieceClick = (rowIndex, colIndex, piece) =>{
        console.log('Clicked Piece:', piece);
        console.log('Selected Piece:', selectedPiece);
        console.log('Current Player:', currentPlayer);
        console.log('Is Check:', isCheck);

        if(!selectedPiece && piece && piece.toUpperCase().startsWith(currentPlayer.toUpperCase())){
            setSelectedPiece({row: rowIndex, col: colIndex});

            console.log('Selected Piece Set:', {row: rowIndex, col: colIndex});

        } else if (selectedPiece && isValidMove(selectedPiece.row, selectedPiece.col, rowIndex, colIndex)){
            movePiece(selectedPiece.row, selectedPiece.col, rowIndex, colIndex);
            setIsCheck(checkKing()); // check  if the king is in check
            console.log('Move Piece:', selectedPiece, rowIndex, colIndex);
            
        }
    }



    const isPathClear = (fromRow, fromCol, toRow, toCol) => {
        const dx = Math.sign(toRow - fromRow);
        const dy = Math.sign(toCol - fromCol);
        let x = fromRow + dx;
        let y = fromCol + dy;

        while(x !==toRow || y !== toCol) {
            if (board[x][y]) {
                return false; // Path is blocked by another piece
            }
            x += dx;
            y += dy;
        }
        return true;    // Path is clear
    };


    return (
        <div className="chessboard">
            {board.map((row, rowIndex) =>(
                <div key={rowIndex} className="board-row">
                    {row.map((piece, colIndex) =>(
                        <div 
                            key={`${rowIndex}-${colIndex}`} 
                            className={`square ${getSquareColor(rowIndex, colIndex)}`}
                            onClick={()=>{ handlePieceClick(rowIndex, colIndex, piece)}}
                        >
                            {piece}
                            {destination && destination.row === rowIndex && destination.col===colIndex  &&  <span className="destination-mark">&#x25A0;</span>}
                            {isCheck && piece===(currentPlayer=== 'white'? 'K':'k') && <span className="check-mark">&#x25A0;</span>}
                        </div>

                    ))}
                </div>
            ))}
        </div>
    );

};



export default Chessboard;