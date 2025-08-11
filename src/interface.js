import chalk from 'chalk';
import inquirer from 'inquirer';
import boxen from 'boxen';

export const createInputBox = () => {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'query',
      message: chalk.cyan('Enter your question:'),
      prefix: '  ',
      validate: (input) => {
        if (input.trim().length === 0) {
          return 'Please enter a question or instruction.';
        }
        return true;
      }
    }
  ]);
};

export const displayOutput = (text) => {
  const boxOptions = {
    title: chalk.green(' AI Response '),
    titleAlignment: 'center',
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'green',
    backgroundColor: 'black'
  };
  
  console.log(boxen(chalk.white(text), boxOptions));
};

export const displayError = (error) => {
  const boxOptions = {
    title: chalk.red(' Error '),
    titleAlignment: 'center',
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'red',
    backgroundColor: 'black'
  };
  
  console.log(boxen(chalk.red(error), boxOptions));
};

export const displayThinking = () => {
  console.log(chalk.yellow('  🤔 Thinking...'));
};

export const clearThinking = () => {
  process.stdout.write('\r\x1b[K'); // Clear current line
};