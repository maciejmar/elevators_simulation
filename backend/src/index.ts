import express from 'express';
import http from 'http';
import elevatorRouter from './controllers/elevatorController';
import { Server as WebSocketServer } from 'ws';
import { ElevatorController } from './services/elevatorService';

const app = express();
app.use(express.json());
app.use('/api', elevatorRouter);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Startup logs
console.log('🛠 Starting Backend...');

// Instantiate controller (starts WebSocket handlers & tick)
new ElevatorController(wss, 10, 3, 10);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Backend HTTP+WS listening on port ${PORT}`);
});