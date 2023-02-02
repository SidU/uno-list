const gpt = require('../Helpers/GPT');

module.exports = async function (context, req) {
    
    try {
        const prompt = (req.query.prompt || (req.body && req.body.prompt));
        const config = (req.query.config || (req.body && req.body.config));
    
        const responseMessage = await gpt(prompt, process.env.OPENAI_API_KEY, config);
    
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: responseMessage
        };
    }
    catch(e) {
        context.res = {
            status: 500,
            body: e
        };
    }
 
}