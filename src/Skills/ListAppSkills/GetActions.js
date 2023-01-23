import promptGpt from '../../Skills/GPT.js';

export default async function getActions(items, listTitle, count, key) {
    
    const prompt = `You are a list management AI. Given the following list of ${listTitle}, suggest ${count} things the narrator can do to achieve their goal faster in the form of JSON.

    Human:
    * Eggplant
    * Milk
    * Cabbage
    
    AI: [
        "Make a list of all items needed for grocery shopping.", 
        "Check local store ads for sales and discounts.", 
        "Create a budget and stick to it.", 
        "Compare prices between different stores.", 
        "Try online grocery shopping for convenience."
    ]

    Human: ${items.map(i => '* ' + i).join('\n')}
    AI:`;

    const results = await promptGpt(prompt, key);
    
    return results;
}