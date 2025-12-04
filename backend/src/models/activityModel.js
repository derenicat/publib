import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: { virtuals: true },
  }
);

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Yapılan eylemin türü
    type: {
      type: String,
      required: true,
      enum: [
        'REVIEW_CREATED',
        'LIBRARY_ENTRY_CREATED',
        'FOLLOW_CREATED',
      ],
    },
    // Eylemin ilgili olduğu asıl dökümana polimorfik referans
    // Örneğin, bir review'un veya bir library entry'nin kendisi
    subject: {
      type: mongoose.Schema.ObjectId,
      required: true,
      refPath: 'subjectModel',
    },
    subjectModel: {
      type: String,
      required: true,
      enum: ['Review', 'LibraryEntry', 'Follow'],
    },
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    comments: [commentSchema],
  },
  {
    timestamps: true, // `createdAt` alanı bizim için ana sıralama kriteri olacak
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
    toObject: { virtuals: true },
  }
);

// Akış sorguları için temel index'ler
activitySchema.index({ user: 1, createdAt: -1 }); // Bir kullanıcının kendi akışı için
activitySchema.index({ createdAt: -1 }); // Genel akışlar için

// Sanal Alanlar (Virtuals)
activitySchema.virtual('likesCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

activitySchema.virtual('commentsCount').get(function () {
  return this.comments ? this.comments.length : 0;
});

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
