import { ListGroup, Form, Button, ButtonGroup, Spinner, Dropdown, Alert } from 'react-bootstrap';
import { useState, useRef } from 'react';
import getListTitle from './Skills/ListAppSkills/GetListTitle.js';
import getSuggestedItems from './Skills/ListAppSkills/GetSuggestedItems';
import getActions from './Skills/ListAppSkills/GetActions';

function ListApp(props) {

    const [userInput, setUserInput] = useState('');
    const [suggestedItems, setSuggestedItems] = useState([]);
    const [actions, setActions] = useState(['Add some items and then tap Think']);
    const [listTitle, setListTitle] = useState('Default List');
    const [isThinking, setIsThinking] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');   

    const lists = useRef(new Map([['Default List', []]]));

    props.commandingContext((userObjective) => {
        return `You are an agent controlling an app. You are given:

        (1) an objective that you are trying to achieve
        (2) a list of commands supported by the app

        You can issue these commands:

            ADD_ITEM_TO_LIST(X, "TEXT") - Add the specified text to the list with id x
            REMOVE_ITEM_FROM_LIST(X, Y) - Remove item X from the list whose name is Y
            SAY("TEXT") - Says the specified text

        Based on your given objective, issue whatever commands you believe will get you closest to achieving your goal.

        Here are some examples:

        EXAMPLE 1:
        OBJECTIVE can be any of ["Remind me to buy milk", "Must buy milk", "Need milk from grocery store", "We need milk"]
        YOUR COMMANDS: 
        [
            {
               "command":"ADD_ITEM_TO_LIST",
               "arguments":[
                  "Groceries",
                  "Milk"
               ]
            },
            {
               "command":"SAY",
               "arguments":[
                  "Milk added to groceries list"
               ]
            }
         ]

        EXAMPLE 2:
        OBJECTIVE ["We already have milk]
        YOUR COMMANDS: 
        [
            {
               "command":"REMOVE_ITEM_FROM_LIST",
               "arguments":[
                  "Groceries",
                  "Milk"
               ]
            },
            {
               "command":"SAY",
               "arguments":[
                  "Milk removed from groceries list"
               ]
            }
         ]

        OBJECTIVE: ["${userObjective}"]
        YOUR COMMANDS:`;
    });

    props.commandHandler("ADD_ITEM_TO_LIST", (args) => {
        try {
            addItemToList(args[0], args[1]);
        }
        catch (e) {
            console.log(e);
        }
    });

    props.commandHandler("SAY", (args) => {
        alert(args[0]);
    });

    props.commandHandler("REMOVE_ITEM_FROM_LIST", (args) => {
        try {
            deleteItemFromList(args[0], args[1]);
        }
        catch (e) {
            console.log(e);
        }
    });
  
    const handleItemChange = (e) => {
      setUserInput(e.currentTarget.value)
    }
  
    const handleItemAdd = () => {
      addItemToList(listTitle, userInput);
  
      setUserInput("");
    }
  
    const handleItemDelete = (itemToDelete) => {
      deleteItemFromList(listTitle, itemToDelete);
    }
  
    const handleSubmit = (e) => {
      e.preventDefault();
      handleItemAdd();
    }
  
    const addItemToList = (listName, item) => {
      lists.current.set(listName, [...lists.current.get(listName) ?? [], item]);

      // Activate the list we just added the item into.
      setListTitle(listName);

      if (item.length > 0) {
        handleAlertVisible(`Added ${item} to ${listName}`);
      }
    }
  
    const deleteItemFromList = (listName, item) => {

      lists.current.set(listName, lists.current.get(listName).filter(i => i !== item));

      // Activate the list we just removed the item from.
      setListTitle(listName);

      handleAlertVisible(`Removed ${item} from ${listName}`);
    }

    const handleAlertVisible = (message) => {
        setAlertMessage(message);
        setTimeout(() => {
            setAlertMessage('');
        }
        , 2000);
    }
  
    const getListItems = (listName) => {
      return lists.current.get(listName);
    }
  
    const renameList = (oldName, newName) => {

      // Rename the list.
      lists.current.set(newName, lists.current.get(oldName));
      lists.current.delete(oldName);
    }
  
    const handleThink = async () => {
  
      setIsThinking(true);
  
      try {

        const key = props.LLMKey;

        if (key.length === 0) {
          throw new Error('Please enter a key');
        }
  
        let items = getListItems(listTitle);
  
        // Give the current list a name. Move the items in the existing list to new list.
        let prevListTitle = listTitle;
        let newListTitle = await getListTitle(items, key);
        renameList(prevListTitle, newListTitle);
        setListTitle(newListTitle);
  
        // Use AI to determine suggested items.
        setSuggestedItems(await getSuggestedItems(items, listTitle, 5, key));
  
        // Use AI to determine actions.
        setActions(await getActions(items, listTitle, 5, key));
  
        setIsThinking(false);
      }
      catch (e) {
        if (e?.response.status === 401) {
          alert('Invalid key');
        }
        else {     
          alert(e.message);
        }
  
        setIsThinking(false);
        return;
      }
    }
  
    const handleSuggestionAccept = (suggestion) => {
      addItemToList(listTitle, suggestion);
      setSuggestedItems(suggestedItems.filter(i => i !== suggestion));
    }
  
    return (
      <div className="App-experience">
  
          <h4>{listTitle}</h4>
          <ListGroup>
            {getListItems(listTitle)?.map((item) => (
              item.length > 0 && <ListGroup.Item key={item}>{item} <Button variant='outline-danger' onClick={() => {handleItemDelete(item)}}>Delete</Button></ListGroup.Item>
            ))}
            <ListGroup.Item>
                {alertMessage && <Alert variant="success">{alertMessage}</Alert>}
                <div className='App-actions'>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                        <Dropdown>
                            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                                Pick a list
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                {Array.from(lists.current.keys()).map((listName) => (
                                    <Dropdown.Item as="button" eventKey={listName} key={listName} onClick={() => setListTitle(listName)}>{listName}</Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formItemText">
                            <Form.Control type="text" value={userInput} onChange={handleItemChange} placeholder="Add new item" />
                        </Form.Group>
                        <ButtonGroup>
                            <Button variant="primary" type="submit" disabled={userInput.length === 0}>
                                Add
                            </Button>
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
                            {!isThinking && <>Suggest 🪄</>}
                            </Button>
                        </ButtonGroup>
                        
                    </Form>
                    
                </div>
            </ListGroup.Item>
          </ListGroup>
          <h4>Suggested items</h4>
          <ListGroup>
            {suggestedItems.map((item) => (
              <ListGroup.Item key={item}>{item} <Button variant='outline-success' onClick={() => {handleSuggestionAccept(item)}}>Accept</Button></ListGroup.Item>
            ))}
            {suggestedItems.length === 0 && <ListGroup.Item>Add some items and tap Think</ListGroup.Item>}
          </ListGroup>
          <h4>Actions you can take</h4>
          <ListGroup>
            {actions.map((item) => (
              <ListGroup.Item key={item}>{item}</ListGroup.Item>
            ))}
          </ListGroup>
        </div>
    );
}

export default ListApp;