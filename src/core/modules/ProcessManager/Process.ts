import { Operation } from './Operation';

import { performance } from 'perf_hooks';

import { v4 as uuidv4 } from 'uuid';

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

  public memoryRequired: number;

  public pid: string;

  public ppid?: string;
  public cpid?: string;

  constructor(operations: Array<Operation>) {
    this.pid = uuidv4();

    this.arrivalTime = parseFloat(performance.now().toFixed(3));
    this.operations = operations;

    this.generateCriticalSection();

    this.calculateCycleReqForOperations();
    this.calculateMemoryReqForOperations();
  }

  private calculateCycleReqForOperations() {
    this.cyclesRequired = 0;

    this.operations.forEach((operation: Operation) => {
      this.cyclesRequired += operation.cycleLength;
    });

    this.cyclesRemaining = this.cyclesRequired;
  }

  private calculateMemoryReqForOperations() {
    this.memoryRequired = 0;

    this.operations.forEach((operation: Operation) => {
      console.log('MEM REQ OP', operation.memoryRequired);
      this.memoryRequired += operation.memoryRequired;
    });
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
