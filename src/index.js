import { displayLogo } from './logo.js';
import { createInputBox, displayOutput, displayError, displayThinking, clearThinking } from './interface.js';
import { initializeOpenAI, getCompletion } from './openai.js';
import chalk from 'chalk';

const main = async () => {
  // Display logo
  displayLogo();
  
  try {
    // Initialize OpenAI
    initializeOpenAI();
    
    while (true) {
      try {
        // Get user input
        const { query } = await createInputBox();
        
        // Handle exit commands
        if (query.toLowerCase() === 'exit' || query.toLowerCase() === 'quit') {
          console.log(chalk.cyan('\n  Goodbye! Thanks for using Co-Physicist! 👋\n'));
          process.exit(0);
        }
        
        // Show thinking indicator
        displayThinking();
        
        // Get AI response
        const response = await getCompletion(query);
        
        // Clear thinking indicator and display response
        clearThinking();
        displayOutput(response);
        
      } catch (error) {
        clearThinking();
        displayError(error.message);
      }
    }
    
  } catch (error) {
    displayError(`Initialization error: ${error.message}`);
    console.log(chalk.yellow('\n  Please make sure you have set your OPENAI_API_KEY environment variable.'));
    console.log(chalk.gray('  You can create a .env file in this directory with:'));
    console.log(chalk.gray('  OPENAI_API_KEY=your_api_key_here\n'));
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.cyan('\n\n  Goodbye! Thanks for using Co-Physicist! 👋\n'));
  process.exit(0);
});

main().catch(error => {
  displayError(`Unexpected error: ${error.message}`);
  process.exit(1);
});