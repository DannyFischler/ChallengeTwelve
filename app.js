const runPrompts = require('./prompts');

async function main() {
    console.log("Employee Manager App");
    await runPrompts();
    console.log("Goodbye!");
}

main();
