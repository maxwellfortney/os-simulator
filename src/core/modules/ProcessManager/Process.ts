import { Operation } from './Operation';

import { performance } from 'perf_hooks';

export enum ProcessStates {
  NEW = 'NEW',
  READY = 'READY',
  RUN = 'RUN',
  WAIT = 'WAIT',
  EXIT = 'EXIT',
}

export class Process {
  public state: ProcessStates = ProcessStates.NEW;
  public operations: Array<Operation> = [];
  public cyclesRequired: number;

  public arrivalTime: number;
  public startTime = 0;
  public stopTime = 0;
  public waitTime = 0;
  public cyclesRemaining: number;

  public criticalSection: [number, number];

  constructor(operations: Array<Operation>) {
    this.arrivalTime = parseFloat(performance.now().toFixed(3));
    this.operations = operations;

    this.generateCriticalSection();

    this.calculateCycleReqForOperations();
  }

  private calculateCycleReqForOperations() {
    this.cyclesRequired = 0;

    this.operations.forEach((operation: Operation) => {
      this.cyclesRequired += operation.cycleLength;
    });

    this.cyclesRemaining = this.cyclesRequired;
  }

  private generateCriticalSection() {
    const lower = Math.ceil(
      Math.random() * (this.operations.length - 1 - 0) + 0,
    );
    const upper = Math.ceil(
      Math.random() * (this.operations.length - 1 - lower) + lower,
    );

    this.criticalSection = [lower, upper];
  }
}
