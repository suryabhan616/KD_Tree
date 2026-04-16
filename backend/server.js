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

        // ✅ Seed default users
        const User = require('./models/User');
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            await User.create({ username: 'admin', password: 'admin123', role: 'admin', email: 'admin@geo.com' });
            console.log('Default admin created: admin / admin123');
        }
        const userExists = await User.findOne({ username: 'user' });
        if (!userExists) {
            await User.create({ username: 'user', password: 'user123', role: 'user', email: 'user@geo.com' });
            console.log('Default user created: user / user123');
        }

        // ✅ Seed default locations (only if DB is empty)
        const Location = require('./models/Location');
        const KDTree = require('./kdtree/KDTree');
        const tree = new KDTree();

        const locCount = await Location.countDocuments();
        if (locCount === 0) {
            const defaultLocations = [
                { name: 'Mumbai',    latitude: 19.07, longitude: 72.87 },
                { name: 'Delhi',     latitude: 28.61, longitude: 77.21 },
                { name: 'Hyderabad', latitude: 17.38, longitude: 78.48 },
                { name: 'Ahmedabad', latitude: 23.02, longitude: 72.57 },
                { name: 'Chennai',   latitude: 13.08, longitude: 80.27 },
                { name: 'Jaipur',    latitude: 26.91, longitude: 75.78 },
            ];
            for (const loc of defaultLocations) {
                const zone = tree.hashCoordinate(loc.latitude, loc.longitude);
                await Location.create({
                    name: loc.name,
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    zone,
                    coordinates: { type: 'Point', coordinates: [loc.longitude, loc.latitude] }
                });
            }
            console.log('✅ Default locations seeded: Mumbai, Delhi, Hyderabad, Ahmedabad, Chennai, Jaipur');
        }

        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log('MongoDB Connection Error:', err);
    });
