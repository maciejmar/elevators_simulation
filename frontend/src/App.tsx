import React, { useEffect, useState, useRef } from 'react';
import Elevator from './components/Elevator';

type ElevatorData = {
  id: string;
  currentFloor: number;
  direction: string;
  stops: number[];
};
type Passenger = {
  id: string;
  startFloor: number;
};

export default function App() {
  const [elevators, setElevators] = useState<ElevatorData[]>([]);
  const [waiting, setWaiting] = useState<Passenger[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const nextPassengerId = useRef(0);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'init') {
        setElevators(msg.elevators);
        setWaiting(msg.waiting);
        const maxId = msg.waiting.reduce((m: number, p: Passenger) => {
          const n = parseInt(p.id.slice(1), 10);
          return isNaN(n) ? m : Math.max(m, n);
        }, -1);
        nextPassengerId.current = maxId + 1;
      }
      if (msg.type === 'statusUpdate') {
        setElevators(msg.elevators);
        setWaiting(msg.waiting);
      }
    };
    wsRef.current = ws;
    return () => ws.close();
  }, []);

  const callElevator = (startFloor: number, destFloor: number) => {
    const existing = waiting.find(p => p.startFloor === startFloor);
    const passengerId = existing
      ? existing.id
      : `P${nextPassengerId.current++}`;

    wsRef.current?.send(
      JSON.stringify({
        type: 'REQUEST',
        passengerId,
        startFloor,
        destFloor,
      })
    );
  };

  const floorCount = 10;
  const containerHeight = 600; // px
  const floorHeight = containerHeight / floorCount; // 60px
  const floors = Array.from({ length: floorCount }, (_, i) => floorCount - 1 - i);

  return (
    <div className="container-fluid px-4">
      {/* Elevator Status Row */}
      <div className="row mb-4">
        <div className="col-12">
          <h4 className="mb-3">Elevator Status</h4>
          <div className="d-flex flex-wrap">
            {elevators.map(e => (
              <div
                key={e.id}
                className="card me-3 mb-3 shadow-sm"
                style={{ minWidth: '200px' }}
              >
                <div className="card-body p-2">
                  <h5 className="card-title mb-1">{e.id}</h5>
                  <p className="card-text mb-1">
                    Floor: <span className="fw-bold">{e.currentFloor}</span>
                  </p>
                  <p className="card-text mb-1">
                    Direction:{' '}
                    <span
                      className={`badge ms-1 ${
                        e.direction === 'up' ? 'bg-success' :
                        e.direction === 'down' ? 'bg-danger' :
                        'bg-secondary'
                      }`}
                    >
                      {e.direction.toUpperCase()}
                    </span>
                  </p>
                  <p className="card-text mb-0">
                    Passengers: <span className="fw-bold">{e.stops.length}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Building & Floors */}
      <div className="row">
        <div className="col-12">
          <div
            className="building position-relative"
            style={{ height: `${containerHeight}px` }}
          >
            {floors.map((floor, idx) => (
              <div
                key={floor}
                className="floor d-flex align-items-center justify-content-between"
                style={{ top: `${idx * floorHeight}px`, height: `${floorHeight}px` }}
              >
                {/* Left: floor label */}
                <div className="fw-bold">Floor {floor}</div>

                {/* Right: passengers + call */}
                <div className="d-flex align-items-center">
                  <div className="passengers me-2">
                    {waiting
                      .filter(p => p.startFloor === floor)
                      .map(p => (
                        <span key={p.id} className="badge bg-warning text-dark me-1">
                          {p.id}
                        </span>
                      ))}
                  </div>
                  <select
                    className="form-select form-select-sm floor-select"
                    defaultValue=""
                    onChange={e => {
                      const dest = Number(e.currentTarget.value);
                      if (!isNaN(dest)) {
                        callElevator(floor, dest);
                        e.currentTarget.value = '';
                      }
                    }}
                  >
                    <option value="" disabled>Call…</option>
                    {floors
                      .filter(f => f !== floor)
                      .map(f => (
                        <option key={f} value={f}>To {f}</option>
                      ))}
                  </select>
                </div>
              </div>
            ))}

            {/* Elevators */}
            {elevators.map((e, i) => (
              <Elevator
                key={e.id}
                {...e}
                floorCount={floorCount}
                floorHeight={floorHeight}
                leftPosition={100 + i * 100}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
