import { Elevator } from '../models/Elevator';
import { Server as WebSocketServer, WebSocket } from 'ws';

interface Passenger {
  id: string;
  startFloor: number;
  destFloor?: number;
}

export class ElevatorController {
  private elevators: Elevator[] = [];
  private waiting: Passenger[] = [];
  private capacity = 4;
  private passengerCounter = 0;
  private zoneSize: number;

  constructor(
    private wss: WebSocketServer,
    private totalFloors: number = 10,
    private k: number = 3,
    initialPassengers: number = 10
  ) {
    // compute zone size (floors per elevator zone)
    this.zoneSize = Math.floor(totalFloors / k);

    // Initialize elevator positions at center of each zone
    for (let i = 0; i < this.k; i++) {
      const zoneStart = i * this.zoneSize;
      const zoneCenter = zoneStart + Math.floor(this.zoneSize / 2);
      const initFloor = Math.min(zoneCenter, totalFloors - 1);
      this.elevators.push(new Elevator(`E${i + 1}`, initFloor));
    }

    // Seed initial waiting passengers
    for (let i = 0; i < initialPassengers; i++) {
      this.waiting.push({ id: `P${this.passengerCounter++}`, startFloor: 0 });
    }

    this.start();
    setInterval(() => this.tick(), 1000);
  }

  private start() {
    this.wss.on('connection', (ws: WebSocket) => {
      // send initial state
      ws.send(
        JSON.stringify({
          type: 'init',
          elevators: this.elevators.map(e => e.load()),
          waiting: this.waiting,
        })
      );
      ws.on('message', data => this.handleMessage(JSON.parse(data.toString()), ws));
    });
  }

  private handleMessage(msg: any, ws: WebSocket) {
    if (msg.type === 'REQUEST') {
      let passenger = this.waiting.find(p => p.id === msg.passengerId);
      if (!passenger) {
        passenger = { id: msg.passengerId, startFloor: msg.startFloor };
      }
      passenger.destFloor = msg.destFloor;

      this.assignElevator(passenger);
      this.waiting = this.waiting.filter(p => p.id !== passenger!.id);

      this.broadcastState();
    }
  }

  private assignElevator(p: Passenger) {
    const dest = p.destFloor!;

    // Determine zone index for request
    const zoneIdx = Math.min(
      this.k - 1,
      Math.floor(p.startFloor / this.zoneSize)
    );

    // Filter free elevators
    const freeElevators = this.elevators.filter(e => e.queueLength() === 0);

    // 1) Priority: elevators in zone idx
    let candidates = this.elevators.filter((e, idx) => idx === zoneIdx && e.queueLength() === 0);

    // 2) If none in zone, any free elevator
    if (candidates.length === 0) {
      candidates = freeElevators;
    }

    // 3) If still none free, consider occupied but moving in correct direction without reversal
    if (candidates.length === 0) {
      candidates = this.elevators.filter(e => {
        if (e.queueLength() === 0) return true;
        if (e.direction === 'up' && p.startFloor >= e.currentFloor && dest >= p.startFloor) return true;
        if (e.direction === 'down' && p.startFloor <= e.currentFloor && dest <= p.startFloor) return true;
        return false;
      });
    }

    // 4) Choose closest elevator by distance
    const chosen = candidates.sort((a, b) =>
      Math.abs(a.currentFloor - p.startFloor) - Math.abs(b.currentFloor - p.startFloor)
    )[0] || this.elevators[0];

    chosen.addStop(p.startFloor);
    chosen.addStop(dest);
  }

  private tick() {
    this.elevators.forEach(e => e.step());
    this.broadcastState();
  }

  private broadcastState() {
    const msg = JSON.stringify({
      type: 'statusUpdate',
      elevators: this.elevators.map(e => e.load()),
      waiting: this.waiting,
    });
    this.wss.clients.forEach(client => {
      if ((client as WebSocket).readyState === WebSocket.OPEN) {
        (client as WebSocket).send(msg);
      }
    });
  }
}
