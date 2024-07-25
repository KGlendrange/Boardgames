import React, { useState, useEffect } from "react";
import { KEY_CHAT, Text } from "../Menu/Chat/Chat";
import Peer, { DataConnection } from "peerjs";

const KEY_TIC_TAC_TOE = "ticTacToe";
type Mark = "✖️" | "⭕";

type NormalBoard = (Mark | null)[];
type UltimateBoard = NormalBoard[];
type Board = NormalBoard | UltimateBoard;

type TicTacToeMessage = {
  type: typeof KEY_TIC_TAC_TOE;
  board: Board;
  isXNext: boolean;
  nextUltimateBoard: number;
}


export function TicTacToe({ peer, connections, ultimate, setTexts } : {peer: Peer, connections: DataConnection[], ultimate: boolean, setTexts: React.Dispatch<React.SetStateAction<Text[]>>}) {
  const [board, setBoard] = useState<Board>(initializeBoard(ultimate));
  const [isXStartingNextGame, setIsXStartingNextGame] = useState<boolean>(true);
  const [isXNext, setIsXNext] = useState<boolean>(isXStartingNextGame);
  const winner = calculateWinner(board, ultimate);
  const gameOver = winner || isDraw(board, ultimate);
  const imX = peer.id > connections?.[0]?.peer;
  const myTurn = imX === isXNext;
  const [nextUltimateBoard, setNextUltimateBoard] = useState<number|null>(null);

  function reset() {
    const newTurn = !isXStartingNextGame;
    const newBoard = initializeBoard(ultimate);
    setIsXStartingNextGame((prev) => !prev);
    setBoard(newBoard);
    setIsXNext(newTurn);
    connections.forEach((connection) => {
      connection.send({
        type: KEY_TIC_TAC_TOE,
        board: newBoard,
        isXNext: newTurn,
        nextUltimateBoard: null,
      });
    });
  }

  function handleClick(board: Board, index: number, ultimate: boolean, subBoardIndex: number) {
    if (
      connections.length === 0 ||
      !myTurn ||
      getCell(board, index, ultimate, subBoardIndex) ||
      winner
    ) {
      return;
    }
    const newBoard = [...board] as Board;
    const newCellValue: Mark = isXNext ? "✖️" : "⭕";
    if (ultimate) {
      (newBoard as UltimateBoard)[subBoardIndex][index] = newCellValue;
    } else {
      newBoard[index] = newCellValue;
    }

    const newTurn = !isXNext;
    setBoard(newBoard);
    setIsXNext(newTurn);
    let newNextUltimateBoard: number | null = index;
    const checkWinner = calculateWinner(newBoard, ultimate);

    if (ultimate) {
      //if the board you are going to has already won, you can choose any
      if (
        calculateWinner(newBoard[index] as NormalBoard, false) !== null ||
        isDraw(newBoard[index] as NormalBoard, false)
      ) {
        newNextUltimateBoard = null;
      }
    }
    setNextUltimateBoard(newNextUltimateBoard);
    connections.forEach((connection) => {
      connection.send({
        type: KEY_TIC_TAC_TOE,
        board: newBoard,
        isXNext: newTurn,
        nextUltimateBoard: newNextUltimateBoard,
      });
      const winnerText = {
        type: KEY_CHAT,
        name: "TicTacToe",
        color: "red",
        text: `${checkWinner} has Won!`,
      };
      setTexts((currentTexts) => ({ ...currentTexts, winnerText }));
      if (checkWinner) {
        connection.send(winnerText);
      }
    });
  }

  useEffect(() => {
    if (connections?.length > 0) {
      connections.forEach((connection) => {
        connection.on("data", (data) => {
          const message = data as TicTacToeMessage;
          if (message.type !== KEY_TIC_TAC_TOE) return;
          if (message.board !== undefined) {
            setBoard(message.board);
          }
          if (message.isXNext !== undefined) {
            setIsXNext(message.isXNext);
          }
          if (message.nextUltimateBoard !== undefined) {
            setNextUltimateBoard(message.nextUltimateBoard);
          }
        });
      });
    }
  }, [connections]);

  return (
    <div>
      <h1>Tic Tac Toe</h1>
      {ultimate ? (
        <div className="ultimate-board">
          {Array.from({length: 9}).map((_,subBoardIndex) =>
            renderBoard(
              board,
              subBoardIndex,
              ultimate,
              !myTurn ||
                calculateDisabled(
                  board,
                  subBoardIndex,
                  nextUltimateBoard,
                  calculateWinner,
                ),
              handleClick,
            ),
          )}
        </div>
      ) : (
        renderBoard(board, -1, ultimate, !myTurn, handleClick)
      )}
      <div className="reset">
        {winner && <p>Winner: {winner}</p>}

        {gameOver && !winner && <p>Draw!</p>}
        <div>{gameOver && <button onClick={reset}>Reset</button>}</div>
      </div>
      {(ultimate
        ? (board as UltimateBoard).every((subBoard) => subBoard.every((cell) => cell === null))
        : (board as NormalBoard).every((cell) => cell === null)) &&
        !myTurn && <p>Waiting for other player...</p>}
    </div>
  );
}

function calculateDisabled(
  board: Board,
  subBoardIndex: number,
  nextUltimateBoard: number | null,
  calculateWinner: Function,
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

function renderBoard(board: Board, subBoardIndex: number, ultimate: boolean, disabled: boolean, handleClick: Function) {
  const winner = calculateWinner(ultimate ? (board as UltimateBoard)[subBoardIndex] : board, ultimate);
  return (
    <div key={subBoardIndex}>
      {ultimate && winner && <div className={`ultimate-winner`}>{winner}</div>}
      <div className="board">
        {Array.from({length: 9}).map((_,index) => (
          <div key={index} className="board-square">
            <button
              disabled={disabled || winner !== null}
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

function getCell(board: Board, index: number, ultimate: boolean, subBoardIndex: number): Mark | null {
  if (ultimate) {
    return (board as UltimateBoard)[subBoardIndex][index];
  }

  return (board as NormalBoard)[index];
}

function isDraw(board: Board, ultimate: boolean): boolean {
  if (Array.isArray(board[0])) {
    return (board as UltimateBoard).every((subBoard) => isDraw(subBoard, false));
  }
  return !(board as NormalBoard).includes(null);
}

function initializeBoard(ultimate: boolean): Board {
  if (ultimate) {
    return Array(9)
      .fill(null)
      .map(() => initializeBoard(false)) as UltimateBoard;
  }
  return Array(9).fill(null);
}

function calculateWinner(squares: Board, ultimate: boolean): Mark | null {
  // Type guard to handle nested boards
  if (Array.isArray(squares[0])) {
    // Nested board case
    for (let i = 0; i < squares.length; i++) {
      const result = calculateWinner(squares[i] as NormalBoard, false);
      if (result) {
        return result;
      }
    }
    return null;
  }

  const simpleBoard = squares as NormalBoard;
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (simpleBoard[a] && simpleBoard[a] === simpleBoard[b] && simpleBoard[a] === simpleBoard[c]) {
      return simpleBoard[a];
    }
  }

  return null;
}

