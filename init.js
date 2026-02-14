
import fs from 'fs';
import { execSync } from 'child_process';

console.log('\x1b[36m%s\x1b[0m', '--- JARVIS SYSTEM INITIALIZATION ---');

// 1. Check Python installation (Bridge requirement)
try {
    // Check both 'python' and 'python3' aliases
    let pythonCmd = 'python';
    try {
        execSync('python --version', { stdio: 'ignore' });
    } catch (e) {
        execSync('python3 --version', { stdio: 'ignore' });
        pythonCmd = 'python3';
    }
    console.log(`[SYSTEM] Python detected (${pythonCmd}).`);
} catch (e) {
    console.error('\x1b[31m%s\x1b[0m', '[ERROR] Python not found. Please install Python to run the Hardware Bridge.');
    process.exit(1);
}

// 2. Setup .env file if missing
if (!fs.existsSync('.env')) {
    console.log('\x1b[33m%s\x1b[0m', '[WARNING] .env file missing. Creating from template...');
    if (fs.existsSync('.env.example')) {
        fs.copyFileSync('.env.example', '.env');
        console.log('\x1b[32m%s\x1b[0m', '[ACTION] SUCCESS: .env file created.');
        console.log('\x1b[32m%s\x1b[0m', '[ACTION] PLEASE PASTE YOUR API KEY IN THE .env FILE AND RUN "npm run dev" AGAIN.');
        process.exit(1);
    } else {
        console.error('\x1b[31m%s\x1b[0m', '[ERROR] .env.example not found. Cannot automatically create .env.');
        process.exit(1);
    }
}

console.log('\x1b[32m%s\x1b[0m', '[SUCCESS] Pre-flight checks passed. Launching systems...');
