const express = require('express');
const router = express.Router();
const Location = require('../models/Location');
const KDTree = require('../kdtree/KDTree');

const tree = new KDTree();

// ==================
// ADD A NEW LOCATION
// ==================
router.post('/add', async (req, res) => {
    try {
        const { name, latitude, longitude } = req.body;

        const zone = tree.hashCoordinate(latitude, longitude);

        const location = new Location({
            name,
            latitude,
            longitude,
            zone,
            coordinates: {
                type: 'Point',
                coordinates: [longitude, latitude]
            }
        });

        await location.save();
        res.status(201).json({ message: 'Location added successfully', location });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================
// GET ALL LOCATIONS
// ==================
router.get('/all', async (req, res) => {
    try {
        const locations = await Location.find();
        res.status(200).json(locations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =======================
// FIND K NEAREST NEIGHBORS
// =======================
router.post('/nearest', async (req, res) => {
    try {
        const { latitude, longitude, k } = req.body;

        const locations = await Location.find();

        if (locations.length === 0) {
            return res.status(404).json({ message: 'No locations found in database' });
        }

        const root = tree.build(locations, 0);
        const target = { latitude, longitude };
        const results = tree.findNearest(root, target, k || 5);

        res.status(200).json({ results });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================
// RANGE QUERY
// ==================
router.post('/range', async (req, res) => {
    try {
        const { minLat, maxLat, minLon, maxLon } = req.body;

        const locations = await Location.find();

        if (locations.length === 0) {
            return res.status(404).json({ message: 'No locations found in database' });
        }

        const root = tree.build(locations, 0);
        const results = tree.rangeQuery(root, minLat, maxLat, minLon, maxLon);

        res.status(200).json({ results });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================
// DELETE A LOCATION
// ==================
router.delete('/delete/:id', async (req, res) => {
    try {
        await Location.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Location deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;