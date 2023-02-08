import './App.css';
import ListApp from './miniApps/ListApp';
import FoodAndDrinkApp from './miniApps/FoodAndDrinkApp';
import TravelApp from './miniApps/TravelApp';
import { Form, Button, ButtonGroup, Spinner, Stack, Accordion } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import promptGpt from './Skills/GPT.js';
import getIntent from './Skills/HostSkills/IntentClassifier.js';

let listAppGlobalPromptGenerator = null;
let listAppGlobalCommandHandlers = new Map();
let foodAndDrinkAppGlobalPromptGenerator = null;
let foodAndDrinkAppGlobalCommandHandlers = new Map();
let travelAppGlobalPromptGenerator = null;
let travelAppGlobalCommandHandlers = new Map();

let inbuiltCommandHandlers = new Map();

const initInBuiltCommandHandlers = (intent, key) => {

  inbuiltCommandHandlers.set('INBUILT.CHAIN', async (args) => {

    let prevStepOutput = [];

    // Runs a chain of commands
    for (const command of args) {

      // Combine prevStepOutput with command arguments
      let currentStepArguments = [...prevStepOutput, ...command.arguments];

      // If command is a built-in command, run it
      // Otherwise, run the command handler for the current intent

      if (inbuiltCommandHandlers.has(command.command)) {
        prevStepOutput = await inbuiltCommandHandlers.get(command.command)(currentStepArguments);
      }
      else {
        switch (intent) {
          case 'ListApp':
            prevStepOutput = await listAppGlobalCommandHandlers.get(command.command)(currentStepArguments);
            break;
          case 'FoodAndDrinkApp':
            prevStepOutput = await foodAndDrinkAppGlobalCommandHandlers.get(command.command)(currentStepArguments);
            break;
          case 'TravelApp':
            prevStepOutput = await travelAppGlobalCommandHandlers.get(command.command)(currentStepArguments);
            break;
          default:
            console.error(`Command ${command.command} not found`);
            break;
        }
      }
    }

    return [prevStepOutput];
  });

  inbuiltCommandHandlers.set('INBUILT.PROMPT', async (args) => {

    const results = await promptGpt(args[0] + '\n' + args[1], key);

    return [results];

  });

}

initInBuiltCommandHandlers();

