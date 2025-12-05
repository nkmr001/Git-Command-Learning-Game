import { gitCommands } from '../src/data/gitCommands';
import { advancedScenarios } from '../src/components/AdvancedQuizData';
import { executeGitCommand, initialRepositoryState, RepositoryState } from '../src/utils/gitSimulator';

console.log('Starting verification of all quizzes...');

let passed = 0;
let failed = 0;

// Verify Basic Commands
console.log('\n--- Verifying Basic Commands ---');
gitCommands.forEach(command => {
    console.log(`Testing command: ${command.name}`);
    let currentState = command.practice.initialState ? JSON.parse(JSON.stringify(command.practice.initialState)) : JSON.parse(JSON.stringify(initialRepositoryState));

    let commandFailed = false;
    command.practice.tasks.forEach((task, index) => {
        const result = executeGitCommand(task.expectedCommand, task.expectedCommand, currentState);
        if (!result.success) {
            console.error(`  [FAIL] Task ${index + 1}: ${task.instruction}`);
            console.error(`    Expected: ${task.expectedCommand}`);
            console.error(`    Output: ${result.output}`);
            commandFailed = true;
        } else {
            // Update state for next task
            if (result.newState) {
                currentState = result.newState;
            }
        }
    });

    if (commandFailed) {
        failed++;
        console.log(`  [FAILED] ${command.name}`);
    } else {
        passed++;
        console.log(`  [PASSED] ${command.name}`);
    }
});

// Verify Advanced Scenarios
console.log('\n--- Verifying Advanced Scenarios ---');
advancedScenarios.forEach(scenario => {
    console.log(`Testing scenario: ${scenario.title}`);
    let currentState = JSON.parse(JSON.stringify(scenario.initialState));

    let scenarioFailed = false;
    scenario.tasks.forEach((task, index) => {
        const result = executeGitCommand(task.expectedCommand, task.expectedCommand, currentState);
        if (!result.success) {
            console.error(`  [FAIL] Task ${index + 1}: ${task.instruction}`);
            console.error(`    Expected: ${task.expectedCommand}`);
            console.error(`    Output: ${result.output}`);
            scenarioFailed = true;
        } else {
            if (result.newState) {
                currentState = result.newState;
            }
        }
    });

    if (scenarioFailed) {
        failed++;
        console.log(`  [FAILED] ${scenario.title}`);
    } else {
        passed++;
        console.log(`  [PASSED] ${scenario.title}`);
    }
});

console.log('\n--- Verification Summary ---');
console.log(`Total: ${passed + failed}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
