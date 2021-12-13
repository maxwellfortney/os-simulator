import { ProcessManager } from './modules/ProcessManager/ProcessManager';
import * as readline from 'readline';
import { generateRandomProcess } from '../utils';
import { PCB } from './modules/PCB/PCB';
import { MemoryManager } from './modules/MemoryManager/MemoryManager';

export default class OSSimulator {
  private static instance: OSSimulator;

  public processManager: ProcessManager;
  public memoryManager: MemoryManager;

  public pcb: PCB;

  public multiCore = true;
  public multiThreaded = true;

  public coreCount = 2;
  public threadCount = 12;
  public clockSpeed = 100;

  private constructor() {
    this.processManager = new ProcessManager();
    this.memoryManager = new MemoryManager();
  }

  static getInstance(): OSSimulator {
    if (!this.instance) {
      this.instance = new OSSimulator();
    }
    return this.instance;
  }

  public startOS(): void {
    this.pcb = new PCB();
    this.processManager.loadScheduler('SJF');
    this.processManager.startScheduler();

    this.startUI();
  }

  private startUI(): void {
    this.clearConsole();
    this.printProcesses();
  }

  private async printProcesses() {
    if (this.memoryManager.cached) {
      this.memoryManager.cached = false;
    }

    const interval = setInterval(async () => {
      if (this.processManager.scheduler.processQueue.length === 0) {
        console.log(`${this.processManager.scheduler.type} Completed Queue`);
        console.log(
          `Memory: ${this.memoryManager.availableMemory}/${this.memoryManager.maxMemory}`,
        );
        console.log(
          `MultiCore: ${
            this.multiCore ? `true, ${this.coreCount} cores` : 'false'
          }`,
        );
        console.log(
          `MuliThreaded: ${
            this.multiThreaded ? `true, ${this.threadCount} threads` : 'false'
          }`,
        );
        console.table(this.processManager.processes);
      } else {
        console.log(`${this.processManager.scheduler.type} Scheduler Queue`);
        console.log(`PCB has lock: ${this.pcb.hasLock}`);
        console.log(
          `Memory: ${this.memoryManager.availableMemory}/${this.memoryManager.maxMemory}`,
        );
        console.log(
          `MultiCore: ${
            this.multiCore ? `true, ${this.coreCount} cores` : 'false'
          }`,
        );
        console.log(
          `MuliThreaded: ${
            this.multiThreaded ? `true, ${this.threadCount} threads` : 'false'
          }`,
        );
        console.table(this.processManager.scheduler.processQueue);
      }

      if (this.processManager.scheduler.processingComplete()) {
        if (!this.memoryManager.cached) {
          this.memoryManager.saveToHDD();
          this.memoryManager.cached = true;
        }
        console.log('\nProcessing complete');
        clearInterval(interval);
        const genProcess = await this.askQuestion(
          'Would you like to generate a new Process?: Y|N\n',
        );

        if (genProcess.toLowerCase() == 'y') {
          let numProcesses: string | number = await this.askQuestion(
            'How many processes would you like to generate?: (int) \n',
          );

          try {
            numProcesses = parseInt(numProcesses);
          } catch (e) {
            console.log('Failed to parse number of required processes');
            process.exit(1);
          }

          for (let i = 0; i < numProcesses; i++) {
            const randProcess = generateRandomProcess();

            this.processManager.processes.push(randProcess);
          }

          this.processManager.scheduler.start();

          await this.printProcesses();
        } else {
          console.log('N selected. Exiting program');
          process.exit();
        }
      }
      setTimeout(() => {
        this.clearConsole();
      }, 100);
    }, 100);
  }

  private clearConsole(): void {
    console.clear();
  }

  private askQuestion(query): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) =>
      rl.question(query, (ans) => {
        rl.close();
        resolve(ans);
      }),
    );
  }
}
