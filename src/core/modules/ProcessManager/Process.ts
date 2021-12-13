import { Operation } from './Operation';

import { performance } from 'perf_hooks';

import { v4 as uuidv4 } from 'uuid';
import OSSimulator from '../../OSSimulator';

import { EventEmitter } from 'events';

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

  public emitter: EventEmitter;

  public messages: string[] = [];

  constructor(operations: Array<Operation>) {
    this.emitter = new EventEmitter();
    this.pid = uuidv4();

    this.arrivalTime = parseFloat(performance.now().toFixed(3));
    this.operations = operations;

    this.generateCriticalSection();

    this.calculateCycleReqForOperations();
    this.calculateMemoryReqForOperations();

    this.emitter.on(`${this.pid}`, (message: string) => {
      this.messages.push(message);
    });
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

  public createChildProcess() {
    const cProcess = new Process(this.operations);

    cProcess.ppid = this.pid;
    this.cpid = cProcess.pid;

    OSSimulator.getInstance().processManager.processes.push(cProcess);

    OSSimulator.getInstance().processManager.scheduler.processQueue.push(
      cProcess,
    );
  }

  public sendMessage(processIdx: number, message: string): void {
    OSSimulator.getInstance().processManager.processes[
      processIdx
    ].recieveMessage(message);
  }

  public recieveMessage(message: string): void {
    this.messages.push(message);
  }

  public sendMessageEvent(pid: string, message: string): void {
    this.emitter.emit(`${pid}`, message);
  }
}
