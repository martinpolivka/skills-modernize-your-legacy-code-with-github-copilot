'use strict';

const readlineSync = require('readline-sync');
const accounting = require('../index');

describe('Accounting application COBOL parity tests', () => {
  let logSpy;
  let questionSpy;

  beforeEach(() => {
    accounting.resetDataStore();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    questionSpy = jest.spyOn(readlineSync, 'question');
  });

  afterEach(() => {
    questionSpy.mockRestore();
    logSpy.mockRestore();
  });

  test('TC-001: menu is displayed on startup', () => {
    questionSpy.mockReturnValueOnce('4');

    accounting.mainProgram();

    expect(logSpy).toHaveBeenCalledWith('Account Management System');
    expect(logSpy).toHaveBeenCalledWith('1. View Balance');
    expect(logSpy).toHaveBeenCalledWith('2. Credit Account');
    expect(logSpy).toHaveBeenCalledWith('3. Debit Account');
    expect(logSpy).toHaveBeenCalledWith('4. Exit');
  });

  test('TC-002: initial balance is 1000.00', () => {
    accounting.operations('TOTAL ');

    expect(logSpy).toHaveBeenCalledWith('Current balance: 1000.00');
  });

  test('TC-003: credit updates and persists balance', () => {
    questionSpy.mockReturnValueOnce('250.50');

    accounting.operations('CREDIT');
    accounting.operations('TOTAL ');

    expect(logSpy).toHaveBeenCalledWith('Amount credited. New balance: 1250.50');
    expect(logSpy).toHaveBeenCalledWith('Current balance: 1250.50');
  });

  test('TC-004: debit succeeds when funds are sufficient', () => {
    questionSpy.mockReturnValueOnce('200.00');

    accounting.operations('DEBIT ');
    accounting.operations('TOTAL ');

    expect(logSpy).toHaveBeenCalledWith('Amount debited. New balance: 800.00');
    expect(logSpy).toHaveBeenCalledWith('Current balance: 800.00');
  });

  test('TC-005: debit with insufficient funds keeps balance unchanged', () => {
    questionSpy.mockReturnValueOnce('999999.99');

    accounting.operations('DEBIT ');
    accounting.operations('TOTAL ');

    expect(logSpy).toHaveBeenCalledWith('Insufficient funds for this debit.');
    expect(logSpy).toHaveBeenCalledWith('Current balance: 1000.00');
  });

  test('TC-006: invalid menu option is rejected and loop continues', () => {
    questionSpy
      .mockReturnValueOnce('9')
      .mockReturnValueOnce('4');

    accounting.mainProgram();

    expect(logSpy).toHaveBeenCalledWith('Invalid choice, please select 1-4.');
    expect(logSpy).toHaveBeenCalledWith('Exiting the program. Goodbye!');
  });

  test('TC-007: exit option terminates application', () => {
    questionSpy.mockReturnValueOnce('4');

    accounting.mainProgram();

    expect(logSpy).toHaveBeenCalledWith('Exiting the program. Goodbye!');
  });

  test('TC-008: balance persists across operations in same run', () => {
    questionSpy
      .mockReturnValueOnce('2')
      .mockReturnValueOnce('100.00')
      .mockReturnValueOnce('1')
      .mockReturnValueOnce('3')
      .mockReturnValueOnce('50.00')
      .mockReturnValueOnce('1')
      .mockReturnValueOnce('4');

    accounting.mainProgram();

    expect(logSpy).toHaveBeenCalledWith('Amount credited. New balance: 1100.00');
    expect(logSpy).toHaveBeenCalledWith('Current balance: 1100.00');
    expect(logSpy).toHaveBeenCalledWith('Amount debited. New balance: 1050.00');
    expect(logSpy).toHaveBeenCalledWith('Current balance: 1050.00');
  });

  test('TC-009: exact-balance debit is allowed and reaches zero', () => {
    questionSpy.mockReturnValueOnce('1000.00');

    accounting.operations('DEBIT ');
    accounting.operations('TOTAL ');

    expect(logSpy).toHaveBeenCalledWith('Amount debited. New balance: 0.00');
    expect(logSpy).toHaveBeenCalledWith('Current balance: 0.00');
  });

  test('TC-010: new process run starts with initial balance', () => {
    questionSpy.mockReturnValueOnce('250.00');
    accounting.operations('CREDIT');
    expect(accounting.dataProgram('READ', 0)).toBeCloseTo(1250.0, 2);

    jest.resetModules();
    const freshAccounting = require('../index');

    expect(freshAccounting.dataProgram('READ', 0)).toBeCloseTo(1000.0, 2);
  });
});
