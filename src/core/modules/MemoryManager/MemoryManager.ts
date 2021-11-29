export class MemoryManager {
  public maxMemory = 1024;
  public availableMemory = 1024;

  public isFull() {
    return this.availableMemory <= 0;
  }

  public canFit(size: number) {
    console.log('CANFIT', this.availableMemory - size > 0);
    return this.availableMemory - size > 0;
  }

  public clear() {
    this.availableMemory = this.maxMemory;
  }

  public addChunk(size: number) {
    this.availableMemory += -size;
  }

  public clearChunk(size: number) {
    this.availableMemory += size;
  }
}
