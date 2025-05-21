import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import BidComponent from './BidComponent';
import socketService from '../services/socketService';

const MemeCard = ({ meme }) => {
  const [currentBid, setCurrentBid] = useState(meme.current_bid || 0);
  const [voteCount, setVoteCount] = useState(meme.upvotes || 0);
  const [isGlitching, setIsGlitching] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [bidError, setBidError] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Subscribe to bid updates for this meme
    const unsubscribeBids = socketService.subscribeToBids(meme.id, (bidData) => {
      console.log('Received bid update for meme:', meme.id, bidData);
      if (bidData.memeId === meme.id) {
        setCurrentBid(bidData.credits);
        triggerGlitch();
      }
    });

    // Subscribe to vote updates
    const unsubscribeVotes = socketService.subscribeToVotes(meme.id, (voteData) => {
      console.log('Vote update for meme:', meme.id, voteData);
      if (voteData.memeId === meme.id) {
        setVoteCount(voteData.voteCount);
        triggerGlitch();
      }
    });

    // Subscribe to bid errors
    const unsubscribeBidErrors = socketService.subscribeToBidErrors((error) => {
      console.error('Bid error for meme:', meme.id, error);
      setBidError(error.message);
    });

    // Subscribe to bid acceptance
    const unsubscribeBidAccepted = socketService.subscribeToBidAccepted((data) => {
      console.log('Bid accepted for meme:', meme.id, data);
      if (data.memeId === meme.id) {
        setBidError(null);
      }
    });

    return () => {
      unsubscribeBids();
      unsubscribeVotes();
      unsubscribeBidErrors();
      unsubscribeBidAccepted();
    };
  }, [meme.id]);

  const handleVote = async (type) => {
    if (isVoting) return;
    
    setIsVoting(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/memes/${meme.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voteType: type
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to vote');
      }

      const data = await response.json();
      setVoteCount(data.voteCount);
      triggerGlitch();
    } catch (error) {
      console.error('Error voting:', error);
      setError(error.message);
    } finally {
      setIsVoting(false);
    }
  };

  const triggerGlitch = () => {
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 500);
  };

  const handleBidSubmit = async (bidData) => {
    try {
      console.log('Submitting bid:', bidData);
      setBidError(null);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/memes/${meme.id}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: bidData.userId,
          credits: bidData.credits
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to place bid');
      }

      const data = await response.json();
      setCurrentBid(data.amount);
      triggerGlitch();
    } catch (error) {
      console.error('Error placing bid:', error);
      setBidError(error.message);
      throw error;
    }
  };

  return (
    <div className={`cyber-card ${isGlitching ? 'glitch' : ''}`} style={{ 
      background: '#1a1a1a',
      borderRadius: '0.5rem',
      border: '2px solid #4a9eff',
      marginBottom: '1rem',
      transition: 'transform 0.3s ease'
    }}>
      {/* Image section */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <img
          src={meme.image_url || 'https://picsum.photos/400/300'}
          alt={meme.title}
          style={{
            width: '100%',
            height: '12rem',
            objectFit: 'cover'
          }}
        />
        <div className="grid-lines" style={{ opacity: 0.1 }} />
      </div>

      {/* Content section */}
      <div style={{ padding: '1rem' }}>
        <h3 className={isGlitching ? 'glitch' : ''} style={{ 
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: '#ff69b4',
          marginBottom: '0.5rem'
        }}>
          {meme.title}
        </h3>

        {/* AI Generated Content */}
        <div style={{
          padding: '0.5rem',
          marginBottom: '1rem',
          background: 'rgba(74, 158, 255, 0.1)',
          borderRadius: '0.25rem'
        }}>
          <p className="terminal-text" style={{ color: '#4a9eff', fontSize: '0.875rem' }}>
            {meme.ai_caption || "AI is thinking..."}
          </p>
          <p style={{ color: '#ff69b4', fontSize: '0.75rem', fontStyle: 'italic' }}>
            {meme.ai_vibe || "Analyzing vibes..."}
          </p>
        </div>

        {/* Vote Section */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '1rem'
          }}>
            <button
              onClick={() => handleVote('up')}
              className="neon-button"
              disabled={isVoting}
              style={{ 
                flex: 1,
                background: 'transparent'
              }}
            >
              ⬆️ Upvote
            </button>
            <span className={isGlitching ? 'glitch' : ''} style={{ 
              color: '#4a9eff',
              fontSize: '1.25rem',
              fontWeight: 'bold'
            }}>
              {voteCount}
            </span>
            <button
              onClick={() => handleVote('down')}
              className="neon-button"
              disabled={isVoting}
              style={{ 
                flex: 1,
                background: 'transparent'
              }}
            >
              ⬇️ Downvote
            </button>
          </div>
          {error && (
            <div style={{ 
              color: '#ef4444', 
              fontSize: '0.875rem',
              textAlign: 'center' 
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {meme.tags.map((tag) => (
            <span
              key={tag}
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                color: '#4a9eff',
                border: '1px solid #4a9eff',
                borderRadius: '9999px'
              }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Creator */}
        <div style={{ 
          marginBottom: '1rem',
          fontSize: '0.75rem',
          color: '#666'
        }}>
          Created by: <span style={{ color: '#4a9eff' }}>{meme.owner_id}</span>
        </div>

        {/* Bid Component */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <BidComponent
            memeId={meme.id}
            initialBid={currentBid}
            onBidSubmit={handleBidSubmit}
            error={bidError}
          />
        </div>
      </div>
    </div>
  );
};

MemeCard.propTypes = {
  meme: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    image_url: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    ai_caption: PropTypes.string,
    ai_vibe: PropTypes.string,
    current_bid: PropTypes.number,
    owner_id: PropTypes.string.isRequired,
    upvotes: PropTypes.number
  }).isRequired,
};

export default MemeCard; 