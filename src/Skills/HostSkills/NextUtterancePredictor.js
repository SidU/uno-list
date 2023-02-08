import promptGpt from '../../Skills/GPT.js';

export default async function getNextUtterance(userObjectiveHistory, key) {
    
    const prompt = `You are a Command Prediction agent.

    You are given a list of most recent commands issued by the user.
    
    You must predict the next command the user is most likely to issue to continue their objective.
    
    Your response must be in the form of { "text": "bla bla" }
    
    Your command must be related to the following apps:
    - ListApp
    - FoodAndDrinkApp
    - TravelApp
    
    User's commands (most recent at bottom)
    
    ${userObjectiveHistory.length > 0 ? userObjectiveHistory.map(i => '- ' + JSON.stringify(i)).join('\n') : "NONE"}
    
    Prediction:`;

    const results = await promptGpt(prompt, key);
    
    return results;
}