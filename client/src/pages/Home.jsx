import { useState, useEffect } from 'react';
import CreateMemeForm from '../components/CreateMemeForm';
import MemeCard from '../components/MemeCard';
import Leaderboard from '../components/Leaderboard';
import socketService from '../services/socketService';

const Home = () => {
  const [memes, setMemes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchMemes();
    const unsubscribeNewMeme = socketService.subscribeToNewMemes((newMeme) => {
      setMemes(prev => [newMeme, ...prev]);
    });
    return () => {
      if (unsubscribeNewMeme) unsubscribeNewMeme();
    };
  }, []);

  const fetchMemes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('${import.meta.env.VITE_API_URL}/api/memes');
      if (!response.ok) throw new Error('Failed to fetch memes');
      const data = await response.json();
      setMemes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black">
      {/* Header */}
      <div style={{ padding: '20px', borderBottom: '2px solid #4a9eff' }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ color: '#ff69b4', fontSize: '2rem' }}>MemeHustle</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowLeaderboard(true)}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: '2px solid #4a9eff',
                color: '#4a9eff',
                cursor: 'pointer'
              }}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: '2px solid #4a9eff',
                color: '#4a9eff',
                cursor: 'pointer'
              }}
            >
              Create Meme
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
        {error && (
          <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>
        )}

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {memes.map(meme => (
              <MemeCard key={meme.id} meme={meme} />
            ))}
          </div>
        )}
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }} onClick={() => setShowLeaderboard(false)}>
          <div onClick={e => e.stopPropagation()}>
            <Leaderboard onClose={() => setShowLeaderboard(false)} isMobile={isMobile} />
          </div>
        </div>
      )}

      {/* Create Meme Modal */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }} onClick={() => setShowCreateForm(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#1a1a1a',
            padding: '20px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px'
          }}>
            <CreateMemeForm onClose={() => setShowCreateForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;