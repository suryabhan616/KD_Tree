class KDNode {
    constructor(point) {
        this.point = point;
        this.left = null;
        this.right = null;
    }
}

class KDTree {
    constructor() {
        this.root = null;
        
    }

    // Build tree from array of points
    build(points, depth = 0) {
        if (points.length === 0) return null;

        const axis = depth % 2; // 0 = latitude, 1 = longitude
        points.sort((a, b) => axis === 0 ? a.latitude - b.latitude : a.longitude - b.longitude);

        const median = Math.floor(points.length / 2);
        const node = new KDNode(points[median]);

        node.left = this.build(points.slice(0, median), depth + 1);
        node.right = this.build(points.slice(median + 1), depth + 1);

        return node;
    }

    // Calculate distance between two points in km
    distance(p1, p2) {
        const R = 6371; // Earth radius in km
        const dLat = (p2.latitude - p1.latitude) * Math.PI / 180;
        const dLon = (p2.longitude - p1.longitude) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(p1.latitude * Math.PI / 180) *
            Math.cos(p2.latitude * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // Find K nearest neighbors
    findNearest(root, target, k, depth = 0, results = []) {
        if (!root) return results;

        const dist = this.distance(root.point, target);
        results.push({ point: root.point, distance: dist });
        results.sort((a, b) => a.distance - b.distance);
        if (results.length > k) results.pop();

        const axis = depth % 2;
        const diff = axis === 0
            ? target.latitude - root.point.latitude
            : target.longitude - root.point.longitude;

        const near = diff <= 0 ? root.left : root.right;
        const far = diff <= 0 ? root.right : root.left;

        this.findNearest(near, target, k, depth + 1, results);

        if (results.length < k || Math.abs(diff) < results[results.length - 1].distance) {
            this.findNearest(far, target, k, depth + 1, results);
        }

        return results;
    }

    // Range query - find all points within a rectangle
    rangeQuery(root, minLat, maxLat, minLon, maxLon, depth = 0, results = []) {
        if (!root) return results;

        const { latitude, longitude } = root.point;

        if (latitude >= minLat && latitude <= maxLat &&
            longitude >= minLon && longitude <= maxLon) {
            results.push(root.point);
        }

        const axis = depth % 2;

        if (axis === 0) {
            if (minLat <= root.point.latitude)
                this.rangeQuery(root.left, minLat, maxLat, minLon, maxLon, depth + 1, results);
            if (maxLat >= root.point.latitude)
                this.rangeQuery(root.right, minLat, maxLat, minLon, maxLon, depth + 1, results);
        } else {
            if (minLon <= root.point.longitude)
                this.rangeQuery(root.left, minLat, maxLat, minLon, maxLon, depth + 1, results);
            if (maxLon >= root.point.longitude)
                this.rangeQuery(root.right, minLat, maxLat, minLon, maxLon, depth + 1, results);
        }

        return results;
    }

    // Coordinate hashing for zone calculation
    hashCoordinate(latitude, longitude) {
        const latZone = Math.floor(latitude / 10);
        const lonZone = Math.floor(longitude / 10);
        return `ZONE_${latZone}_${lonZone}`;
    }
}

module.exports = KDTree;