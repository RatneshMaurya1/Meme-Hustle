import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import socketService from '../services/socketService';

const Leaderboard = ({ onClose, isMobile }) => {
  const [topMemes, setTopMemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
    const unsubscribeVotes = socketService.subscribeToVotes(null, (voteData) => {
      setTopMemes(prevMemes => {
        const updatedMemes = prevMemes.map(meme => 
          meme.id === voteData.memeId 
            ? { ...meme, upvotes: voteData.voteCount }
            : meme
        );
        return [...updatedMemes].sort((a, b) => b.upvotes - a.upvotes);
      });
    });

    return () => {
      if (unsubscribeVotes) unsubscribeVotes();
    };
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/leaderboard?top=10`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      const data = await response.json();
      setTopMemes(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const modalStyle = {
    background: '#1a1a1a',
    border: '2px solid #4a9eff',
    borderRadius: '8px',
    width: isMobile ? '95%' : '600px',
    maxHeight: '80vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  };

  const headerStyle = {
    padding: '20px',
    borderBottom: '2px solid #4a9eff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  if (loading) {
    return (
      <div style={modalStyle}>
        <div style={{ padding: '40px', textAlign: 'center', color: '#4a9eff' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={modalStyle}>
      <div style={headerStyle}>
        <h2 style={{ color: '#4a9eff', margin: 0 }}>Leaderboard</h2>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#4a9eff',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '5px 10px'
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ 
        padding: '20px',
        overflowY: 'auto',
        flex: 1
      }}>
        {topMemes.map((meme, index) => (
          <div
            key={meme.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px',
              marginBottom: '10px',
              background: 'rgba(74, 158, 255, 0.1)',
              border: '1px solid rgba(74, 158, 255, 0.2)',
              borderRadius: '4px'
            }}
          >
            <span style={{ 
              color: '#4a9eff',
              fontWeight: 'bold',
              marginRight: '15px',
              minWidth: '30px'
            }}>
              #{index + 1}
            </span>
            <div style={{
              width: '50px',
              height: '50px',
              marginRight: '15px',
              overflow: 'hidden',
              borderRadius: '4px'
            }}>
              <img
                src={meme.image_url}
                alt={meme.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ 
                color: '#4a9eff',
                marginBottom: '5px',
                fontWeight: 'bold'
              }}>
                {meme.title}
              </div>
              <div style={{ 
                color: '#666',
                fontSize: '14px'
              }}>
                {meme.upvotes} votes
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

Leaderboard.propTypes = {
  onClose: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired
};

export default Leaderboard; 