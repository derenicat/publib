import { StarIcon, PlusIcon, PencilSquareIcon } from '@heroicons/react/24/solid';

const MediaHeader = ({ item, type, userReview, onRate, onAddToList, onReviewClick }) => {
  // Veri normalizasyonu
  const title = item.title;
  const description = item.description || item.overview;
  const image = type === 'book' ? item.coverImage : `https://image.tmdb.org/t/p/w780${item.posterPath}`;
  const releaseDate = type === 'book' ? item.publishedDate : item.releaseDate;
  
  const creators = type === 'book' ? item.authors : []; 
  const tags = type === 'book' ? item.categories : item.genres;

  return (
    <div className="flex flex-col md:flex-row gap-8 md:gap-12">
      
      {/* Poster */}
      <div className="shrink-0 mx-auto md:mx-0 w-64 md:w-80 rounded-xl overflow-hidden shadow-2xl border-4 border-surface-accent">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-96 bg-surface-accent flex items-center justify-center text-secondary">
            No Image
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-grow text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            {title}
            </h1>
            
            {/* Rating Badge & Rate Button */}
            <div className="flex items-center gap-3">
                {item.averageRating > 0 && (
                    <div className="flex items-center gap-2 bg-surface/80 backdrop-blur-md px-4 py-2 rounded-lg border border-yellow-500/30 shadow-lg shadow-yellow-500/10">
                        <StarIcon className="h-6 w-6 text-yellow-400" />
                        <div className="flex flex-col items-start leading-none">
                            <span className="text-xl font-bold text-white">{item.averageRating.toFixed(1)}</span>
                            <span className="text-[10px] text-secondary">{item.ratingsCount} ratings</span>
                        </div>
                    </div>
                )}
                
                <button 
                    onClick={onRate}
                    className={`backdrop-blur-md p-2 rounded-lg border transition-colors flex items-center gap-2 ${
                        userReview 
                        ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30' 
                        : 'bg-surface/80 border-border text-gray-400 hover:text-yellow-400 hover:bg-surface-accent'
                    }`}
                    title={userReview ? "Update your rating" : "Rate this"}
                >
                    <StarIcon className="h-8 w-8" fill={userReview ? "currentColor" : "none"} />
                    {userReview && (
                        <span className="font-bold text-lg pr-1">{userReview.rating}</span>
                    )}
                </button>
            </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-secondary mb-6 text-sm md:text-base">
          {releaseDate && (
            <span className="bg-surface px-3 py-1 rounded-full border border-border">
              {new Date(releaseDate).getFullYear()}
            </span>
          )}
          {tags && tags.map(tag => (
            <span key={tag} className="text-gray-300">
              {tag}
            </span>
          ))}
          {type === 'book' && item.pageCount && (
            <span className="text-gray-400">
              {item.pageCount} pages
            </span>
          )}
        </div>

        {creators && creators.length > 0 && (
          <p className="text-lg text-gray-300 mb-6">
            by <span className="text-white font-semibold">{creators.join(', ')}</span>
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-8">
          <button 
            onClick={onAddToList}
            className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-full font-bold transition-colors shadow-lg shadow-brand-900/20 flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add to List
          </button>
          <button 
            onClick={onReviewClick}
            className="bg-surface hover:bg-surface-accent text-white border border-border px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2"
          >
            <PencilSquareIcon className="h-5 w-5" />
            Write Review
          </button>
        </div>

        {/* Description */}
        <div className="bg-surface/50 p-6 rounded-2xl border border-border/50 backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-3">Overview</h3>
          <p className="text-gray-300 leading-relaxed">
            {description ? description.replace(/<[^>]*>?/gm, '') : "No description available."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MediaHeader;
