import { useState, useEffect } from 'react'
import { useMeme } from './context/MemeContext'
import MemeGrid from './components/MemeGrid'
import CreateMemeForm from './components/CreateMemeForm'
import Leaderboard from './components/Leaderboard'

function App() {
  const { memes, loading, error, createMeme, castVote, placeBid } = useMeme()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  // Effect to manage body scroll lock
  useEffect(() => {
    if (showLeaderboard) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup function to ensure we remove the lock when component unmounts
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showLeaderboard])

  const handleCreateMeme = async (memeData) => {
    try {
      await createMeme(memeData)
      setShowCreateForm(false)
    } catch (err) {
      console.error('Error creating meme:', err)
    }
  }

  const handleUpvote = (id) => {
    castVote(id, 'cyberpunk420', 'up')
  }

  const handleDownvote = (id) => {
    castVote(id, 'cyberpunk420', 'down')
  }

  const handleBid = (id, amount) => {
    placeBid(id, amount, 'cyberpunk420')
  }

  return (
    <div className="min-h-screen bg-cyber-black text-white">
      {/* Header */}
      <header className="py-6 border-b border-neon-blue">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-neon-pink glitch">MemeHustle</h1>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                className="neon-button"
              >
                {showLeaderboard ? '✖ Close' : '🏆 Leaderboard'}
              </button>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="neon-button"
              >
                {showCreateForm ? '✖ Close' : '+ Create Meme'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Leaderboard Modal */}
        {showLeaderboard && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowLeaderboard(false)
              }
            }}
          >
            <div className="bg-cyber-black p-6 rounded-lg border border-neon-blue w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-neon-blue">Leaderboard</h2>
                <button 
                  onClick={() => setShowLeaderboard(false)}
                  className="text-neon-pink hover:text-neon-blue transition-colors"
                >
                  ✖
                </button>
              </div>
              <Leaderboard />
            </div>
          </div>
        )}

        {/* Create Meme Form */}
        {showCreateForm && (
          <div className="mb-8">
            <CreateMemeForm onSubmit={handleCreateMeme} />
          </div>
        )}

        {/* Meme Grid Section */}
        <div className="w-full">
          {loading ? (
            <div className="cyber-loading" />
          ) : error ? (
            <div className="cyber-error">{error}</div>
          ) : (
            <MemeGrid
              memes={memes}
              onUpvote={handleUpvote}
              onDownvote={handleDownvote}
              onBid={handleBid}
            />
          )}
        </div>
      </main>

    </div>
  )
}

export default App
