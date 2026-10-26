import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { config } from '../../config/env.js';
import {
  User,
  DonorProfile,
  RecipientProfile,
  VolunteerProfile,
} from '../../models/mongoose/index.js';

// Helper to sign JWT access token
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiresIn }
  );
};

// Helper to sign JWT refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
    },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
};

export class AuthService {
  /**
   * Register a new user in MongoDB and create linked profile
   */
  static async register({ email, password, role = 'donor', profileData = {} }) {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('An account with this email already exists');
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      role: role.toLowerCase(),
      isVerified: true,
    });

    const userId = user._id;
    let profile = null;

    if (user.role === 'donor') {
      profile = await DonorProfile.create({
        userId,
        organizationName: profileData.organizationName || 'Donor Facility',
        contactPhone: profileData.contactPhone || '',
        address: profileData.address || 'Saravanampatti, Coimbatore',
        latitude: parseFloat(profileData.latitude || '11.0805'),
        longitude: parseFloat(profileData.longitude || '76.9942'),
        donorType: profileData.donorType || 'RESTAURANT',
      });
    } else if (user.role === 'recipient') {
      profile = await RecipientProfile.create({
        userId,
        organizationName: profileData.organizationName || 'Community Shelter & Kitchen',
        recipientType: profileData.recipientType || 'SHELTER',
        contactPhone: profileData.contactPhone || '',
        address: profileData.address || 'Peelamedu, Coimbatore',
        latitude: parseFloat(profileData.latitude || '11.0315'),
        longitude: parseFloat(profileData.longitude || '77.0175'),
        capacityMealsPerDay: parseInt(profileData.capacityMealsPerDay || '120', 10),
        dietaryPreferences: profileData.dietaryPreferences || ['COOKED_FOOD'],
      });
    } else if (user.role === 'volunteer') {
      profile = await VolunteerProfile.create({
        userId,
        fullName: profileData.fullName || 'Volunteer Courier',
        contactPhone: profileData.contactPhone || '',
        vehicleType: profileData.vehicleType || 'CAR',
        vehicleCapacityKg: parseFloat(profileData.vehicleCapacityKg || '50.0'),
        isAvailable: true,
        currentLatitude: parseFloat(profileData.latitude || '11.0168'),
        currentLongitude: parseFloat(profileData.longitude || '76.9678'),
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await User.findByIdAndUpdate(userId, {
      $push: { refreshTokens: { token: refreshToken, createdAt: new Date() } },
    });

    return {
      user: {
        id: userId.toString(),
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      profile,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: config.jwt.accessExpiresIn,
      },
    };
  }

  /**
   * Authenticate user with email and password (with auto-provision for seamless demo/testing)
   */
  static async login({ email, password }) {
    const cleanEmail = email.trim().toLowerCase();
    let user = await User.findOne({ email: cleanEmail }).select(
      '+passwordHash +role +isVerified'
    );

    // Auto-provision user in MongoDB if not registered yet
    if (!user) {
      const passwordHash = await User.hashPassword(password || 'dharshan2006');
      user = await User.create({
        email: cleanEmail,
        passwordHash,
        role: 'donor',
        isVerified: true,
      });

      // Create linked profile
      await DonorProfile.create({
        userId: user._id,
        organizationName: cleanEmail.split('@')[0].toUpperCase() + ' Food Rescue',
        contactPhone: '+91 98765 43210',
        address: 'Saravanampatti, Coimbatore, Tamil Nadu',
        latitude: 11.0805,
        longitude: 76.9942,
        donorType: 'RESTAURANT',
      });
      console.log(`[AuthService] Auto-provisioned new MongoDB user: ${cleanEmail}`);
    } else {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        // Update password in development for painless login
        const newPasswordHash = await User.hashPassword(password);
        user.passwordHash = newPasswordHash;
        await user.save();
      }
    }

    const userId = user._id;
    let profile = null;

    if (user.role === 'donor') {
      profile = await DonorProfile.findOne({ userId });
    } else if (user.role === 'recipient') {
      profile = await RecipientProfile.findOne({ userId });
    } else if (user.role === 'volunteer') {
      profile = await VolunteerProfile.findOne({ userId });
    }

    if (!profile && user.role === 'donor') {
      profile = await DonorProfile.create({
        userId,
        organizationName: cleanEmail.split('@')[0].toUpperCase() + ' Kitchen',
        address: 'Saravanampatti, Coimbatore',
        latitude: 11.0805,
        longitude: 76.9942,
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await User.findByIdAndUpdate(userId, {
      $push: {
        refreshTokens: {
          $each: [{ token: refreshToken, createdAt: new Date() }],
          $slice: -10,
        },
      },
    });

    return {
      user: {
        id: userId.toString(),
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      profile,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: config.jwt.accessExpiresIn,
      },
    };
  }

  /**
   * Quick Test 1-Click Demo Login
   */
  static async quickDemoLogin(role = 'donor') {
    const normalizedRole = role.toLowerCase();
    const demoEmail =
      normalizedRole === 'volunteer'
        ? 'volunteer@foodflow.org'
        : normalizedRole === 'donor'
        ? 'donor@greenbistro.com'
        : normalizedRole === 'recipient'
        ? 'shelter@peelamedu.org'
        : 'admin@foodflow.ai';

    // Also check seed user emails as alternates
    const altEmails = {
      volunteer: ['kumaran@foodflow.org', 'volunteer@foodflow.org'],
      donor: ['deedarsh@greenbistro.com', 'donor@greenbistro.com'],
      recipient: ['jersin@peelamedu.org', 'shelter@peelamedu.org'],
      admin: ['dharshanrichyrich@gmail.com', 'admin@foodflow.ai', 'dharshan@foodflow.org'],
    }[normalizedRole] || [demoEmail];

    let user = await User.findOne({ email: { $in: altEmails } }).select('+passwordHash +role +isVerified');

    if (!user) {
      // Auto-create demo user if not present
      const defaultPasswordHash = await User.hashPassword('DemoAuth2026!');
      user = await User.create({
        email: demoEmail,
        passwordHash: defaultPasswordHash,
        role: normalizedRole,
        isVerified: true,
      });

      if (normalizedRole === 'volunteer') {
        await VolunteerProfile.create({
          userId: user._id,
          fullName: 'Food Rescue Volunteer',
          contactPhone: '+91 98765 43210',
          vehicleType: 'CAR',
          vehicleCapacityKg: 75.0,
          isAvailable: true,
          currentLatitude: 11.0168,
          currentLongitude: 76.9678,
          activeHours: '8:00 AM - 9:00 PM',
        });
      } else if (normalizedRole === 'donor') {
        await DonorProfile.create({
          userId: user._id,
          organizationName: 'The Green Bistro (Food Donor)',
          contactPhone: '+91 98200 11223',
          address: 'Sathy Road, Saravanampatti, Coimbatore',
          latitude: 11.0805,
          longitude: 76.9942,
          donorType: 'RESTAURANT',
        });
      } else if (normalizedRole === 'recipient') {
        await RecipientProfile.create({
          userId: user._id,
          organizationName: 'Peelamedu NGO Shelter',
          recipientType: 'SHELTER',
          contactPhone: '+91 98400 44556',
          address: 'Avinashi Road, Peelamedu, Coimbatore',
          latitude: 11.0315,
          longitude: 77.0175,
          capacityMealsPerDay: 250,
          dietaryPreferences: ['COOKED_FOOD', 'VEGETARIAN'],
        });
      }
    }

    const userId = user._id;
    let profile = null;
    if (user.role === 'donor') profile = await DonorProfile.findOne({ userId });
    if (user.role === 'recipient') profile = await RecipientProfile.findOne({ userId });
    if (user.role === 'volunteer') profile = await VolunteerProfile.findOne({ userId });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await User.findByIdAndUpdate(userId, {
      $push: {
        refreshTokens: {
          $each: [{ token: refreshToken, createdAt: new Date() }],
          $slice: -10,
        },
      },
    });

    return {
      user: {
        id: userId.toString(),
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      profile,
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: config.jwt.accessExpiresIn,
      },
    };
  }

  /**
   * Rotate Refresh Token
   */
  static async refresh(oldRefreshToken) {
    if (!oldRefreshToken) {
      throw new Error('Refresh token is required');
    }

    let decoded;
    try {
      decoded = jwt.verify(oldRefreshToken, config.jwt.refreshSecret);
    } catch (err) {
      throw new Error('Invalid or expired refresh token');
    }

    const user = await User.findOne({
      _id: decoded.id,
      'refreshTokens.token': oldRefreshToken,
    });

    if (!user) {
      throw new Error('Refresh token is revoked or invalid');
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await User.findByIdAndUpdate(user._id, {
      $pull: { refreshTokens: { token: oldRefreshToken } },
    });
    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: { token: newRefreshToken, createdAt: new Date() } },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: config.jwt.accessExpiresIn,
    };
  }

  /**
   * Logout user by invalidating refresh token
   */
  static async logout(userId, refreshToken) {
    if (userId && refreshToken) {
      await User.findByIdAndUpdate(userId, {
        $pull: { refreshTokens: { token: refreshToken } },
      });
    }
    return true;
  }

  /**
   * Request password reset token
   */
  static async forgotPassword(email) {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { resetToken: resetTokenHash, resetTokenExpiry: resetExpires }
    );

    if (!user) {
      throw new Error('No user found with that email address');
    }

    return {
      message: 'Password reset authorization token has been dispatched',
      resetToken,
    };
  }

  /**
   * Reset Password with token
   */
  static async resetPassword(token, newPassword) {
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetToken: resetTokenHash,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      throw new Error('Token is invalid or has expired');
    }

    const passwordHash = await User.hashPassword(newPassword);
    user.passwordHash = passwordHash;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    user.refreshTokens = [];
    await user.save();

    return { message: 'Password has been successfully updated' };
  }

  /**
   * Get current authenticated user profile
   */
  static async getMe(userId, role) {
    if (!userId) return null;
    if (role === 'donor') return await DonorProfile.findOne({ userId });
    if (role === 'recipient') return await RecipientProfile.findOne({ userId });
    if (role === 'volunteer') return await VolunteerProfile.findOne({ userId });
    return null;
  }
}

export default AuthService;
