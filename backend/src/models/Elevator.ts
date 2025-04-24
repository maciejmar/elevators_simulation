export type Direction = 'up' | 'down' | 'idle';

export interface Request {
  type: 'CALL';
  startFloor: number;
  destFloor: number;
  timestamp: number;
}

export class Elevator {
  public id: string;
  public currentFloor: number;
  public direction: Direction = 'idle';
  public stops: number[] = [];
  public capacity = 4;

  constructor(id: string, initialFloor: number = 0) {
    this.id = id;
    this.currentFloor = initialFloor;
  }

  public addStop(floor: number) {
    if (!this.stops.includes(floor)) {
      this.stops.push(floor);
      // Sort queue based on current direction
      if (this.direction === 'up') {
        this.stops.sort((a, b) => a - b);
      } else if (this.direction === 'down') {
        this.stops.sort((a, b) => b - a);
      }
    }
  }

  public step() {
    if (this.stops.length === 0) {
      this.direction = 'idle';
      return;
    }

    const nextStop = this.stops[0];
    if (this.currentFloor < nextStop) {
      this.currentFloor++;
      this.direction = 'up';
    } else if (this.currentFloor > nextStop) {
      this.currentFloor--;
      this.direction = 'down';
    }

    // Arrived at stop?
    if (this.currentFloor === nextStop) {
      this.stops.shift();
      if (this.stops.length > 0) {
        this.direction = this.stops[0] > this.currentFloor ? 'up' : 'down';
      } else {
        this.direction = 'idle';
      }
    }
  }

  public queueLength(): number {
    return this.stops.length;
  }

  public load() {
    return {
      id: this.id,
      currentFloor: this.currentFloor,
      direction: this.direction,
      stops: [...this.stops]
    };
  }
}