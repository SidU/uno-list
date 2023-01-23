import './App.css';
import ListApp from './ListApp';
import { Form, Button, ButtonGroup, Spinner } from 'react-bootstrap';
import { useState } from 'react';
import promptGpt from './Skills/GPT.js';

let listAppGlobalPromptGenerator = null;
let listAppGlobalCommandHandlers = new Map();

function App() {

  const [isThinking, setIsThinking] = useState(false);
  const [userObjective, setUserObjective] = useState(''); 
  const [key, setKey] = useState('');

  const handleItemChange = (e) => {
    setUserObjective(e.currentTarget.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    handleThink();
  }

  const handleThink = async () => {
      
    setIsThinking(true);

    let prompt = listAppGlobalPromptGenerator(userObjective);
  
    const results = await promptGpt(prompt, key);

    console.log(JSON.stringify(results));

    for (const step of results) {

      let command = step.command;
      let args = step.arguments;

      await listAppGlobalCommandHandlers.get(command)(args);
    }

    console.log('Done processing.');

    setIsThinking(false);
    setUserObjective('');
  }

  const commandingContext = (promptGeneratorHandler) => {
    listAppGlobalPromptGenerator = promptGeneratorHandler;
  }

  const commandHandler = (command, handler) => {
    listAppGlobalCommandHandlers.set(command, handler);
  }

  const handleKeyChange = (e) => {
    setKey(e.currentTarget.value)
  }

  return (
    <div className="App">
      <header className="App-header">
            App Commands GPT - Demo
      </header>
      <div className="App-globalActions">
        <Form onSubmit={handleSubmit}>

          <Form.Group className="mb-3" controlId="formObjectiveText">
            <Form.Control type="text" value={userObjective} onChange={handleItemChange} placeholder="What do you want to do with your lists?" />
          </Form.Group>

          <ButtonGroup>
            <Button disabled={isThinking} onClick={(e) => {handleThink()}}>
            {isThinking && <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />Thinking...
            </>}
            {!isThinking && <>Go 🪄</>}
            </Button>
          </ButtonGroup>

        </Form>
      </div>
      <div className="App-container">
        <ListApp
          commandingContext={commandingContext}
          commandHandler={commandHandler}
          LLMKey={key}
        />
      </div>
      <div className="App-config">
        <h4>Configure</h4>
          <Form>
            <Form.Group className="mb-3" controlId="formKeyText">
              <Form.Control type="password" value={key} onChange={handleKeyChange} placeholder="Key" />
              <a href='https://beta.openai.com/account/api-keys'>Get</a>
            </Form.Group>
          </Form>
      </div>
    </div>
  );
}

export default App;
