import './App.css';
import ListApp from './miniApps/ListApp';
import FoodAndDrinkApp from './miniApps/FoodAndDrinkApp';
import { Form, Button, ButtonGroup, Spinner, Stack } from 'react-bootstrap';
import { useState } from 'react';
import promptGpt from './Skills/GPT.js';
import getIntent from './Skills/HostSkills/IntentClassifier.js';

let listAppGlobalPromptGenerator = null;
let listAppGlobalCommandHandlers = new Map();
let foodAndDrinkAppGlobalPromptGenerator = null;
let foodAndDrinkAppGlobalCommandHandlers = new Map();

function App() {

  const [isThinking, setIsThinking] = useState(false);
  const [userObjective, setUserObjective] = useState(''); 
  const [key, setKey] = useState('');
  const [responseTone, setResponseTone] = useState('Professional');
  const [userObjectiveHistory, setUserObjectiveHistory] = useState([]);
  const [intent, setIntent] = useState('Unknown');

  const handleItemChange = (e) => {
    setUserObjective(e.currentTarget.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    handleThink();
  }

  const handleListAppIntent = async (promptData) => {

    let promptInfo = listAppGlobalPromptGenerator(promptData);

    const results = await promptGpt(promptInfo.prompt, key, promptInfo.config);

    console.log(JSON.stringify(results, null, 2));

    for (const step of results) {

      let command = step.command;
      let args = step.arguments;

      await listAppGlobalCommandHandlers.get(command)(args);
    }

  }

  const handleFoodAndDrinkAppIntent = async (promptData) => {

    let promptInfo = foodAndDrinkAppGlobalPromptGenerator(promptData);

    const results = await promptGpt(promptInfo.prompt, key, promptInfo.config);

    console.log(JSON.stringify(results, null, 2));

    for (const step of results) {

      let command = step.command;
      let args = step.arguments;

      await foodAndDrinkAppGlobalCommandHandlers.get(command)(args);
    }

  }

  const handleThink = async () => {
      
    setIsThinking(true);

    try {
      // Get intent
      let intentResult = await getIntent(userObjective, userObjectiveHistory, key);
      console.log(JSON.stringify(intentResult, null, 2));
      setIntent(intentResult.intent);

      let promptData = {
        userObjective: userObjective,
        history: `NOTE: When generating text responses, use ${responseTone} tone.
        Last 5 objectives provided by user:
        ${userObjectiveHistory.length > 0 ? userObjectiveHistory.map(i => '- ' + i).join('\n') : "NONE"}`
      };

      switch(intentResult.intent) {
        case 'ListApp':
          await handleListAppIntent(promptData);
          break;
        case 'FoodAndDrinkApp':
          await handleFoodAndDrinkAppIntent(promptData);
          break;
        default:
          console.log(`Unknown intent: ${intentResult.intent}`);
      }

      console.log('Done processing.');

      // Add to history
      let newHistory = userObjectiveHistory.slice();
      newHistory.push(userObjective);
      if (newHistory.length > 5) {
        newHistory.shift();
      }
      setUserObjectiveHistory(newHistory);

      setIsThinking(false);
      setUserObjective('');
    }
    catch (e) {

      if (e?.response.status === 401) {
        alert('Invalid key');
      }
      else {     
        alert(e.message);
      }

      console.log(e);
      setIsThinking(false);
    }
    
  }

  const handleKeyChange = (e) => {
    setKey(e.currentTarget.value)
  }

  const handleToneChange = (e) => {
    setResponseTone(e.currentTarget.value);
  }

  return (
    <div className="App">
      <header className="App-header">
            App Commands GPT - Demo
      </header>
      <div className="App-globalActions">
        <Form onSubmit={handleSubmit}>

          <Form.Group className="mb-3" controlId="formObjectiveText">
            <Form.Control type="text" value={userObjective} onChange={handleItemChange} placeholder="Say something..." />
          </Form.Group>

          <Form.Group className='mb-3' controlId='formResponseTone'>
            <Form.Label>Response tone</Form.Label>
            <Form.Select aria-label="response-tone" onChange={handleToneChange} value={responseTone}>
              <option>Professional</option>
              <option>Friendly</option>
              <option>Funny</option>
              <option>Sarcastic</option>
              <option>Rude</option>
            </Form.Select>
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
              />Thinking, intent is {intent}...
            </>}
            {!isThinking && <>Go 🪄</>}
            </Button>
          </ButtonGroup>

        </Form>
      </div>

      <div className="App-container">

        <Stack direction="horizontal" gap={3}>
          

        <ListApp
          commandingContext={(promptGeneratorHandler) => {
            listAppGlobalPromptGenerator = promptGeneratorHandler;
            }}
          commandHandler={(command, handler) => {
            listAppGlobalCommandHandlers.set(command, handler);
          }}
          LLMKey={key}
        />

        <FoodAndDrinkApp 
          commandingContext={(promptGeneratorHandler) => {
            foodAndDrinkAppGlobalPromptGenerator = promptGeneratorHandler;
            }}
          commandHandler={(command, handler) => {
            foodAndDrinkAppGlobalCommandHandlers.set(command, handler);
          }}
          LLMKey={key}
        />

        </Stack>
        
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
