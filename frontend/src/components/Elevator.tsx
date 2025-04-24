import React from 'react';

interface Props {
  id: string;
  currentFloor: number;
  direction: string;
  stops: number[];
  floorCount: number;
  floorHeight: number;   // now 60px
  leftPosition: number;
}

export default function Elevator({
  id,
  currentFloor,
  direction,
  stops,
  floorCount,
  floorHeight,
  leftPosition,
}: Props) {
  // 0 = top row, floorCount-1 = bottom
  const rowIndex = floorCount - 1 - currentFloor;

  // Cabin is 80% of floor height
  const cabinHeight    = floorHeight * 0.8;       // 48px
  const verticalOffset = (floorHeight - cabinHeight) / 2; // 6px

  // Center the cabin
  const topPx = rowIndex * floorHeight + verticalOffset;

  return (
    <div
      className="position-absolute text-center rounded shadow"
      style={{
        top:             `${topPx}px`,
        left:            `${leftPosition}px`,
        width:           '60px',
        height:          `${cabinHeight}px`,
        backgroundColor: '#0d6efd',
        color:           'white',
        padding:         '4px 2px',
        zIndex:          2,
      }}
    >
      <div className="fw-bold">{id}</div>
      <div>
        {direction === 'up'   ? '↑'
         : direction === 'down'? '↓'
         : '–'}
      </div>
      <div className="badge bg-light text-dark mt-1">
        {stops.length} onboard
      </div>
    </div>
  );
}
