import React, { useState, useEffect } from "react";
import "./TicTacToe.css";
export function TicTacToe({ connection }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const winner = calculateWinner(board);

  function handleClick(index) {
    if (!connection || board[index] || winner) return;
    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);
    setIsXNext(!isXNext);
    connection.send({
      board: newBoard,
      isXNext: !isXNext
    });
  }

  if (connection) {
    connection.on("data", (data) => {
      if (data.board) {
        setBoard(data.board);
      }
      if (data.isXNext) {
        setIsXNext(data.isXNext);
      }
    });
  }

  return (
    <div>
      <h1>Tic Tac Toe</h1>
      <div className="board">
        {[...Array(9).keys()].map((i) => (
          <div key={i} className="board-square">
            <button className="square" onClick={() => handleClick(i)}>
              {board[i]}
            </button>
          </div>
        ))}
      </div>
      {winner && <p>Winner: {winner}</p>}
    </div>
  );
}

function calculateWinner(squares) {
  if (!squares) return null;
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
