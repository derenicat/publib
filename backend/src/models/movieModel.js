import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    tmdbId: {
      type: String,
      required: [true, 'A movie must have a TMDb ID.'],
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'A movie must have a title.'],
      trim: true,
    },
    overview: {
      type: String,
      trim: true,
    },
    posterPath: String,
    backdropPath: String,
    releaseDate: String,
    genres: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

movieSchema.index({ title: 'text' });

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;
