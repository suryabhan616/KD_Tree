const express = require('express');
const router = express.Router();
const Location = require('../models/Location');
const KDTree = require('../kdtree/KDTree');

const tree = new KDTree();


// ➕ ADD LOCATION
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

        res.status(201).json({
            message: 'Location added successfully',
            location
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 📄 GET ALL LOCATIONS
router.get('/all', async (req, res) => {
    try {
        const locations = await Location.find();
        res.status(200).json(locations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 📍 FIND NEAREST (KD TREE)
router.post('/nearest', async (req, res) => {
    try {
        const { latitude, longitude, k } = req.body;

        const locations = await Location.find();

        if (locations.length === 0) {
            return res.status(404).json({ message: 'No locations found' });
        }

        const root = tree.build(locations, 0);
        const target = { latitude, longitude };

        const results = tree.findNearest(root, target, k || 5);

        // ✅ RETURN DIRECT ARRAY (IMPORTANT)
        res.status(200).json(results);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 📦 RANGE QUERY (KD TREE)
router.post('/range', async (req, res) => {
    try {
        const { minLat, maxLat, minLon, maxLon } = req.body;

        const locations = await Location.find();

        const results = locations.filter(loc =>
            loc.latitude >= minLat &&
            loc.latitude <= maxLat &&
            loc.longitude >= minLon &&
            loc.longitude <= maxLon
        );

        res.status(200).json(results);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ❌ DELETE LOCATION
router.delete('/delete/:id', async (req, res) => {
    try {
        await Location.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Location deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// 🔍 SEARCH BY NAME (IMPORTANT FEATURE)
router.get('/search', async (req, res) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const locations = await Location.find({
            name: { $regex: name, $options: 'i' } // case-insensitive
        });

        // ✅ ALWAYS RETURN ARRAY (even empty)
        res.status(200).json(locations);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;