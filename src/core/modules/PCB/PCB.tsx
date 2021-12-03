import { performance } from 'perf_hooks';
import { sleep } from '../../../utils';
import OSSimulator from '../../OSSimulator';
import { Operation, OperationTypes } from '../ProcessManager/Operation';
import { Process, ProcessStates } from '../ProcessManager/Process';

export class PCB {
  public activeProcessIdx = 0;

  public hasLock = false;

  constructor() {
    // null
  }

  public processActiveProcess(): void {
    const process =
      OSSimulator.getInstance().processManager.scheduler.processQueue[
        this.activeProcessIdx
      ];

    process.state = ProcessStates.RUN;

    const chanceForRandomIOInterrupt = (): boolean => {
      const percentChance = 5;

      const random = Math.random();

      if (random <= percentChance / 100) {
        flag = 15;
        return true;
      }

      return false;
    };

    let i = 0;
    let cyclesUsed = 0;

    process.startTime = parseFloat(performance.now().toFixed(3));

    let flag = 0;
    let didWait = false;

    const interval = setInterval(
      async () => {
        if (chanceForRandomIOInterrupt()) {
          process.state = ProcessStates.WAIT;
        }
        // use flag to wait n intervals
        if (flag > 0) {
          if (flag === 1) {
            process.state = ProcessStates.RUN;
            didWait = true;
          }
          flag += -1;
          return;
        }

        if (i < process.operations.length && !didWait) {
          if (
            process.operations[i].type == OperationTypes.FORK &&
            !process.ppid
          ) {
            process.createChildProcess();
          } else if (process.operations[i].type === OperationTypes.IO) {
            process.state = ProcessStates.WAIT;
            flag = 15;

            return;
          }

          if (didWait) didWait = false;

          if (process.criticalSection[0] === process.criticalSection[1]) {
            //critical section is of length 1
            if (i == process.criticalSection[0]) {
              this.getLock();
              cyclesUsed += process.operations[i].cycleLength;
              this.releaseLock();
            } else {
              cyclesUsed += process.operations[i].cycleLength;
            }
          } else {
            if (i === process.criticalSection[0]) {
              this.getLock();
              cyclesUsed += process.operations[i].cycleLength;
            } else if (i === process.criticalSection[1]) {
              cyclesUsed += process.operations[i].cycleLength;

              if (this.hasLock) {
                this.releaseLock();
              }
            } else {
              cyclesUsed += process.operations[i].cycleLength;
            }
          }

          i++;
        } else {
          clearInterval(interval);

          const currentTime = performance.now();

          process.stopTime = parseFloat(
            (currentTime + process.cyclesRequired).toFixed(3),
          );

          process.state = ProcessStates.EXIT;
          process.cyclesRemaining = 0;

          OSSimulator.getInstance().memoryManager.clearChunk(
            process.memoryRequired,
          );
          OSSimulator.getInstance().processManager.scheduler.processQueue.shift();
        }
      },
      OSSimulator.getInstance().multiThreaded
        ? OSSimulator.getInstance().clockSpeed /
            OSSimulator.getInstance().threadCount
        : OSSimulator.getInstance().clockSpeed,
    );
  }

  public getLock(): void {
    this.hasLock = true;
    OSSimulator.getInstance().processManager.scheduler.processQueue.forEach(
      (process: Process, i: number) => {
        if (
          i !== this.activeProcessIdx &&
          process.state !== ProcessStates.NEW
        ) {
          process.state = ProcessStates.WAIT;
        }
      },
    );
  }

  public releaseLock(): void {
    this.hasLock = false;
    OSSimulator.getInstance().processManager.scheduler.processQueue.forEach(
      (process: Process, i: number) => {
        if (
          i !== this.activeProcessIdx &&
          process.state !== ProcessStates.NEW
        ) {
          process.state = ProcessStates.READY;
        }
      },
    );
  }
}
