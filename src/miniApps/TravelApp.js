import { useState, useRef } from 'react';
import searchTravel from '../Skills/TravelAppSkills/Search.js';
import { Card, Spinner } from 'react-bootstrap';

function TravelApp(props) {

    const [isThinking, setIsThinking] = useState(false);
    const searchResults = useRef(null);

    props.commandingContext((promptData) => {
        return { 
          prompt: `You are an agent that returns information about Travel. You are given:

          (1) an objective that you are trying to achieve
          (2) a list of commands supported by the app
  
          You can issue these commands:
  
              SEARCH("TEXT") - Searches for food and drink recipies based on provided text
              SAY("TEXT") - Says the specified text
  
          Based on your given objective, issue whatever commands you believe will get you closest to achieving your goal.
  
          Here are some examples:
  
          EXAMPLE 1
          OBJECTIVE can be any of ["Taj Mahal"]
          YOUR COMMANDS: 
          [
              {
                 "command":"SEARCH",
                 "arguments":[
                    "Taj Mahal"
                 ]
              },
              {
                 "command":"SAY",
                 "arguments":[
                    "Searching for information about Taj Mahal"
                 ]
              }
           ]
  
           ${promptData.history}

           OBJECTIVE: ["${promptData.userObjective}"]
           YOUR COMMANDS:`
    }});

    props.commandHandler("SEARCH", async (args) => {
        try {
            setIsThinking(true);

            searchResults.current = '';

            let text = await searchTravel(args[0]);

            searchResults.current = text;

            setIsThinking(false);
        }
        catch (e) {
            console.log(e);

            setIsThinking(false);
        }
    });

    props.commandHandler("SAY", (args) => {
        try {
            alert(args[0]);
        }
        catch (e) {
            console.log(e);
        }
    });

    return (
        <div className="App-experience">
            <Card>
                <Card.Header>Travel App</Card.Header>
                <Card.Body>
                    <Card.Title>Search for places to visit</Card.Title>
                    <Card.Text>
                    {isThinking && <>
                        <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        />Thinking...
                    </>
                    }
                        {searchResults.current || (!isThinking && 'This is a Travel app. It can search for places to visit. Go ahead and search!')}
                    </Card.Text>
                </Card.Body>
            </Card>
        </div>
    );
}

export default TravelApp;