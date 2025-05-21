import { createClient } from '@supabase/supabase-js';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Initialize Socket.IO
export const socket = io(API_URL);

// Meme API calls
export const api = {
  // Get all memes
  getMemes: async () => {
    try {
      const response = await fetch(`${API_URL}/api/memes`);
      if (!response.ok) throw new Error('Failed to fetch memes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching memes:', error);
      return [];
    }
  },

  // Create a new meme
  createMeme: async (memeData) => {
    try {
      // Ensure the image URL is absolute
      const imageUrl = memeData.image_url || memeData.imageUrl;
      if (!imageUrl) {
        throw new Error('Image URL is required');
      }

      const formattedData = {
        ...memeData,
        image_url: imageUrl.startsWith('http') ? imageUrl : `${API_URL}${imageUrl}`
      };

      const response = await fetch(`${API_URL}/api/memes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create meme');
      }

      const data = await response.json();
      return {
        ...data,
        image_url: data.image_url.startsWith('http') ? data.image_url : `${API_URL}${data.image_url}`
      };
    } catch (error) {
      console.error('Error creating meme:', error);
      throw error;
    }
  },

  // Get leaderboard
  getLeaderboard: async () => {
    try {
      const response = await fetch(`${API_URL}/api/leaderboard`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      return await response.json();
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  },

  // Supabase direct calls
  supabase: {
    // Get user profile
    getProfile: async (userId) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },

    // Update user credits
    updateCredits: async (userId, amount) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ credits: amount })
        .eq('id', userId);
      
      if (error) throw error;
      return data;
    }
  },

  // Socket.IO events
  socket: {
    // Cast a vote
    castVote: (memeId, userId, voteType) => {
      socket.emit('vote', { memeId, userId, voteType });
    },

    // Subscribe to updates
    subscribeToUpdates: (callbacks) => {
      socket.on('bidUpdate', callbacks.onBid);
      socket.on('voteUpdate', callbacks.onVote);
      socket.on('newMeme', callbacks.onNewMeme);
    },

    // Unsubscribe from updates
    unsubscribeFromUpdates: () => {
      socket.off('bidUpdate');
      socket.off('voteUpdate');
      socket.off('newMeme');
    }
  }
}; 