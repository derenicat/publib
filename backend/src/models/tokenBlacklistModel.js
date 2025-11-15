import mongoose from 'mongoose';

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    // This creates a TTL index, so MongoDB will automatically delete documents
    // after the specified amount of time.
    expires: 0, // The document will expire at the 'expiresAt' date
  },
});

const TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema);

export default TokenBlacklist;
