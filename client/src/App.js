import { useState } from "react";
import { GlobalStyle } from "./Fonts";
import { SignInScreen } from "./Screens";
import axios from 'axios'

const APIURL= 'http://localhost:5000/';

function App() {
    const [gameStatus,setGameStatus]=useState({'gameStatus':'logged out'})

    const startGame = (nameValue, langValue) => {
        axios.post(APIURL + 'api/games',
          {username:nameValue, language:langValue})
          .then(response =>{
          console.log(response.data);
          if(response.data.message==='success'){
            const gameId= response.data.game_id
            setGameStatus()
          }
      })
          
    };
    
      
  
    let screen=<></>
    if (gameStatus === 'logged out') {
          screen = <SignInScreen
                     clickStart={startGame}
                   />;
    }
//   if (gameStatus === 'logged out') {
//     screen = <SignInScreen
//                clickStart={startGame}
//                flashMessage={flashMessage}
//              />;
//     } else if (gameStatus === 'active') {
//     const { usage, revealWord, guessed, badGuesses } = this.state;
//     const guessLetter = this.guessLetter;
//     screen = <PlayScreen
//              usage = {usage}
//              blanks = {revealWord}
//              usedLetters = {guessed}
//              numBadGuesses = {badGuesses}
//              onGuess = {guessLetter}
//              flashMessage = {flashMessage}
//            />;        
//       } else if (gameStatus === 'won') {
//     const { language } = this.state;
//     const playAgain = this.playAgain;
//     const quitGame = this.quitGame;
//     screen = <WinScreen
//              lang={language}
//              clickPlayAgain={playAgain}
//              clickQuit={quitGame}
//              flashMessage={flashMessage}
//            />;
//   } else if (gameStatus === 'lost') {
//     // const { usage, secretWord, language } = this.state;
//     // const playAgain = this.playAgain;
//     // const quitGame = this.quitGame;
//     screen = <LoseScreen
//              usage = {usage}
//              blanks = {secretWord}
//              lang = {language}
//              clickPlayAgain = {playAgain}
//              clickQuit = {quitGame}
//              flashMessage={flashMessage}
//            />;
//   } else {
//     screen = <div>Unexpected {gameStatus} </div>;
// }
  return (
    <><GlobalStyle/>{screen}</>
  );
}

export default App;
