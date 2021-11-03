export enum OperationTypes {
  CALCULATE,
  IO,
  FORK,
}

export class Operation {
  public type: OperationTypes;
  private minCycles: number;
  private maxCycles: number;

  public cycleLength: number;

  constructor(type: string, minCycles: number, maxCycles: number) {
    this.type = this.parseOperationType(type);
    this.minCycles = minCycles;
    this.maxCycles = maxCycles;

    this.cycleLength = this.randomizeCycleLength(minCycles, maxCycles);
  }

  private randomizeCycleLength(minCycles: number, maxCycles: number): number {
    return Math.ceil(Math.random() * (maxCycles - minCycles) + minCycles);
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
