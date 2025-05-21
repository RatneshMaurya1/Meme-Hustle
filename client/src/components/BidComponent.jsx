import { useState } from 'react';
import PropTypes from 'prop-types';

// Mock user IDs for testing
const MOCK_USERS = [
  'cyberpunk420',
  'neonRider',
  'matrixHacker',
  'cryptoRebel',
  'glitchQueen'
];

const BidComponent = ({ memeId, initialBid = 0, onBidSubmit, error: externalError }) => {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [internalError, setInternalError] = useState(null);
  const [currentUser] = useState(() => 
    MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)]
  );

  const handleChange = (e) => {
    console.log('Input value changing:', e.target.value);
    setInputValue(e.target.value);
    setInternalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue) return;

    setIsSubmitting(true);
    setInternalError(null);

    try {
      const bidValue = parseInt(inputValue, 10);
      if (isNaN(bidValue) || bidValue <= initialBid) {
        throw new Error(`Bid must be higher than ${initialBid} credits`);
      }

      await onBidSubmit({
        memeId,
        userId: currentUser,
        credits: bidValue
      });

      setInputValue('');
    } catch (err) {
      setInternalError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use external error if provided, otherwise use internal error
  const displayError = externalError || internalError;

  return (
    <div style={{ padding: '1rem', border: '1px solid #4a9eff' }}>
      <div style={{ marginBottom: '1rem' }}>
        <span style={{ color: '#ff69b4' }}>
          Current Bid: {initialBid} credits
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="number"
          value={inputValue}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '0.5rem',
            marginBottom: '0.5rem',
            background: '#2a2a2a',
            color: 'white',
            border: '1px solid #4a9eff'
          }}
          placeholder="Enter bid amount..."
        />

        {displayError && (
          <div style={{ color: 'red', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            {displayError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !inputValue}
          style={{
            width: '100%',
            padding: '0.5rem',
            background: isSubmitting ? '#666' : '#4a9eff',
            color: 'white',
            border: 'none',
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? 'Placing Bid...' : 'Place Bid'}
        </button>

        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#666' }}>
          Bidding as: <span style={{ color: '#50fa7b' }}>{currentUser}</span>
        </div>
      </form>
    </div>
  );
};

BidComponent.propTypes = {
  memeId: PropTypes.string.isRequired,
  initialBid: PropTypes.number,
  onBidSubmit: PropTypes.func.isRequired,
  error: PropTypes.string
};

export default BidComponent; 