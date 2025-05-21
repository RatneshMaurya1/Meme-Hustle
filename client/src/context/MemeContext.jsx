import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

const MemeContext = createContext();

export const useMeme = () => {
  const context = useContext(MemeContext);
  if (!context) {
    throw new Error('useMeme must be used within a MemeProvider');
  }
  return context;
};

export const MemeProvider = ({ children }) => {
  const [memes, setMemes] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const skipNextWebSocketUpdate = useRef(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [memesData, leaderboardData] = await Promise.all([
          api.getMemes(),
          api.getLeaderboard()
        ]);
        
        setMemes(memesData);
        setLeaderboard(leaderboardData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const callbacks = {
      onBid: ({ memeId, amount, userId }) => {
        setMemes(prev => prev.map(meme =>
          meme.id === memeId ? { ...meme, current_bid: amount } : meme
        ));
      },
      onVote: ({ memeId, voteCount }) => {
        setMemes(prev => prev.map(meme =>
          meme.id === memeId ? { ...meme, upvotes: voteCount } : meme
        ));
      },
      onNewMeme: (newMeme) => {
        // Skip this update if we just created a meme
        if (skipNextWebSocketUpdate.current) {
          skipNextWebSocketUpdate.current = false;
          return;
        }
        setMemes(prev => [newMeme, ...prev]);
      }
    };

    api.socket.subscribeToUpdates(callbacks);
    return () => api.socket.unsubscribeFromUpdates();
  }, []);

  // Actions
  const createMeme = async (memeData) => {
    try {
      // Set the flag to skip the next WebSocket update
      skipNextWebSocketUpdate.current = true;
      
      const newMeme = await api.createMeme(memeData);
      setMemes(prev => [newMeme, ...prev]);
      
      // Reset the flag after a short delay in case the WebSocket is slow
      setTimeout(() => {
        skipNextWebSocketUpdate.current = false;
      }, 5000);
      
      return newMeme;
    } catch (err) {
      skipNextWebSocketUpdate.current = false;
      setError(err.message);
      throw err;
    }
  };

  const placeBid = async (memeId, amount, userId) => {
    try {
      const response = await fetch(`/api/memes/${memeId}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          credits: amount
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to place bid');
      }

      const data = await response.json();
      // Update the meme in state with new bid amount
      setMemes(prev => prev.map(meme =>
        meme.id === memeId ? { ...meme, current_bid: data.amount } : meme
      ));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const castVote = (memeId, userId, voteType) => {
    api.socket.castVote(memeId, userId, voteType);
  };

  const value = {
    memes,
    leaderboard,
    loading,
    error,
    createMeme,
    placeBid,
    castVote
  };

  return (
    <MemeContext.Provider value={value}>
      {children}
    </MemeContext.Provider>
  );
}; 