import axios from 'axios';

export default async function promptGpt (prompt, key, config) {

  console.log(prompt);

    try {
      const response = await axios(
        {
            method: 'post',
            url: 'https://api.openai.com/v1/completions',
            data: config ?? {
                "model": "text-davinci-003",
                "prompt": prompt,
                "temperature": 0.3,
                "max_tokens": 1514,
                "top_p": 1,
                "frequency_penalty": 0,
                "presence_penalty": 0
            },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            }
        }
      );

      return JSON.parse(response.data.choices[0].text);
    }
    catch(e) {
      console.log(e);
      throw e;
    }
    
  }