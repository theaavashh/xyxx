#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const colors = require('colors');

console.log('🛍️ Distributor Setup & Test'.bold.cyan);
console.log('========================\n');

// Function to run a command and return result
function runCommand(command, args, description) {
  return new Promise((resolve) => {
    console.log(`📋 ${description}...`.yellow);
    
    const child = spawn('node', [path.join(__dirname, args)], {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${description} completed!\n`.green);
        resolve(true);
      } else {
        console.log(`❌ ${description} failed with code ${code}\n`.red);
        resolve(false);
      }
    });

    child.on('error', (error) => {
      console.log(`❌ ${description} failed: ${error.message}\n`.red);
      resolve(false);
    });
  });
}

// Main menu function
async function showMenu() {
  console.log('Choose an option:\n');
  console.log('1️⃣  Create approved distributor with credentials'.blue);
  console.log('2️⃣  Test distributor panel login'.blue);
  console.log('3️⃣  Both: Create distributor AND test login'.blue);
  console.log('4️⃣  Check if distributor exists'.blue);
  console.log('5️⃣  Exit'.gray);
  console.log('');

  // Get user input
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter your choice (1-5): '.yellow, async (answer) => {
    rl.close();

    switch (answer.trim()) {
      case '1':
        await runCommand('node', ['create-approved-distributor.js'], 'Creating approved distributor');
        break;
        
      case '2':
        await runCommand('node', ['test-distributor-login.js'], 'Testing distributor login');
        break;
        
      case '3':
        console.log('🔄 Running both scripts sequentially...\n'.cyan);
        const created = await runCommand('node', ['create-approved-distributor.js'], 'Creating approved distributor');
        if (created) {
          console.log('⏳ Waiting 2 seconds before testing login...\n'.yellow);
          await new Promise(resolve => setTimeout(resolve, 2000));
          await runCommand('node', ['test-distributor-login.js'], 'Testing distributor login');
        }
        break;
        
      case '4':
        await runCommand('node', ['test-distributor-login.js'], 'Checking distributor user');
        break;
        
      case '5':
        console.log('👋 Goodbye!\n'.green);
        process.exit(0);
        
      default:
        console.log('❌ Invalid choice. Please run script again.\n'.red);
        process.exit(1);
    }

    // Ask if user wants to continue
    const readline2 = require('readline');
    const rl2 = readline2.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl2.question('\nRun another operation? (y/n): '.yellow, (answer2) => {
      rl2.close();
      if (answer2.toLowerCase().trim() === 'y' || answer2.toLowerCase().trim() === 'yes') {
        console.log('\n' + '='.repeat(50));
        showMenu();
      } else {
        console.log('\n👋 Goodbye!\n'.green);
        process.exit(0);
      }
    });
  });
}

// Function to display status
function displayStatus() {
  console.log('📊 Current Status:\n'.cyan);
  
  const fs = require('fs');
  
  // Check if distributor API is running
  const { spawn } = require('child_process');
  const curlProcess = spawn('curl', ['-s', 'http://localhost:4444/api/health'], {
    stdio: 'pipe',
    shell: true
  });
  
  let apiStatus = 'Unknown';
  
  curlProcess.on('close', (code) => {
    if (code === 0) {
      apiStatus = 'Running ✅';
    } else {
      apiStatus = 'Not running ❌';
    }
    
    console.log(`API Server (${API_BASE_URL}): ${apiStatus}`.white);
    
    // Check if test files exist
    const scriptsExist = fs.existsSync(path.join(__dirname, 'create-approved-distributor.js')) && 
                       fs.existsSync(path.join(__dirname, 'test-distributor-login.js'));
    
    console.log(`Script Files: ${scriptsExist ? 'Available ✅' : 'Missing ❌'}`.white);
    
    console.log('\n📝 Test Credentials:\n'.cyan);
    console.log(`Email: ${'test.distributor@example.com'.green}`);
    console.log(`Password: ${'Test123456!'.green}`);
    console.log(`Username: ${'testdistributor'.green}`);
    
    console.log('\n');
  });
}

// Check for command line arguments
const args = process.argv.slice(2);

if (args.length > 0) {
  switch (args[0].toLowerCase()) {
    case 'create':
    case '1':
      runCommand('node', ['create-approved-distributor.js'], 'Creating approved distributor');
      break;
      
    case 'test':
    case '2':
      runCommand('node', ['test-distributor-login.js'], 'Testing distributor login');
      break;
      
    case 'both':
    case '3':
      console.log('🔄 Running both scripts sequentially...\n'.cyan);
      runCommand('node', ['create-approved-distributor.js'], 'Creating approved distributor')
        .then(created => {
          if (created) {
            console.log('⏳ Waiting 2 seconds before testing login...\n'.yellow);
            setTimeout(() => {
              runCommand('node', ['test-distributor-login.js'], 'Testing distributor login');
            }, 2000);
          }
        });
      break;
      
    case 'check':
    case '4':
      displayStatus();
      break;
      
    case 'help':
    case '--help':
    case '-h':
      console.log(`
🛍️  Distributor Setup Script - Usage:

Commands:
  create, 1          - Create approved distributor with credentials
  test, 2           - Test distributor panel login  
  both, 3           - Create distributor AND test login
  check, 4           - Check system status
  help, -h           - Show this help

Interactive Mode:
  node setup-distributor.js (no args for menu)

Examples:
  node setup-distributor.js create
  node setup-distributor.js both
  node setup-distributor.js check
      `.cyan);
      break;
      
    default:
      console.log('❌ Unknown command. Use "help" for usage.\n'.red);
      process.exit(1);
  }
} else {
  // Interactive mode
  showMenu();
}