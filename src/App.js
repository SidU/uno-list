import './App.css';
import { ListGroup, Form, Button, ButtonGroup, Spinner } from 'react-bootstrap';
import { useState } from 'react';
import getListTitle from './Skills/GetListTitle.js';
import getSuggestedItems from './Skills/GetSuggestedItems';
import getActions from './Skills/GetActions';


function App() {

  const [userInput, setUserInput] = useState('');
  const [items, setItems] = useState([]);
  const [suggestedItems, setSuggestedItems] = useState(['Add some items and then tap Think']);
  const [actions, setActions] = useState(['Add some items and then tap Think']);
  const [key, setKey] = useState('');
  const [listTitle, setListTitle] = useState('Add some items here');
  const [isThinking, setIsThinking] = useState(false);

  const handleItemChange = (e) => {
    setUserInput(e.currentTarget.value)
  }

  const handleAdd = () => {
    setItems([...items, userInput]);
    setUserInput("");
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAdd();
  }

  const handleKeyChange = (e) => {
    setKey(e.currentTarget.value)
  }

  const handleThink = async () => {

    setIsThinking(true);

    try {
      if (key.length === 0) {
        throw new Error('Please enter a key');
      }

      setListTitle(await getListTitle(items, key));

      setSuggestedItems(await getSuggestedItems(items, listTitle, 5, key));

      setActions(await getActions(items, listTitle, 5, key));

      setIsThinking(false);
    }
    catch (e) {
      alert(e.message);
      setIsThinking(false);
      return;
    }
  }

  const handleDeleteClick = (itemToDelete) => {
    setItems(items.filter(i => i !== itemToDelete));
  }

  return (
    <div className="App">
      <header className="App-header">
        Uno-list.ai
      </header>
        <div className='App-container'>
        <h4>{listTitle}</h4>
        <ListGroup>
          {items.map((item) => (
            <ListGroup.Item key={item}>{item} <Button variant='outline-danger' onClick={() => {handleDeleteClick(item)}}>Delete</Button></ListGroup.Item>
          ))}
          <ListGroup.Item>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formItemText">
                <Form.Control type="text" value={userInput} onChange={handleItemChange} placeholder="Add new item" />
              </Form.Group>
              <ButtonGroup>
                <Button variant="primary" type="submit" disabled={userInput.length === 0}>
                    Add
                </Button>
                <Button onClick={(e) => {handleThink()}}>
                {isThinking && <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />Thinking...
                </>}
                {!isThinking && <>Think</>}
                </Button>
              </ButtonGroup>
            </Form>
          </ListGroup.Item>
        </ListGroup>
        <h4>Suggested items</h4>
        <ListGroup>
          {suggestedItems.map((item) => (
            <ListGroup.Item key={item}>{item}</ListGroup.Item>
          ))}
        </ListGroup>
        <h4>Actions you can take</h4>
        <ListGroup>
          {actions.map((item) => (
            <ListGroup.Item key={item}>{item}</ListGroup.Item>
          ))}
        </ListGroup>
        <h4>Configure</h4>
        <Form>
          <Form.Group className="mb-3" controlId="formItemText">
            <Form.Control type="password" value={key} onChange={handleKeyChange} placeholder="Key" />
            <a href='https://beta.openai.com/account/api-keys'>Get</a>
          </Form.Group>
        </Form>
      </div>
    </div>
  );
}

export default App;
