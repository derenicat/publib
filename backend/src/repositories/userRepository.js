import { User } from '../models/index.js';
import APIFeatures from '../utils/apiFeatures.js';

const userRepository = {
  /**
   * Finds a user by their email address.
   * @param {string} email - The email address to search for.
   * @returns {Promise<object|null>} A Mongoose document or null.
   */
  async findByEmail(email) {
    // Since we need the password for the 'login' process,
    // we explicitly include the 'password' field, which is normally not selected.
    return User.findOne({ email }).select('+password');
  },

  /**
   * Finds a user by their ID.
   * @param {string} id - The user ID to search for.
   * @returns {Promise<object|null>} A Mongoose document or null.
   */
  async findById(id) {
    return User.findById(id);
  },

  /**
   * Finds a user by their ID, including their password.
   * @param {string} id - The user ID to search for.
   * @returns {Promise<object|null>} A Mongoose document or null.
   */
  async findByIdWithPassword(id) {
    return User.findById(id).select('+password');
  },

  /**
   * Finds a user by their password reset token.
   * @param {string} hashedToken - The hashed password reset token.
   * @returns {Promise<object|null>} A Mongoose document or null.
   */
  async findByPasswordResetToken(hashedToken) {
    return User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
  },

  /**
   * Finds all active users with filtering, sorting, and pagination.
   * @param {object} queryParams - The req.query object from Express.
   * @returns {Promise<Array>} An array of Mongoose documents.
   */
  async findAll(queryParams) {
    // Build and chain the Mongoose query using the APIFeatures class.
    // User.find() is the initial query. The middleware will already add the { active: { $ne: false } } filter.
    const features = new APIFeatures(User.find(), queryParams)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // Execute the final, chained, and modified query.
    const users = await features.query;
    return users;
  },

  /**
   * Creates a new user.
   * @param {object} userData - The user data to create (username, email, password).
   * @returns {Promise<object>} The newly created Mongoose document.
   */
  async create(userData) {
    // Note: Password hashing is handled automatically by the 'pre-save' hook
    // in the userModel.
    const newUser = await User.create(userData);
    return newUser;
  },

  /**
   * Finds a user by ID and updates them.
   * @param {string} id - The ID of the user to update.
   * @param {object} data - The data to update.
   * @param {object} options - Mongoose findByIdAndUpdate options.
   * @returns {Promise<object>} The updated Mongoose document.
   */
  async findByIdAndUpdate(id, data, options) {
    return User.findByIdAndUpdate(id, data, options);
  },

  /**
   * Finds a user by ID and deletes them.
   * @param {string} id - The ID of the user to delete.
   * @returns {Promise<object|null>} The deleted Mongoose document or null if not found.
   */
  async deleteById(id) {
    return User.findByIdAndDelete(id);
  },
};

export default userRepository;