import promptGpt from '../Skills/GPT.js';

export default async function getSuggestedItems(items, listTitle, count, key) {
    
    const prompt = `You are a list management AI. Given the following list of ${listTitle}, you will suggest ${count} additional items in the form of JSON.

    Human:
    * Eggplant
    * Milk
    * Cabbage
    
    AI: ["Carrots", "Potatos"]
    
    Human: 
    ${items.map(i => '* ' + i).join('\n')}
    
    AI:`;

    const results = await promptGpt(prompt, key);
    
    return results;
}