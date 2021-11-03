import { readFilesFromDir } from '../../../utils';
import { Operation } from './Operation';
import { Process, ProcessStates } from './Process';
import { SJF } from './Schedulers/SJF/SJF';

const programFilesDir = './programFiles/';

export class ProcessManager {
  public processes: Array<Process> = [];
  public scheduler: SJF;

  public constructor() {
    this.processes = this.loadProcesses();
  }

  public loadScheduler(type: string): void {
    if (type === 'SJF') {
      this.scheduler = new SJF();
    } else {
      // Add 2nd scheduler type
    }
  }

  public startScheduler(): void {
    this.scheduler.start();
  }

  private loadProcesses() {
    const processes: Array<Process> = [];
    const rawProgramFiles = readFilesFromDir(programFilesDir);

    rawProgramFiles.forEach((programFile) => {
      const process = this.parseProgramFile(programFile);
      processes.push(process);
    });

    return processes;
  }

  private parseProgramFile(programFile: string) {
    const lines = programFile.split('\n');
    const operations: Array<Operation> = [];

    lines.forEach((line: string) => {
      const args = line.split(' ');

      if (args.length == 3) {
        const operation = new Operation(
          args[0],
          parseInt(args[1]),
          parseInt(args[2]),
        );

        operations.push(operation);
      }
    });

    const process = new Process(operations);
    return process;
  }
}
