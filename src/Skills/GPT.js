import promptGptPlainText from './GPTPlainText';

export default async function promptGpt (prompt, key, config) {

  return JSON.parse(await promptGptPlainText(prompt, key, config));

}