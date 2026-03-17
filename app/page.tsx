"use client";

import { useEffect, useMemo, useState } from "react";

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const emptyBoard = () => Array(9).fill("");

function findWinner(board: string[]) {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function bestMove(board: string[], player: string, opponent: string): number {
  let bestScore = -Infinity;
  let bestIndex = -1;

  for (let i = 0; i < board.length; i += 1) {
    if (board[i] === "") {
      board[i] = player;
      const score = minimax(board, false, player, opponent);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }
  }

  return bestIndex;
}

function minimax(board: string[], isMaximizing: boolean, player: string, opponent: string): number {
  const winner = findWinner(board);
  if (winner === player) return 10;
  if (winner === opponent) return -10;
  if (!board.includes("")) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < board.length; i += 1) {
      if (board[i] === "") {
        board[i] = player;
        best = Math.max(best, minimax(board, false, player, opponent));
        board[i] = "";
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < board.length; i += 1) {
      if (board[i] === "") {
        board[i] = opponent;
        best = Math.min(best, minimax(board, true, player, opponent));
        board[i] = "";
      }
    }
    return best;
  }
}

export default function Home() {
  const [board, setBoard] = useState<string[]>(emptyBoard);
  const [turn, setTurn] = useState<"X" | "O">("X");
  const [mode, setMode] = useState<"pvp" | "cpu">("cpu");

  const winner = useMemo(() => findWinner(board), [board]);
  const isDraw = useMemo(() => !winner && board.every((cell) => cell !== ""), [board, winner]);

  useEffect(() => {
    if (mode !== "cpu") return;
    if (winner || isDraw) return;
    if (turn === "O") {
      const idx = bestMove(board, "O", "X");
      if (idx === -1) return;
      const next = [...board];
      next[idx] = "O";
      setBoard(next);
      setTurn("X");
    }
  }, [board, turn, winner, isDraw, mode]);

  function handleClick(index: number) {
    if (board[index] || winner) return;
    if (mode === "cpu" && turn === "O") return;

    const next = [...board];
    next[index] = turn;
    setBoard(next);

    if (mode === "pvp") {
      setTurn((current) => (current === "X" ? "O" : "X"));
    } else {
      setTurn("O");
    }
  }

  function resetGame() {
    setBoard(emptyBoard());
    setTurn("X");
  }

  function changeMode(newMode: "pvp" | "cpu") {
    setMode(newMode);
    resetGame();
  }

  const statusText = winner
    ? `Winner: ${winner}`
    : isDraw
    ? "Draw!"
    : mode === "cpu"
    ? turn === "X"
      ? "Your turn"
      : "Computer thinking..."
    : `Next: ${turn}`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-100 p-4">
      <main className="w-full max-w-xl rounded-2xl border border-slate-600/40 bg-slate-800/90 p-6 shadow-2xl">
        <div className="mb-4 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">Tic Tac Toe</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Play vs Computer</h1>
          <p className="mt-2 text-sm text-slate-300">Choose mode and click a square.</p>
        </div>

        <div className="mb-4 flex justify-center gap-2">
          <button
            onClick={() => changeMode("cpu")}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${mode === "cpu" ? "bg-indigo-500 text-white" : "bg-slate-700 text-slate-200"}`}
          >
            Computer
          </button>
          <button
            onClick={() => changeMode("pvp")}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${mode === "pvp" ? "bg-indigo-500 text-white" : "bg-slate-700 text-slate-200"}`}
          >
            2 Players
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleClick(index)}
              disabled={!!cell || !!winner || (mode === "cpu" && turn === "O")}
              className="h-20 rounded-xl border border-slate-500/50 bg-slate-700 text-3xl font-bold text-indigo-200 transition hover:border-indigo-300/70 hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={`Square ${index + 1}`}
            >
              {cell}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <div className="rounded-xl border border-slate-500/40 bg-slate-700/50 px-4 py-2 text-sm font-medium text-slate-100">
            {statusText}
          </div>
          <button
            onClick={resetGame}
            className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            Reset
          </button>
        </div>
      </main>
    </div>
  );
}
