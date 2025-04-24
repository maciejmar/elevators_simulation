# elevators_simulation
App has to manage the building's elevators traffic. 

Frontend running: npm start
Backend running: npm run build
                 node dist/index.js

Elevator routing algorithm
Each elevator is set at the start in its own zone. Number of zones = number of floors / number of elevators. n= number of floors, k-number of zones. The first elevator stands at the start on the first floor, the next elevator stands at (n/k )* (i+1), where i = 0 to the total part of (n/k).
each elevator handles priority requests from its zone. Unless it is more costly to send an elevator even to the zone it has in priority than to send another free elevator.
Elevators can pick up passengers from other floors along the way, but they can't turn around to pick them up - only if they're going down, they don't go back up to pick up a passenger, but go toward the destination floor. If other elevators are occupied and the E elevator is free, then regardless of whether the request is for its zone(its floors) or not, it will handle the request, because it is the only free elevator.
