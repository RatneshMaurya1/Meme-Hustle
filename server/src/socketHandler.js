import { Server } from 'socket.io';

class SocketHandler {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
      }
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('place_bid', (bidData) => {
        // Broadcast the bid to all connected clients
        this.io.emit('bid_update', {
          memeId: bidData.memeId,
          userId: bidData.userId,
          credits: bidData.credits,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  // Helper method to broadcast bid updates
  broadcastBidUpdate(bidData) {
    this.io.emit('bid_update', {
      ...bidData,
      timestamp: new Date().toISOString()
    });
  }
}

export default SocketHandler; 