'use strict';

const readlineSync = require('readline-sync');

// DataProgram equivalent: in-memory balance scoped to one process run.
let storageBalance = 1000.0;

function dataProgram(passedOperation, balance) {
  if (passedOperation === 'READ') {
    return storageBalance;
  }

  if (passedOperation === 'WRITE') {
    storageBalance = balance;
    return storageBalance;
  }

  return balance;
}

function operations(passedOperation) {
  if (passedOperation === 'TOTAL ') {
    const finalBalance = dataProgram('READ', 0);
    console.log(`Current balance: ${finalBalance.toFixed(2)}`);
    return;
  }

  if (passedOperation === 'CREDIT') {
    const amountInput = readlineSync.question('Enter credit amount: ');
    const amount = Number.parseFloat(amountInput);

    if (Number.isNaN(amount)) {
      console.log('Invalid amount. Please enter a numeric value.');
      return;
    }

    let finalBalance = dataProgram('READ', 0);
    finalBalance += amount;
    dataProgram('WRITE', finalBalance);
    console.log(`Amount credited. New balance: ${finalBalance.toFixed(2)}`);
    return;
  }

  if (passedOperation === 'DEBIT ') {
    const amountInput = readlineSync.question('Enter debit amount: ');
    const amount = Number.parseFloat(amountInput);

    if (Number.isNaN(amount)) {
      console.log('Invalid amount. Please enter a numeric value.');
      return;
    }

    let finalBalance = dataProgram('READ', 0);

    if (finalBalance >= amount) {
      finalBalance -= amount;
      dataProgram('WRITE', finalBalance);
      console.log(`Amount debited. New balance: ${finalBalance.toFixed(2)}`);
    } else {
      console.log('Insufficient funds for this debit.');
    }
  }
}

function mainProgram() {
  let continueFlag = true;

  while (continueFlag) {
    console.log('--------------------------------');
    console.log('Account Management System');
    console.log('1. View Balance');
    console.log('2. Credit Account');
    console.log('3. Debit Account');
    console.log('4. Exit');
    console.log('--------------------------------');

    const userChoiceInput = readlineSync.question('Enter your choice (1-4): ');
    const userChoice = Number.parseInt(userChoiceInput, 10);

    switch (userChoice) {
      case 1:
        operations('TOTAL ');
        break;
      case 2:
        operations('CREDIT');
        break;
      case 3:
        operations('DEBIT ');
        break;
      case 4:
        continueFlag = false;
        break;
      default:
        console.log('Invalid choice, please select 1-4.');
    }
  }

  console.log('Exiting the program. Goodbye!');
}

function resetDataStore() {
  storageBalance = 1000.0;
}

if (require.main === module) {
  mainProgram();
}

module.exports = {
  dataProgram,
  operations,
  mainProgram,
  resetDataStore,
};
