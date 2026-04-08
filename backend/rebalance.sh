#!/usr/bin/env bash

set -euo pipefail

echo "================================"
echo " KD-Tree Rebalancing Script"
echo "================================"

# Config

DB_NAME="kdtree_spatial"
COLLECTION="locations"
BACKUP_FILE="locations_backup_$(date +%Y%m%d_%H%M%S).json"

# Check dependencies

command -v mongosh >/dev/null || { echo "mongosh not found"; exit 1; }
command -v mongoexport >/dev/null || { echo "mongoexport not found"; exit 1; }
command -v node >/dev/null || { echo "Node.js not found"; exit 1; }

echo "[1] Fetching all locations from MongoDB..."
COUNT=$(mongosh "$DB_NAME" --quiet --eval "db.getCollection('$COLLECTION').countDocuments()")
echo "    Total locations found: $COUNT"

echo "[2] Checking if rebalancing is needed..."
if [[ "$COUNT" -lt 2 ]]; then
echo "    Not enough locations to rebalance. Add more locations first."
exit 1
fi

echo "[3] Exporting current locations..."
mongoexport 
--db="$DB_NAME" 
--collection="$COLLECTION" 
--out="$BACKUP_FILE" 
--quiet

echo "    Backup saved to $BACKUP_FILE"

echo "[4] Rebalancing KD-Tree..."
node <<EOF
const fs = require('fs');
const KDTree = require('./kdtree/KDTree');

try {
const data = JSON.parse(fs.readFileSync('$BACKUP_FILE', 'utf-8'));

```
const tree = new KDTree(data);

console.log('    KD-Tree rebalanced successfully');
console.log('    Total nodes indexed:', data.length);
```

} catch (err) {
console.error('    Error during rebalancing:', err.message);
process.exit(1);
}
EOF

echo "[5] Logging rebalance event to Git..."
git add .

if git diff --cached --quiet; then
echo "    No changes to commit"
else
git commit -m "KD-Tree rebalanced - $COUNT locations reindexed on $(date)"
echo "    Changes committed"
fi

echo "================================"
echo " Rebalancing Complete!"
echo "================================"