import promptGpt from '../../Skills/GPT.js';

export default async function getListTitle(items, key) {
    
    const prompt = `You are a list naming AI. Given a list of items, you provide it an appropriate title in the form of JSON.

    Human:
    * Eggplant
    * Milk
    * Cabbage
    
    AI: {"listTitle": "Grocery List"}
    
    Human: 
    ${items.map(i => '* ' + i).join('\n')}
    
    AI:`;

    const results = await promptGpt(prompt, key);
    
    return results.listTitle;
}