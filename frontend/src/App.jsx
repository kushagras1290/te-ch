import { useState, useEffect, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import './App.css';

function App() {
  const [fen, setFen] = useState('start');
  const game = useMemo(() => new Chess(), []);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/game')
      .then(res => res.json())
      .then(data => {
        setFen(data.fen);
        game.load(data.fen);
      });
  }, [game]);

  function onDrop(sourceSquare, targetSquare, piece) {
    console.log(`Move from ${sourceSquare} to ${targetSquare} (${piece})`);
    const isPromotion = (piece === 'wP' && sourceSquare[1] === '7' && targetSquare[1] === '8') ||
                        (piece === 'bP' && sourceSquare[1] === '2' && targetSquare[1] === '1');

    const move = isPromotion ? `${sourceSquare}${targetSquare}q` : `${sourceSquare}${targetSquare}`;

    fetch('http://127.0.0.1:5000/move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ move }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.fen) {
          setFen(data.fen);
          game.load(data.fen);
        } else {
          console.error(data.error);
        }
      });

    return true;
  }

  function resetGame() {
    fetch('http://127.0.0.1:5000/reset', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setFen(data.fen);
        game.load(data.fen);
      });
  }

  return (
    <div className="App">
      <h1>Chess</h1>
      <Chessboard 
        position={fen} 
        onPieceDrop={onDrop}
        isDraggablePiece={({ piece, sourceSquare }) => {
          console.log(game.ascii());
          return game.turn() === piece[0] && game.moves({ square: sourceSquare, verbose: true }).length > 0;
        }}
      />
      <button onClick={resetGame}>Reset Game</button>
    </div>
  );
}

export default App;
