class KDNode {
    constructor(point, axis) {
        this.point = point;
        this.axis = axis; // 0 = latitude, 1 = longitude
        this.left = null;
        this.right = null;
    }
}

class KDTree {
    constructor(points = []) {
        this.root = this.build(points, 0);
    }

    // Build KD Tree (optimized: avoid repeated slicing)
    build(points, depth = 0) {
        if (!points || points.length === 0) return null;

        const axis = depth % 2;

        points.sort((a, b) =>
            axis === 0
                ? a.latitude - b.latitude
                : a.longitude - b.longitude
        );

        const mid = Math.floor(points.length / 2);
        const node = new KDNode(points[mid], axis);

        node.left = this.build(points.slice(0, mid), depth + 1);
        node.right = this.build(points.slice(mid + 1), depth + 1);

        return node;
    }

    // Haversine distance (optimized constants reuse)
    static toRad(deg) {
        return deg * Math.PI / 180;
    }

    distance(p1, p2) {
        const R = 6371;
        const dLat = KDTree.toRad(p2.latitude - p1.latitude);
        const dLon = KDTree.toRad(p2.longitude - p1.longitude);

        const lat1 = KDTree.toRad(p1.latitude);
        const lat2 = KDTree.toRad(p2.latitude);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) ** 2;

        return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // K nearest neighbors (optimized: fixed-size max heap behavior)
    findNearest(target, k) {
        const results = [];

        const search = (node) => {
            if (!node) return;

            const dist = this.distance(node.point, target);

            // Insert in sorted order (small k → faster than heap)
            let i = results.length - 1;
            while (i >= 0 && results[i].distance > dist) i--;

            results.splice(i + 1, 0, { point: node.point, distance: dist });
            if (results.length > k) results.pop();

            const axis = node.axis;
            const diff = axis === 0
                ? target.latitude - node.point.latitude
                : target.longitude - node.point.longitude;

            const near = diff <= 0 ? node.left : node.right;
            const far = diff <= 0 ? node.right : node.left;

            search(near);

            // Prune check (important optimization)
            if (
                results.length < k ||
                Math.abs(diff) < results[results.length - 1].distance
            ) {
                search(far);
            }
        };

        search(this.root);
        return results;
    }

    // Range query (cleaned recursion)
    rangeQuery(minLat, maxLat, minLon, maxLon) {
        const results = [];

        const search = (node) => {
            if (!node) return;

            const { latitude, longitude } = node.point;

            if (
                latitude >= minLat && latitude <= maxLat &&
                longitude >= minLon && longitude <= maxLon
            ) {
                results.push(node.point);
            }

            const axis = node.axis;

            if (axis === 0) {
                if (minLat <= latitude) search(node.left);
                if (maxLat >= latitude) search(node.right);
            } else {
                if (minLon <= longitude) search(node.left);
                if (maxLon >= longitude) search(node.right);
            }
        };

        search(this.root);
        return results;
    }

    // Coordinate hashing (unchanged but cleaner)
    hashCoordinate(latitude, longitude) {
        return `ZONE_${Math.floor(latitude / 10)}_${Math.floor(longitude / 10)}`;
    }
}

module.exports = KDTree;