function App() {

  const [isThinking, setIsThinking] = useState(false);
  const [userObjective, setUserObjective] = useState('');
  const [responseTone, setResponseTone] = useState('Professional');
  const [userObjectiveHistory, setUserObjectiveHistory] = useState([]);
  const [intent, setIntent] = useState('Unknown');
  const [thoughtProcess, setThoughtProcess] = useState([]);

  useEffect(() => {
    initInBuiltCommandHandlers(intent);
  }, [intent]);

  const handleItemChange = (e) => {
    setUserObjective(e.currentTarget.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    handleThink();
  }

  const handleIntent = async (detectedIntent, promptData) => {

    addToThoughtProcess(`Detected intent: ${detectedIntent}. Asking matched-app to process objective...`);

    let promptInfo = null;

    switch (detectedIntent) {
      case 'ListApp':
        promptInfo = listAppGlobalPromptGenerator(promptData);
        break;
      case 'FoodAndDrinkApp':
        promptInfo = foodAndDrinkAppGlobalPromptGenerator(promptData);
        break;
      case 'TravelApp':
        promptInfo = travelAppGlobalPromptGenerator(promptData);
        break;
      default:
        console.error(`Intent ${detectedIntent} not found`);
        break;
    }

    const results = await promptGpt(promptInfo.prompt, promptInfo.config);

    console.log(JSON.stringify(results, null, 2));

    addToThoughtProcess(`Matched-app done processing objective. Now executing commands...`);

    for (const step of results) {

      let command = step.command;
      let args = step.arguments;

      addToThoughtProcess(`Processing command: ${command} with arguments: ${args.join(', ')}`);

      // If in-built intent, use in-built handler.
      if (inbuiltCommandHandlers.has(command)) {
        await inbuiltCommandHandlers.get(command)(args);
      }
      else {
        switch (detectedIntent) {
          case 'ListApp':
            await listAppGlobalCommandHandlers.get(command)(args);
            break;
          case 'FoodAndDrinkApp':
            await foodAndDrinkAppGlobalCommandHandlers.get(command)(args);
            break;
          case 'TravelApp':
            await travelAppGlobalCommandHandlers.get(command)(args);
            break;
          default:
            console.error(`Command ${detectedIntent} not found`);
            addToThoughtProcess(`Command ${detectedIntent} not found`);
            break;
        }
      }
    }
  }

  const handleThink = async () => {

    setIsThinking(true);

    addToThoughtProcess(`Objective received: ${userObjective}. Thinking...`);

    try {
      // Get intent
      let intentResult = await getIntent(userObjective, userObjectiveHistory);
      console.log(JSON.stringify(intentResult, null, 2));
      setIntent(intentResult.intent);

      addToThoughtProcess('Intent: ' + intentResult.intent);

      // Construct the prompt-data with history and objective
      let promptData = {
        userObjective: userObjective,
        history: `NOTE: When generating text responses, use ${responseTone} tone.
        HISTORY: Last 5 objectives provided by user:
        ${userObjectiveHistory.length > 0 ? userObjectiveHistory.map(i => '- ' + i.text).join('\n') : "NONE"}`
      };

      // Run the intent handler
      await handleIntent(intentResult.intent, promptData);

      console.log('Done processing.');
      addToThoughtProcess('Done processing.');

      // Add to history
      addToObjectiveHistory(userObjective, intentResult.intent);
      
      // Ready for next objective
      setIsThinking(false);
      setUserObjective('');
    }
    catch (e) {

      addToThoughtProcess('Error: ' + e.message);

      if (e?.response?.status === 401) {
        alert('Invalid key');
      }
      else {
        alert(e.message);
      }

      console.log(e);
      setIsThinking(false);
    }

  }

  const addToObjectiveHistory = (text, intent) => {
    let newHistory = userObjectiveHistory.slice();
    newHistory.push({ "text": text, "intent": intent });
    if (newHistory.length > 5) {
      newHistory.shift();
    }
    setUserObjectiveHistory(newHistory);
  }

  const handleToneChange = (e) => {
    setResponseTone(e.currentTarget.value);
  }

  const addToThoughtProcess = (text) => {
    thoughtProcess.push(text);
    setThoughtProcess(thoughtProcess);
  }

  return (
    <div className="App">
      <header className="App-header">
        App Commands GPT - Demo ✨
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
            <Button disabled={isThinking} onClick={(e) => { handleThink() }}>
              {isThinking && <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />Thinking, intent is {intent}...
              </>}
              {!isThinking && <>Go ✨</>}
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
          />

          <FoodAndDrinkApp
            commandingContext={(promptGeneratorHandler) => {
              foodAndDrinkAppGlobalPromptGenerator = promptGeneratorHandler;
            }}
            commandHandler={(command, handler) => {
              foodAndDrinkAppGlobalCommandHandlers.set(command, handler);
            }}
          />

          <TravelApp
            commandingContext={(promptGeneratorHandler) => {
              travelAppGlobalPromptGenerator = promptGeneratorHandler;
            }}
            commandHandler={(command, handler) => {
              travelAppGlobalCommandHandlers.set(command, handler);
            }}
          />

        </Stack>

      </div>

      <div className="App-ThoughtProcess">
        <Accordion defaultActiveKey="0">
          <Accordion.Item eventKey="0">
            <Accordion.Header>Thought process</Accordion.Header>
            <Accordion.Body>
              {thoughtProcess.length > 0 && <Button variant='danger' onClick={() => {setThoughtProcess([])}}>Clear</Button>}
              {thoughtProcess.length === 0 && <p>Nothing yet.</p>}       
              <div className="App-ThoughtProcess-Scrollable">
                {thoughtProcess.map((item, index) => {
                  return <p key={index}>{item}</p>
                })}
              </div>      
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>

    </div>
  );
}

export default App;
