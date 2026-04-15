const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const locationRoutes = require('./routes/locationRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/locations', locationRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'KD-Tree Spatial API is running!' });
});

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected Successfully');

        // Seed default users
        const User = require('./models/User');
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            await User.create({ username: 'admin', password: 'admin123', role: 'admin', email: 'admin@geo.com' });
            console.log('Default admin created: admin/admin123');
        }
        const userExists = await User.findOne({ username: 'user' });
        if (!userExists) {
            await User.create({ username: 'user', password: 'user123', role: 'user', email: 'user@geo.com' });
            console.log('Default user created: user/user123');
        }

        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log('MongoDB Connection Error:', err);
    });