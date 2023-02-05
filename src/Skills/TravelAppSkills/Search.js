import promptGpt from '../../Skills/GPT.js';

export default async function searchTravel(userObjective, key) {
    
    const prompt = `You are a travel app. 
    You always return your response as { "text": "bla bla" }.
    Search for information about ${userObjective}.`;

    const results = await promptGpt(prompt, key);
    
    return results.text;
}