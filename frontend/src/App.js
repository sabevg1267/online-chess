import logo from './logo.svg';
import './App.css';
import { Board } from './ui/Board';
import { Bar } from './ui/Bar.js';
import { use, useState } from 'react';
function App() {
  const [inGame, setInGame] = useState(false)
  const [playerColor, setPlayerColor] = useState('white')
  const [turn, setTurn] = useState("white")

  return (
    <div className="App">
      <Board className="theBoard" inGame = {inGame} playerColor = {playerColor} turn = {turn} setTurn = {setTurn}/>
      <Bar setInGame={setInGame} setPlayerColor = {setPlayerColor} setTurn = {setTurn}/>
    </div>
  );
}

export default App;
