import PropTypes from 'prop-types';
import MemeCard from './MemeCard';

const MemeGrid = ({ memes, onUpvote, onDownvote, onBid }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {/* Grid Lines Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="w-full h-full grid grid-cols-12 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-full border-l border-neon-blue opacity-10"
            />
          ))}
        </div>
      </div>

      {/* Meme Cards */}
      {memes.map((meme) => (
        <div
          key={meme.id}
          className="relative z-10 transform hover:-translate-y-1 transition-transform duration-300"
        >
          <MemeCard
            meme={meme}
            onUpvote={onUpvote}
            onDownvote={onDownvote}
            onBid={onBid}
          />
        </div>
      ))}

      {/* Empty State */}
      {memes.length === 0 && (
        <div className="col-span-full text-center py-12">
          <div className="cyber-panel inline-block p-8">
            <p className="text-neon-pink text-xl mb-4">No memes in the grid</p>
            <p className="text-neon-blue">Be the first to upload a cyberpunk meme!</p>
          </div>
        </div>
      )}
    </div>
  );
};

MemeGrid.propTypes = {
  memes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      image_url: PropTypes.string.isRequired,
      tags: PropTypes.arrayOf(PropTypes.string).isRequired,
      upvotes: PropTypes.number.isRequired,
      ai_caption: PropTypes.string,
      ai_vibe: PropTypes.string,
      current_bid: PropTypes.number.isRequired,
      owner_id: PropTypes.string.isRequired,
    })
  ).isRequired,
  onUpvote: PropTypes.func.isRequired,
  onDownvote: PropTypes.func.isRequired,
  onBid: PropTypes.func.isRequired,
};

export default MemeGrid; 