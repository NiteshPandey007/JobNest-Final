// ============================================
// server.js - Main Entry Point
// ============================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// ============================================
// CORS (Simplified for Deployment)
// ============================================
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// CHECK ENV
// ============================================
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI missing in environment variables");
  process.exit(1);
}

// ============================================
// AUTO SETUP - Admin + Users + Jobs
// ============================================
async function autoSetup() {
  try {
    const User    = require('./models/User');
    const Company = require('./models/Company');
    const Job     = require('./models/Job');

    const adminExists = await User.findOne({ email: 'admin@jobnest.com' });
    if (!adminExists) {
      const admin = new User({
        name: 'Admin User',
        email: 'admin@jobnest.com',
        password: 'password123',
        role: 'admin',
        isActive: true
      });
      await admin.save();
      console.log('✅ Admin created');
    }

    let employer = await User.findOne({ email: 'employer@demo.com' });
    if (!employer) {
      employer = new User({
        name: 'Sarah Johnson',
        email: 'employer@demo.com',
        password: 'password123',
        role: 'employer',
        isActive: true
      });
      await employer.save();

      const company = new Company({
        name: 'TechVision Inc.',
        createdBy: employer._id,
        isVerified: true
      });

      await company.save();
      employer.company = company._id;
      await employer.save();

      console.log('✅ Employer created');
    }

    const seekerExists = await User.findOne({ email: 'seeker@demo.com' });
    if (!seekerExists) {
      const seeker = new User({
        name: 'Alex Rivera',
        email: 'seeker@demo.com',
        password: 'password123',
        role: 'jobseeker',
        isActive: true
      });
      await seeker.save();
      console.log('✅ Job Seeker created');
    }

    const jobCount = await Job.countDocuments();
    if (jobCount === 0) {
      const emp = await User.findOne({ email: 'employer@demo.com' }).populate('company');

      if (emp && emp.company) {
        await Job.insertMany([
          {
            title: 'React Developer',
            description: 'Build modern UI apps',
            jobType: 'full-time',
            location: 'Remote',
            status: 'active',
            postedBy: emp._id,
            company: emp.company._id
          }
        ]);
        console.log('✅ Demo Job created');
      }
    }

    console.log('✅ AUTO SETUP COMPLETE');
  } catch (err) {
    console.error('Setup error:', err.message);
  }
}

// ============================================
// DATABASE CONNECTION
// ============================================
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected!');
    await autoSetup();
  })
  .catch((err) => {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
  });

// ============================================
// ROUTES
// ============================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/companies', require('./routes/companies'));

// ============================================
// HEALTH CHECK
// ============================================
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Job Portal API is running!',
    status: 'OK'
  });
});

// ============================================
// ERROR HANDLING
// ============================================
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});