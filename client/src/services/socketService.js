import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket) return;

    // Use relative URL to work with Vite proxy
    this.socket = io(import.meta.env.VITE_API_URL || '/', {
      transports: ['websocket'],
      autoConnect: true
    });

    // Set up default event handlers
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Handle bid updates
    this.socket.on('bid_update', (data) => {
      console.log('Received bid update:', data);
      const listeners = this.listeners.get('bid_update') || [];
      listeners.forEach(callback => callback(data));
    });

    // Handle bid errors
    this.socket.on('bid_error', (error) => {
      console.error('Bid error:', error);
      const listeners = this.listeners.get('bid_error') || [];
      listeners.forEach(callback => callback(error));
    });

    // Handle bid acceptance
    this.socket.on('bid_accepted', (data) => {
      console.log('Bid accepted:', data);
      const listeners = this.listeners.get('bid_accepted') || [];
      listeners.forEach(callback => callback(data));
    });

    // Handle vote updates
    this.socket.on('voteUpdate', (data) => {
      console.log('Received vote update:', data);
      const listeners = this.listeners.get('vote_update') || [];
      listeners.forEach(callback => callback(data));
    });

    // Handle vote errors
    this.socket.on('voteError', (error) => {
      console.error('Vote error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Subscribe to bid updates for a specific meme
  subscribeToBids(memeId, callback) {
    if (!this.socket) this.connect();

    const listeners = this.listeners.get('bid_update') || [];
    const wrappedCallback = (data) => {
      if (data.memeId === memeId) {
        callback(data);
      }
    };

    this.listeners.set('bid_update', [...listeners, wrappedCallback]);
    return () => {
      const updatedListeners = this.listeners.get('bid_update').filter(cb => cb !== wrappedCallback);
      this.listeners.set('bid_update', updatedListeners);
    };
  }

  // Subscribe to bid errors for a specific meme
  subscribeToBidErrors(callback) {
    if (!this.socket) this.connect();

    const listeners = this.listeners.get('bid_error') || [];
    this.listeners.set('bid_error', [...listeners, callback]);
    return () => {
      const updatedListeners = this.listeners.get('bid_error').filter(cb => cb !== callback);
      this.listeners.set('bid_error', updatedListeners);
    };
  }

  // Subscribe to bid acceptance for a specific meme
  subscribeToBidAccepted(callback) {
    if (!this.socket) this.connect();

    const listeners = this.listeners.get('bid_accepted') || [];
    this.listeners.set('bid_accepted', [...listeners, callback]);
    return () => {
      const updatedListeners = this.listeners.get('bid_accepted').filter(cb => cb !== callback);
      this.listeners.set('bid_accepted', updatedListeners);
    };
  }

  // Subscribe to vote updates for a specific meme
  subscribeToVotes(memeId, callback) {
    if (!this.socket) this.connect();

    const listeners = this.listeners.get('vote_update') || [];
    const wrappedCallback = (data) => {
      if (data.memeId === memeId) {
        callback(data);
      }
    };

    this.listeners.set('vote_update', [...listeners, wrappedCallback]);
    return () => {
      const updatedListeners = this.listeners.get('vote_update').filter(cb => cb !== wrappedCallback);
      this.listeners.set('vote_update', updatedListeners);
    };
  }

  // Send a new bid
  placeBid(bidData) {
    if (!this.socket) this.connect();
    console.log('Sending bid:', bidData);
    this.socket.emit('place_bid', bidData);
  }

  // Cast a vote
  castVote(memeId, userId, voteType) {
    if (!this.socket) this.connect();
    console.log('Casting vote:', { memeId, userId, voteType });
    this.socket.emit('vote', { memeId, userId, voteType });
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService; 