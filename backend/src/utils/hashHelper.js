import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10; // Salt rounds for password hashing

export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};
