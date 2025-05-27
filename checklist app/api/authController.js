const { pool } = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login user
const loginUser = async (req, res) => {
  try {
    const { empid, password } = req.body;
    
    console.log('=== LOGIN DEBUG ===');
    console.log('Received empid:', empid);
    console.log('Received password:', password);
    
    if (!empid || !password) {
      console.log('Missing empid or password');
      return res.status(400).json({ success: false, error: 'Employee ID and password are required' });
    }
    
    // Check grm_pic
    console.log('Checking grm_pic table...');
    const picResult = await pool.query('SELECT empid FROM grm_pic WHERE empid = $1', [empid]);
    console.log('grm_pic results:', picResult.rows);
    
    if (picResult.rows.length === 0) {
      console.log('Employee ID not found in grm_pic');
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    // Check users
    console.log('Checking users table...');
    const userResult = await pool.query('SELECT empid, password FROM users WHERE empid = $1', [empid]);
    console.log('users results:', userResult.rows);
    
    if (userResult.rows.length === 0) {
      console.log('User not found in users table');
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];
    console.log('Found user:', user.empid);
    console.log('Stored password:', user.password);
    console.log('Input password:', password);
    
    let passwordMatch = false;

    // First try direct comparison
    if (password === user.password) {
      console.log('Direct password match - SUCCESS');
      passwordMatch = true;
    } else {
      console.log('Direct password match - FAILED');
      
      // Then try bcrypt
      try {
        passwordMatch = await bcrypt.compare(password, user.password);
        console.log('Bcrypt comparison result:', passwordMatch);
      } catch (bcryptError) {
        console.log('Bcrypt comparison failed:', bcryptError.message);
        passwordMatch = false;
      }
    }

    if (!passwordMatch) {
      console.log('ALL PASSWORD CHECKS FAILED');
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    console.log('Password verified successfully!');

    // Generate token
    const token = jwt.sign({ empid }, process.env.JWT_SECRET, { expiresIn: '24h' });

    console.log('Login successful for:', empid);
    console.log('=== END LOGIN DEBUG ===');

    res.json({ 
      success: true, 
      token,
      user: { empid }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
};

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'No token' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    res.status(403).json({ success: false, error: 'Invalid token' });
  }
};

module.exports = {
  loginUser,
  verifyToken
};