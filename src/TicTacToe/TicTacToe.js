import React, { useState, useEffect } from "react";
import "./TicTacToe.css";

const KEY_TIC_TAC_TOE = "ticTacToe";

export function TicTacToe({ peer, connection, ultimate }) {
  const [board, setBoard] = useState(initializeBoard(ultimate));
  const [isXStartingNextGame, setIsXStartingNextGame] = useState(true);
  const [isXNext, setIsXNext] = useState(isXStartingNextGame);
  const winner = calculateWinner(board);
  const gameOver = winner || !board?.includes(null);
  const imX = peer?.id > connection?.peer;
  const myTurn = imX === isXNext;

  function reset() {
    const newTurn = !isXStartingNextGame;
    const newBoard = initializeBoard(ultimate);
    setIsXStartingNextGame((prev) => !prev);
    setBoard(newBoard);
    setIsXNext(newTurn);
    connection.send({
      type: KEY_TIC_TAC_TOE,
      board: newBoard,
      isXNext: newTurn
    });
  }

  function handleClick(index) {
    if (!connection || !myTurn || board[index] || winner) return;
    const newBoard = [...board];
    newBoard[index] = isXNext ? "✖️" : "⭕";

    const newTurn = !isXNext;
    setBoard(newBoard);
    setIsXNext(newTurn);
    connection.send({
      type: KEY_TIC_TAC_TOE,
      board: newBoard,
      isXNext: newTurn
    });
  }

  useEffect(() => {
    if (connection) {
      connection.on("data", (data) => {
        if (data.type !== KEY_TIC_TAC_TOE) return;
        console.log("got some data from tictac", data);
        if (data.board !== undefined) {
          setBoard(data.board);
        }
        if (data.isXNext !== undefined) {
          setIsXNext(data.isXNext);
        }
      });
    }
  }, [connection]);

  if (!connection) {
    return null;
  }
  return (
    <div>
      <h1>Tic Tac Toe</h1>

      <div className="board">
        {[...Array(9).keys()].map((i) => (
          <div key={i} className="board-square">
            <button
              disabled={!myTurn}
              className={`square ${myTurn ? "square--cursor" : ""}`}
              onClick={() => handleClick(i)}
            >
              {board[i] || ""}
            </button>
          </div>
        ))}
      </div>
      <div className="reset">
        {winner && <p>Winner: {winner}</p>}

        {gameOver && !winner && <p>Draw!</p>}
        <div>{gameOver && <button onClick={reset}>Reset</button>}</div>
      </div>
      {board.every((cell) => cell === null) && !myTurn && (
        <p>Waiting for other player...</p>
      )}
    </div>
  );
}

function initializeBoard(ultimate) {
  if (ultimate) {
    return Array(9)
      .fill(null)
      .map(() => initializeBoard(false));
  }
  return Array(9).fill(null);
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
