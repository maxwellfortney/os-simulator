import { performance } from 'perf_hooks';
import { getIntervalSpeed } from '../../../../../utils';
import OSSimulator from '../../../../OSSimulator';
import { Process, ProcessStates } from '../../Process';

export class SJF {
  public type = 'SJF';
  public processQueue: Array<Process> = [];

  constructor() {
    // null
  }

  public start(): void {
    this.sortProcessesByCyclesRequired();
    this.loadProcessesIntoQueue();

    const interval = setInterval(() => {
      this.loadRemainingProcessesIntoQueue();

      if (this.processQueue.length > 0) {
        this.sortProcessesByCyclesRequired();

        const currentTime = performance.now();

        for (let i = 0; i < this.processQueue.length; i++) {
          // If the state of i is ready to be run
          if (this.processQueue[i].state === ProcessStates.READY && i === 0) {
            OSSimulator.getInstance().pcb.processActiveProcess();

            // If the state of i is running
          } else if (this.processQueue[i].state === ProcessStates.READY) {
            this.processQueue[i].waitTime = parseFloat(
              (currentTime - this.processQueue[i].arrivalTime).toFixed(3),
            );
          }
        }
      } else {
        clearInterval(interval);
      }
      // Schduler runs on cycle of 2 iterations per second
    }, getIntervalSpeed());
  }

  private sortProcessesByCyclesRequired() {
    OSSimulator.getInstance().processManager.processes.sort(
      (a: Process, b: Process) => {
        return a.cyclesRequired - b.cyclesRequired;
      },
    );
  }

  private loadProcessesIntoQueue() {
    OSSimulator.getInstance().processManager.processes.forEach(
      (process: Process) => {
        if (process.state !== ProcessStates.EXIT) {
          if (
            OSSimulator.getInstance().memoryManager.canFit(
              process.memoryRequired,
            )
          ) {
            process.state = ProcessStates.READY;
            OSSimulator.getInstance().memoryManager.addChunk(
              process.memoryRequired,
            );
          }
        }
      },
    );

    // Make this a clone not direct
    this.processQueue = this.filterCompletedProcesses(
      OSSimulator.getInstance().processManager.processes.map(
        (processes) => processes,
      ),
    );
  }

  private loadRemainingProcessesIntoQueue() {
    OSSimulator.getInstance().processManager.processes.forEach(
      (process: Process) => {
        if (process.state === ProcessStates.NEW) {
          if (
            OSSimulator.getInstance().memoryManager.canFit(
              process.memoryRequired,
            )
          ) {
            process.state = ProcessStates.READY;
            OSSimulator.getInstance().memoryManager.addChunk(
              process.memoryRequired,
            );
          }
        }
      },
    );

    // Make this a clone not direct
    this.processQueue = this.filterCompletedProcesses(
      OSSimulator.getInstance().processManager.processes.map(
        (processes) => processes,
      ),
    );
  }

  private filterCompletedProcesses(processes: Array<Process>) {
    const ret: Array<Process> = [];

    processes.forEach((process) => {
      if (process.state !== ProcessStates.EXIT) {
        ret.push(process);
      }
    });

    return ret;
  }

  public printProcesses(): void {
    // console.table(OSSimulator.getInstance().processManager.processes);
  }

  public clearConsole(): void {
    console.clear();
  }

  public processingComplete(): boolean {
    let complete = true;
    this.processQueue.forEach((process: Process) => {
      if (process.state !== ProcessStates.EXIT) {
        complete = false;
      }
    });

    return complete;
  }
}
