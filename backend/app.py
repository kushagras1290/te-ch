from flask import Flask, jsonify, request
from flask_cors import CORS
import chess
import logging

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(app)

board = chess.Board()

@app.route('/game', methods=['GET'])
def game():
    return jsonify({'fen': board.fen()})

@app.route('/move', methods=['POST'])
def move():
    move_str = request.json.get('move')
    app.logger.debug(f"Received move: {move_str}")
    app.logger.debug(f"Board FEN: {board.fen()}")
    app.logger.debug(f"Legal moves: {[m.uci() for m in board.legal_moves]}")
    try:
        move = chess.Move.from_uci(move_str)
        if move in board.legal_moves:
            board.push(move)
            return jsonify({'fen': board.fen()})
        else:
            return jsonify({'error': 'Invalid move'}), 400
    except ValueError:
        return jsonify({'error': 'Invalid move format'}), 400

@app.route('/reset', methods=['POST'])
def reset():
    board.reset()
    return jsonify({'fen': board.fen()})

if __name__ == '__main__':
    app.run(debug=True)
