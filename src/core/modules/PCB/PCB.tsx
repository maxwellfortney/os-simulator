import { performance } from 'perf_hooks';
import OSSimulator from '../../OSSimulator';
import { Operation } from '../ProcessManager/Operation';
import { Process, ProcessStates } from '../ProcessManager/Process';

export class PCB {
  public activeProcessIdx = 0;

  public hasLock = false;

  constructor() {
    // null
  }

  public processActiveProcess() {
    const process =
      OSSimulator.getInstance().processManager.scheduler.processQueue[
        this.activeProcessIdx
      ];

    process.state = ProcessStates.RUN;

    let i = 0;
    let cyclesUsed = 0;

    process.startTime = parseFloat(performance.now().toFixed(3));

    const interval = setInterval(() => {
      if (i < process.operations.length) {
        //critical section is of length 1
        if (process.criticalSection[0] === process.criticalSection[1]) {
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

        OSSimulator.getInstance().processManager.scheduler.processQueue.shift();
      }
    }, 100);
  }

  public getLock(): void {
    this.hasLock = true;
    OSSimulator.getInstance().processManager.scheduler.processQueue.forEach(
      (process: Process, i: number) => {
        if (i !== this.activeProcessIdx) {
          process.state = ProcessStates.WAIT;
        }
      },
    );
  }

  public releaseLock(): void {
    this.hasLock = false;
    OSSimulator.getInstance().processManager.scheduler.processQueue.forEach(
      (process: Process, i: number) => {
        if (i !== this.activeProcessIdx) {
          process.state = ProcessStates.READY;
        }
      },
    );
  }
}
