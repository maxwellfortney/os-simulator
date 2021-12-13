import { saveFileToDir } from '../../../utils';
import OSSimulator from '../../OSSimulator';

export class MemoryManager {
  public maxMemory = 1024;
  public availableMemory = 1024;

  public cached = false;

  public isFull(): boolean {
    return this.availableMemory <= 0;
  }

  public canFit(size: number): boolean {
    console.log('CANFIT', this.availableMemory - size > 0);
    return this.availableMemory - size > 0;
  }

  public clear(): void {
    this.availableMemory = this.maxMemory;
  }

  public addChunk(size: number): void {
    this.availableMemory += -size;
  }

  public clearChunk(size: number): void {
    this.availableMemory += size;
  }

  public saveToHDD(): void {
    saveFileToDir(
      './HDD',
      `${Date.now()}.json`,
      JSON.stringify(OSSimulator.getInstance().processManager.processes),
    );
  }
}
