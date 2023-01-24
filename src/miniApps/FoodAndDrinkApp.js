import { useState, useRef } from 'react';
import searchFoodAndDrink from '../Skills/FoodAndDrinkAppSkills/Search.js';
import { Card, Spinner } from 'react-bootstrap';

function FoodAndDrinkApp(props) {

    const [isThinking, setIsThinking] = useState(false);
    const searchResults = useRef(null);

    props.commandingContext((promptData) => {
        return { 
          prompt: `You are an agent that returns information about Food & Drinks. You are given:

          (1) an objective that you are trying to achieve
          (2) a list of commands supported by the app
  
          You can issue these commands:
  
              SEARCH("TEXT") - Searches for food and drink recipies based on provided text
              SAY("TEXT") - Says the specified text
  
          Based on your given objective, issue whatever commands you believe will get you closest to achieving your goal.
  
          Here are some examples:
  
          EXAMPLE 1
          OBJECTIVE can be any of ["Cocktail recipes"]
          YOUR COMMANDS: 
          [
              {
                 "command":"SEARCH",
                 "arguments":[
                    "Cocktail recipes"
                 ]
              },
              {
                 "command":"SAY",
                 "arguments":[
                    "Searching for cocktail recipes"
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

            let text = await searchFoodAndDrink(args[0], props.LLMKey);

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
                <Card.Header>Food and Drink App</Card.Header>
                <Card.Body>
                    <Card.Title>Search for recipes</Card.Title>
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
                        {searchResults.current || (!isThinking && 'This is a food and drink app. It can search for recipies. Go ahead and search!')}
                    </Card.Text>
                </Card.Body>
            </Card>
        </div>
    );
}

export default FoodAndDrinkApp;