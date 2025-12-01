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
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0'],
      max: [10, 'Rating cannot be more than 10'],
      // Değer atandığında, tek ondalık basamağa yuvarlar (örn: 8.75 -> 8.8)
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.detailPageId = doc._id.toString(); // doc._id üzerinden al
        delete ret.id;
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: { virtuals: true },
  }
);

movieSchema.index({ title: 'text' });

const Movie = mongoose.model('Movie', movieSchema);

export default Movie;
