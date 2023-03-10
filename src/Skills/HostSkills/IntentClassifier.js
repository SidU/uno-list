import promptGpt from '../../Skills/GPT.js';

export default async function getIntent(userObjective, userObjectiveHistory, key) {
    
    const prompt = `INTENT MUST BE ONE OF FoodAndDrink, ListApp. DO NOT CREATE NEW INTENTS.

    EXAMPLE 1) User is searching for food recipies.
    User: I want to learn more about Indian food recipies.
    AI: { "intent": "FoodAndDrinkApp" }   
    
    EXAMPLE 2) User wants to add an item to a list.
    User: Need to buy milk
    AI: { "intent": "ListApp" }

    EXAMPLE 3) User is searching for information about Taj Mahal.
    User: Taj Mahal
    AI: { "intent": "TravelApp" }
    
    HISTORY OF LAST 5 USER UTTERANCES
    ${userObjectiveHistory.length > 0 ? userObjectiveHistory.map(i => '- ' + i.text).join('\n') : "NONE"}
    
    NOTE: When user's intent is unclear, continue with previous intent.
    
    User: ${userObjective}
    AI:`;

    const results = await promptGpt(prompt, key);
    
    return results;
}