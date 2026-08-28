import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongodbUri:
    process.env.MONGODB_URI ||
    'mongodb+srv://dharshanrichyrich_db_user:dharshan2006@cluster0.18yqa28.mongodb.net/food_waste_auth?retryWrites=true&w=majority',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'food_waste_dev_access_secret_key_2026',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'food_waste_dev_refresh_secret_key_2026',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
};

export default config;
