import React, { useState, useEffect } from "react";
import "./TicTacToe.css";

const KEY_TIC_TAC_TOE = "ticTacToe";

export function TicTacToe({ peer, connection, ultimate }) {
  const [board, setBoard] = useState(initializeBoard(ultimate));
  const [isXStartingNextGame, setIsXStartingNextGame] = useState(true);
  const [isXNext, setIsXNext] = useState(isXStartingNextGame);
  const winner = calculateWinner(board, ultimate);
  const gameOver = winner || isDraw(board, ultimate);
  const imX = peer?.id > connection?.peer;
  const myTurn = imX === isXNext;
  const [nextUltimateBoard, setNextUltimateBoard] = useState(null);

  function reset() {
    const newTurn = !isXStartingNextGame;
    const newBoard = initializeBoard(ultimate);
    setIsXStartingNextGame((prev) => !prev);
    setBoard(newBoard);
    setIsXNext(newTurn);
    connection.send({
      type: KEY_TIC_TAC_TOE,
      board: newBoard,
      isXNext: newTurn,
      nextUltimateBoard: null
    });
  }

  function handleClick(board, index, ultimate, subBoard) {
    if (
      !connection ||
      !myTurn ||
      getCell(board, index, ultimate, subBoard) ||
      winner
    ) {
      return;
    }
    const newBoard = [...board];
    const newCellValue = isXNext ? "✖️" : "⭕";
    if (ultimate) {
      newBoard[subBoard][index] = newCellValue;
    } else {
      newBoard[index] = newCellValue;
    }

    const newTurn = !isXNext;
    setBoard(newBoard);
    setIsXNext(newTurn);
    let newNextUltimateBoard = index;
    if (ultimate) {
      const winner = calculateWinner(newBoard[index], false);
      //if the board you are going to has already won, you can choose any
      if (winner !== null) {
        newNextUltimateBoard = null;
      }
    }
    setNextUltimateBoard(newNextUltimateBoard);
    connection.send({
      type: KEY_TIC_TAC_TOE,
      board: newBoard,
      isXNext: newTurn,
      nextUltimateBoard: newNextUltimateBoard
    });
  }

  useEffect(() => {
    if (connection) {
      connection.on("data", (data) => {
        if (data.type !== KEY_TIC_TAC_TOE) return;
        if (data.board !== undefined) {
          setBoard(data.board);
        }
        if (data.isXNext !== undefined) {
          setIsXNext(data.isXNext);
        }
        if (data.nextUltimateBoard !== undefined) {
          setNextUltimateBoard(data.nextUltimateBoard);
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
      {ultimate ? (
        <div className="ultimate-board">
          {[...Array(9).keys()].map((subBoardIndex) =>
            renderBoard(
              board,
              subBoardIndex,
              ultimate,
              !myTurn ||
                calculateDisabled(
                  board,
                  subBoardIndex,
                  nextUltimateBoard,
                  calculateWinner
                ),
              handleClick
            )
          )}
        </div>
      ) : (
        renderBoard(board, null, ultimate, !myTurn, handleClick)
      )}

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

function calculateDisabled(
  board,
  subBoardIndex,
  nextUltimateBoard,
  calculateWinner
) {
  const alreadyWon = calculateWinner(board[subBoardIndex], false) !== null;
  const forcedToPickThisOne = nextUltimateBoard === subBoardIndex;
  const chooseAny = nextUltimateBoard === null;
  //should be enabled if chooseAny, unless alreadyWon!
  //else: disabled if !forcedToPickThisOne

  //should be DISABLED if alreadyWon and !forcedToPickThisOne (check !== null)
  //should be ENABLED if chooseAny
  let res = !forcedToPickThisOne;

  if (alreadyWon) {
    return true;
  }
  if (chooseAny) {
    return false;
  }
  return res;
}

function renderBoard(board, subBoardIndex, ultimate, disabled, handleClick) {
  const winner = calculateWinner(board[subBoardIndex]);
  return (
    <div key={subBoardIndex}>
      {ultimate && winner && <div className={`ultimate-winner`}>{winner}</div>}
      <div className="board">
        {[...Array(9).keys()].map((index) => (
          <div key={index} className="board-square">
            <button
              disabled={disabled || winner}
              className={`square ${!disabled ? "square--cursor" : ""}`}
              onClick={() => handleClick(board, index, ultimate, subBoardIndex)}
            >
              {getCell(board, index, ultimate, subBoardIndex) || ""}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function getCell(board, index, ultimate, subBoard) {
  if (ultimate) {
    return board[subBoard][index];
  }

  return board[index];
}

function isDraw(board, ultimate) {
  if (ultimate) {
    return board.every((subBoard) => isDraw(subBoard, false));
  }
  return !board.includes(null);
}

function initializeBoard(ultimate) {
  if (ultimate) {
    return Array(9)
      .fill(null)
      .map(() => initializeBoard(false));
  }
  return Array(9).fill(null);
}

function calculateWinner(squares, ultimate) {
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
    if (ultimate) {
      const boardA = calculateWinner(squares[a], false);
      const boardB = calculateWinner(squares[b], false);
      const boardC = calculateWinner(squares[c], false);
      if (boardA && boardA === boardB && boardA === boardC) {
        return boardA;
      }
    } else {
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a];
      }
    }
  }
  return null;
}
