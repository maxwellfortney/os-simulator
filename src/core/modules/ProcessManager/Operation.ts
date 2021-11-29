export enum OperationTypes {
  CALCULATE,
  IO,
  FORK,
}

export class Operation {
  public type: OperationTypes;

  public cycleLength: number;
  public memoryRequired: number;

  constructor(
    type: string,
    minCycles: number,
    maxCycles: number,
    minMem: number,
    maxMem: number,
  ) {
    this.type = this.parseOperationType(type);

    this.memoryRequired = this.randomizeInRange(minMem, maxMem);
    this.cycleLength = this.randomizeInRange(minCycles, maxCycles);
  }

  private randomizeInRange(min: number, max: number): number {
    return Math.ceil(Math.random() * (max - min) + min);
  }

  private parseOperationType(type: string | OperationTypes): OperationTypes {
    if (typeof type === 'string') {
      switch (type.trim()) {
        case 'CALCULATE':
          return OperationTypes.CALCULATE;
        case 'I/O':
          return OperationTypes.IO;
        case 'FORK':
          return OperationTypes.FORK;
        case 'IO':
          return OperationTypes.IO;
        default:
          throw new Error('Failed to parse operation type');
      }
    } else {
      return type;
    }
  }
}
