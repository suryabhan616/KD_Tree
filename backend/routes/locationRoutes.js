const express = require('express');
const router = express.Router();
const Location = require('../models/Location');
const KDTree = require('../kdtree/KDTree');

<<<<<<< HEAD
=======
const tree = new KDTree();


>>>>>>> origin/master
// ➕ ADD LOCATION
router.post('/add', async (req, res) => {
    try {
        const { name, latitude, longitude } = req.body;

        // Use KDTree just for zone hashing
        const tempTree = new KDTree([]);
        const zone = tempTree.hashCoordinate(latitude, longitude);

        const location = new Location({
            name, latitude, longitude, zone,
            coordinates: { type: 'Point', coordinates: [longitude, latitude] }
        });
        await location.save();
<<<<<<< HEAD
        res.status(201).json({ message: 'Location added successfully', location });
=======

        res.status(201).json({
            message: 'Location added successfully',
            location
        });

>>>>>>> origin/master
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

<<<<<<< HEAD
=======

>>>>>>> origin/master
// 📄 GET ALL LOCATIONS
router.get('/all', async (req, res) => {
    try {
        const locations = await Location.find();
        res.status(200).json(locations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

<<<<<<< HEAD
=======

>>>>>>> origin/master
// 📍 FIND NEAREST (KD TREE)
router.post('/nearest', async (req, res) => {
    try {
        const { latitude, longitude, k } = req.body;

        const locations = await Location.find();
        if (locations.length === 0) {
            return res.status(404).json({ message: 'No locations found' });
        }

        // Build tree with all locations, then call findNearest(target, k)
        const tree = new KDTree(locations);
        const target = { latitude, longitude };
<<<<<<< HEAD
        const results = tree.findNearest(target, k || 5);

        res.status(200).json({ results });
=======

        const results = tree.findNearest(root, target, k || 5);

        // ✅ RETURN DIRECT ARRAY (IMPORTANT)
        res.status(200).json(results);

>>>>>>> origin/master
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

<<<<<<< HEAD
=======

>>>>>>> origin/master
// 📦 RANGE QUERY (KD TREE)
router.post('/range', async (req, res) => {
    try {
        const { minLat, maxLat, minLon, maxLon } = req.body;

        const locations = await Location.find();
<<<<<<< HEAD
        if (locations.length === 0) {
            return res.status(404).json({ message: 'No locations found in database' });
        }

        // Build tree with all locations, then call rangeQuery(minLat, maxLat, minLon, maxLon)
        const tree = new KDTree(locations);
        const results = tree.rangeQuery(minLat, maxLat, minLon, maxLon);

        res.status(200).json({ results });
=======

        const results = locations.filter(loc =>
            loc.latitude >= minLat &&
            loc.latitude <= maxLat &&
            loc.longitude >= minLon &&
            loc.longitude <= maxLon
        );

        res.status(200).json(results);

>>>>>>> origin/master
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

<<<<<<< HEAD
// 🔍 SEARCH BY NAME
router.get('/search', async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) return res.status(400).json({ message: 'Name is required' });
        const locations = await Location.find({ name: { $regex: name, $options: 'i' } });
        res.status(200).json(locations);
=======

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

>>>>>>> origin/master
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

<<<<<<< HEAD
module.exports = router;
=======

module.exports = router;
>>>>>>> origin/master
