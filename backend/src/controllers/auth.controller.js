const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Student, StudentInterest } = require('../models');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretcampuscompasskey12345', {
    expiresIn: '30d'
  });
};

const register = async (req, res) => {
  const { name, email, password, studentIdCard, department, year, division, interests } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create User
    const user = await User.create({
      name,
      email,
      password_hash,
      role: 'student' // Registration from frontend is always student
    });

    let studentProfile = null;
    if (studentIdCard && department && year && division) {
      const studentExists = await Student.findOne({ where: { student_id_card: studentIdCard } });
      if (studentExists) {
        return res.status(400).json({ message: 'Student ID card already exists' });
      }

      studentProfile = await Student.create({
        user_id: user.id,
        student_id_card: studentIdCard,
        department,
        year: parseInt(year),
        division
      });

      // Save interests
      if (interests && Array.isArray(interests)) {
        const interestData = interests.map(interest => ({
          student_id: studentProfile.id,
          interest
        }));
        await StudentInterest.bulkCreate(interestData);
      }
    }

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
      studentProfile
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({
      where: { email },
      include: {
        model: Student,
        include: [StudentInterest]
      }
    });

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
        studentProfile: user.Student
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
      include: {
        model: Student,
        include: [StudentInterest]
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

const updateMe = async (req, res) => {
  const { bio, skills, availability } = req.body;

  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    student.bio = bio;
    student.skills = skills;
    student.availability = availability;
    await student.save();

    res.json({ message: 'Profile updated successfully', student });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

const crypto = require('crypto');

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'No user registered with this email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.reset_token = resetTokenHash;
    user.reset_token_expires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.warn('BREVO_API_KEY is not defined in the server environment!');
      return res.status(500).json({ message: 'Email service not configured on backend.' });
    }

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: 'Campus Compass Support', email: process.env.BREVO_SENDER_EMAIL || 'support@campuscompass.edu' },
        to: [{ email: user.email, name: user.name }],
        subject: 'Password Reset Request - Campus Compass',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0b0f19; color: #ffffff; border-radius: 12px; border: 1px solid #2e303a;">
            <h2 style="color: #a855f7; text-align: center;">Campus Compass</h2>
            <p style="color: #ffffff;">Hello ${user.name},</p>
            <p style="color: #ffffff;">You requested to reset your password. Please click the button below to set a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #8b5cf6; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="font-size: 12px; color: #9ca3af;">This link is valid for 1 hour. If you did not request this, you can safely ignore this email.</p>
          </div>
        `
      })
    });

    if (emailResponse.ok) {
      res.json({ message: 'Password reset link sent to your college email' });
    } else {
      const errText = await emailResponse.text();
      console.error('Brevo email send failure:', errText);
      res.status(500).json({ message: 'Failed to send password reset email' });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during forgot password process' });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    if (!password) {
      return res.status(400).json({ message: 'New password is required' });
    }

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      where: {
        reset_token: resetTokenHash,
        reset_token_expires: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(password, salt);

    user.reset_token = null;
    user.reset_token_expires = null;
    await user.save();

    res.json({ message: 'Password reset successful! You can now log in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error resetting password' });
  }
};

module.exports = { register, login, getMe, updateMe, forgotPassword, resetPassword };
