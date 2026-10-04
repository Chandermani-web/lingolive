import User from '../models/auth.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// 🔹 Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '10d' });
};
// 🔹 Signup
export const signup = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res
            .status(400)
            .json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const genSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, genSalt);

    // Save user
    const newUser = new User({ username: username || username.split("@")[0], email, password: hashedPassword });
    await newUser.save();

    // Generate JWT
    const token = generateToken(newUser._id);

    // Set cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: false, // change to true in production (https)
        sameSite: 'lax', // "none" if using https
        maxAge: 24 * 60 * 60 * 1000,
    });

    return res
        .status(201)
        .json({ message: 'User created successfully', token, user: newUser });
});

// 🔹 Login
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
        return res
            .status(400)
            .json({ success: false, message: 'User not found' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = generateToken(existingUser._id);

    // Set cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: false, // change to true in production (https)
        sameSite: 'lax', // "none" if using https
        maxAge: 10 * 24 * 60 * 60 * 1000,
    });

    return res
        .status(200)
        .json({ message: 'Login successful', token, user: existingUser });
});

// 🔹 Logout
export const logout = asyncHandler(async (req, res) => {
    res.clearCookie('token');
    return res.status(200).json({ message: 'User logged out successfully' });
});


// AllUser
export const AllUser = asyncHandler(async (req,res)=>{
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
    const skip = (page - 1) * limit;
    const filter = { _id: { $ne: req.user._id } };
    const userFields = 'username email profilePic fullname coverPic bio location friends followers following interests socialLinks';

    const [alluser, total] = await Promise.all([
        User.find(filter)
            .select(userFields)
            .sort({ createdAt: -1, _id: -1 })
            .skip(skip)
            .limit(limit),
        User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
        success: true,
        users: alluser,
        data: alluser,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasMore: page < totalPages,
        },
    });
})