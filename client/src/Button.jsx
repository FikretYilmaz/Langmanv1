import React, { useState } from 'react'
import styled from 'styled-components'

const BaseLetterButton = styled.button`
    font-family: 'IBM Plex Mono', monospace;
    font-size: 30px;
    padding: 0em 0.9em 1.3em 0.3em;
    margin: 0.1em;
    border-radius: 0.5em;
    text-align: center;
    width: 1em;
    height: 1.2em;
    background-color: ${props => (props.used ? "#777" : "#ccc")};
    &:hover {
       ${props => props.used ? "" : "background-color: #eee;"}
    };

`;
const BoxPanel = styled.div`
display:inline-block;
font-size:30px;
background-color:#444;
color:#fff;
border-radius:26px;
padding:20px;
margin:10px;
`;

const LetterButton = ({ letter, wasUsed, makeGuess }) => {
    return (
        <BaseLetterButton
            type="button"
            used={wasUsed}
            onClick={ wasUsed ? null : makeGuess }
            >
            {letter}
        </BaseLetterButton>
    )
}

const ButtonPanel = ({ usedLetters, onGuess }) => {
    const alphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M',
	        'N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    // const [clickedLetters, setClickedLetters] = useState([]);
    const makeGuess = (letter) => () => {
        onGuess(letter);
      };

      return (
        <BoxPanel>
          { alphabet.map(letter => (
            <LetterButton
              key={letter}
              letter={letter}
              wasUsed={usedLetters.toUpperCase().includes(letter)}
              makeGuess={makeGuess(letter)}
            />
          )) }
        </BoxPanel>
      );
  }

  const FormInput = styled.input`
  padding:  3px;
  margin:   6px;
  text-align: center;
  font-family: inherit;
`;

const FormSelect = styled.select`
  padding:  3px;
  margin:   6px;
  text-align: center;
  font-family: inherit;
`;

const ActionButton = styled.button`
  padding: 5px;
  margin: 3px;
  background-color: #ccc;
  font-size: 110%;
  font-family: inherit;
`;

  const StartForm = ({ clickStart }) => {
    const [nameValue, setNameValue] = useState("");
    // const [passwordValue, setPasswordValue] = useState("");
    // const [registerNewAccount, setRegisterNewAccount] = useState(false);
    const [langValue, setLangValue] = useState("en");
    const onNameChange = (event) => {
      setNameValue(event.target.value);
    };
  
    // const onPasswordChange = (event) => {
    //   setPasswordValue(event.target.value);
    // };
  
    // const onNewAccountChange = (event) => {
    //   setRegisterNewAccount(event.target.checked);
    // };
  
    const onLangChange = (event) => {
      setLangValue(event.target.value);
    };
  
    const clickWrapper = (event) => {
      clickStart(nameValue, langValue); // passwordValue,registerNewAccount
    };

    return (
      <div>
      <form>
        <label htmlFor="name">Enter your name</label>
        <FormInput
          value={nameValue}
          type="text"
          name="name"
          onChange={onNameChange}
          />
        <br/>
        <label htmlFor='languageInput'>Choose Language</label>
        <FormSelect
          onChange={onLangChange}
          value={langValue}
          id='languageInput'
          name='language'>
            <option value='en'>English</option>
            <option value='fr'>French</option>
            <option value='es'>Spanish</option>
        </FormSelect>
        <br/>
        <ActionButton
          type='button'
          onClick={clickWrapper}>
            Start a Game
        </ActionButton>
      </form>
    </div>
    )
  }

  const PlayAgainPanel = ({ clickPlayAgain,clickQuit }) => {
    // const [nameValue, setNameValue] = useState("");
    const [langValue, setLangValue] = useState("en");
    const [quit, setQuit] = useState(false);

    const onLangChange = (event) => {
      setLangValue(event.target.value);
    };
  
    const clickWrapper = (event) => {
      clickPlayAgain(langValue,quit); // passwordValue,registerNewAccount
    };
    const handleQuit = (event) => {
      setQuit(true)
      clickQuit(langValue,quit); // passwordValue,registerNewAccount
    };

    return (
      <div>
        <form>
          <label htmlFor='languageInput'>Choose a Language</label>
          <FormSelect
            onChange={onLangChange}
            value={langValue}
            id='languageInput'
            name='language'>
            <option value='en'>English</option>
            <option value='fr'>French</option>
            <option value='es'>Spanish</option>
          </FormSelect>
          <ActionButton
            type='button'
            onClick={clickWrapper}>
              Play Again
          </ActionButton>
          <ActionButton
            type='button'
            onClick={handleQuit}>
              Quit
          </ActionButton>
        </form>
      </div>
    )
  }

export {LetterButton, ButtonPanel, StartForm, PlayAgainPanel}