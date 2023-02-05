import axios from 'axios';

export default async function promptGptPlainText (prompt, key, config) {

    console.log(prompt);

    try {
      const response = await axios.post(
        'api/runPrompt',
        {
            config: config,
            prompt: prompt
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }
      );

      console.log(JSON.stringify(response.data, null, 2));

      return response.data;
    }
    catch(e) {
      console.log(e);
      throw e;
    }
    
  }