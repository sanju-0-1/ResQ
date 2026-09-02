import { Request, Response } from 'express';
import { User } from '../models/User';
import { ResponderProfile } from '../models/ResponderProfile';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, username, email, phone, password, dateOfBirth, role, profilePhoto } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }, { phone }],
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) return sendError(res, 'Email already registered', 400);
      if (existingUser.username === username.toLowerCase()) return sendError(res, 'Username already taken', 400);
      if (existingUser.phone === phone) return sendError(res, 'Phone number already registered', 400);
    }

    const newUser = new User({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      phone,
      password,
      dateOfBirth,
      role: role || 'resq',
      profilePhoto: profilePhoto || '',
    });

    await newUser.save();

    // Every registered user automatically gets a responder profile
    if (newUser.role === 'resq' || newUser.role === 'homegirl') {
      await ResponderProfile.create({
        userId: newUser._id,
        verificationStatus: 'pending',
        isAvailable: false,
      });
    }

    const payload = { userId: newUser._id.toString(), role: newUser.role, email: newUser.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const userObj = newUser.toObject();
    delete userObj.password;

    return sendSuccess(res, 'Registration successful', {
      user: userObj,
      accessToken,
      refreshToken,
    }, 201);
  } catch (error) {
    return sendError(res, 'Registration failed', 500, error);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { emailOrPhoneOrUsername, password } = req.body;
    const term = emailOrPhoneOrUsername.toLowerCase().trim();

    const user = await User.findOne({
      $or: [{ email: term }, { username: term }, { phone: term }],
    }).select('+password');

    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }

    if (user.status === 'banned') {
      return sendError(res, 'Account is banned.', 403);
    }

    if (user.status === 'suspended') {
      return sendError(res, 'Account is currently suspended.', 403);
    }

    user.lastActiveAt = new Date();
    await user.save();

    const payload = { userId: user._id.toString(), role: user.role, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const userObj = user.toObject();
    delete userObj.password;

    return sendSuccess(res, 'Login successful', {
      user: userObj,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return sendError(res, 'Login failed', 500, error);
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const payload = verifyRefreshToken(refreshToken);

    const user = await User.findById(payload.userId);
    if (!user || user.status !== 'active') {
      return sendError(res, 'User inactive or invalid token', 401);
    }

    const newAccessToken = generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    });

    return sendSuccess(res, 'Token refreshed successfully', {
      accessToken: newAccessToken,
    });
  } catch (error) {
    return sendError(res, 'Invalid or expired refresh token', 401, error);
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  return sendSuccess(res, 'Logout successful');
};
