const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const locationRoutes = require('./routes/locationRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/locations', locationRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'KD-Tree Spatial API is running!' });
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected Successfully');
        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.log('MongoDB Connection Error:', err);
    });
