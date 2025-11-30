import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    item: {
      type: mongoose.Schema.ObjectId,
      required: true,
      refPath: 'itemModel',
    },
    itemModel: {
      type: String,
      required: true,
      enum: ['Book', 'Movie'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1.'],
      max: [10, 'Rating cannot be more than 10.'],
    },
    text: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Bu model için standart 'id' ismini kullanıyoruz.
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: { virtuals: true },
  }
);

// Bir kullanıcının aynı item'a (kitap veya film) sadece bir review yazabilmesini sağlar.
reviewSchema.index({ user: 1, item: 1 }, { unique: true });

// Belirli bir item için rating istatistiklerini hesaplayan statik bir metod
reviewSchema.statics.calculateStats = async function (itemId, itemModel) {
  const stats = await this.aggregate([
    {
      $match: { item: itemId },
    },
    {
      $group: {
        _id: '$item',
        ratingsCount: { $sum: 1 },
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await mongoose.model(itemModel).findByIdAndUpdate(itemId, {
        ratingsCount: stats[0].ratingsCount,
        averageRating: stats[0].averageRating,
      });
    } else {
      // If no reviews are left, reset the stats
      await mongoose.model(itemModel).findByIdAndUpdate(itemId, {
        ratingsCount: 0,
        averageRating: 0,
      });
    }
  } catch (err) {
    console.error('Error updating stats:', err);
  }
};

// Bir review kaydedildikten sonra istatistikleri yeniden hesapla
reviewSchema.post('save', function () {
  this.constructor.calculateStats(this.item, this.itemModel);
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
