<?php
// backend/api/ai/recommendations.php
// Returns personalized product recommendations based on user behavior
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$database = new Database();
$db = $database->getConnection();

// Try to get authenticated user (optional - works for guests too)
$userId = null;
try {
    $userId = AuthMiddleware::authenticate();
} catch (Exception $e) {
    // Guest user — fall back to trending
}

$limit = min(12, (int)($_GET['limit'] ?? 8));
$excludeId = isset($_GET['productId']) ? (int)$_GET['productId'] : null;

$recommendations = [];
$strategy = 'trending'; // default

try {
    if ($userId) {
        // ── Strategy 1: Based on user's viewed categories & brands ──────────────
        $behaviorStmt = $db->prepare("
            SELECT category, brand, COUNT(*) as weight
            FROM user_behavior_logs
            WHERE user_id = :uid AND logged_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY category, brand
            ORDER BY weight DESC
            LIMIT 5");
        $behaviorStmt->execute([':uid' => $userId]);
        $interests = $behaviorStmt->fetchAll(PDO::FETCH_ASSOC);

        if (!empty($interests)) {
            $strategy = 'personalized';
            $topCategory = $interests[0]['category'];
            $topBrand    = $interests[0]['brand'];

            // Build OR conditions for categories and brands user is interested in
            $conditions = [];
            $params = [':status' => 'active'];
            $i = 0;
            foreach ($interests as $interest) {
                $ck = ':cat' . $i;
                $bk = ':brand' . $i;
                $conditions[] = "(p.category = $ck OR p.brand = $bk)";
                $params[$ck] = $interest['category'];
                $params[$bk] = $interest['brand'];
                $i++;
            }

            $excludeClause = $excludeId ? "AND p.id != :excl" : "";
            if ($excludeId) $params[':excl'] = $excludeId;

            $query = "SELECT p.id, p.title, p.price, p.category, p.brand, p.condition, p.location, p.postedAt, p.views,
                        u.name as sellerName, u.trustScore as sellerRating,
                        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_cover = 1 LIMIT 1) as coverImage
                      FROM products p
                      LEFT JOIN users u ON p.sellerId = u.id
                      WHERE p.status = 'active' AND p.sellerId != :uid $excludeClause
                      AND (" . implode(" OR ", $conditions) . ")
                      ORDER BY p.isFeatured DESC, p.views DESC, p.postedAt DESC
                      LIMIT :lim";
            $params[':uid'] = $userId;
            $params[':lim'] = $limit;

            $stmt = $db->prepare($query);
            foreach ($params as $k => $v) {
                $type = is_int($v) ? PDO::PARAM_INT : PDO::PARAM_STR;
                $stmt->bindValue($k, $v, $type);
            }
            $stmt->execute();
            $recommendations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }

        // ── Strategy 2: Wishlist-based (if behavior empty) ─────────────────────
        if (empty($recommendations)) {
            $strategy = 'wishlist';
            $wlStmt = $db->prepare("
                SELECT DISTINCT p.category, p.brand
                FROM wishlist w
                JOIN products p ON w.product_id = p.id
                WHERE w.user_id = :uid LIMIT 3");
            $wlStmt->execute([':uid' => $userId]);
            $wishlistPrefs = $wlStmt->fetchAll(PDO::FETCH_ASSOC);

            if (!empty($wishlistPrefs)) {
                $cats = array_column($wishlistPrefs, 'category');
                $placeholders = implode(',', array_fill(0, count($cats), '?'));
                $wlRec = $db->prepare("
                    SELECT p.id, p.title, p.price, p.category, p.brand, p.condition, p.location, p.postedAt, p.views,
                        u.name as sellerName, u.trustScore as sellerRating,
                        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_cover = 1 LIMIT 1) as coverImage
                    FROM products p LEFT JOIN users u ON p.sellerId = u.id
                    WHERE p.status = 'active' AND p.category IN ($placeholders)
                    ORDER BY p.isFeatured DESC, p.postedAt DESC LIMIT $limit");
                $wlRec->execute($cats);
                $recommendations = $wlRec->fetchAll(PDO::FETCH_ASSOC);
            }
        }
    }

    // ── Strategy 3: Trending Fallback ──────────────────────────────────────────
    if (empty($recommendations)) {
        $strategy = 'trending';
        $excludeClause = $excludeId ? "AND p.id != :excl" : "";
        $params = [':lim' => $limit];
        if ($excludeId) $params[':excl'] = $excludeId;

        $stmt = $db->prepare("
            SELECT p.id, p.title, p.price, p.category, p.brand, p.condition, p.location, p.postedAt, p.views,
                u.name as sellerName, u.trustScore as sellerRating,
                (SELECT image_url FROM product_images WHERE product_id = p.id AND is_cover = 1 LIMIT 1) as coverImage
            FROM products p LEFT JOIN users u ON p.sellerId = u.id
            WHERE p.status = 'active' $excludeClause
            ORDER BY p.isFeatured DESC, p.views DESC, p.postedAt DESC
            LIMIT :lim");
        foreach ($params as $k => $v) {
            $stmt->bindValue($k, $v, is_int($v) ? PDO::PARAM_INT : PDO::PARAM_STR);
        }
        $stmt->execute();
        $recommendations = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Format results
    $formatted = array_map(function($p) {
        return [
            'id'           => (int)$p['id'],
            'title'        => $p['title'],
            'price'        => (float)$p['price'],
            'category'     => $p['category'],
            'brand'        => $p['brand'],
            'condition'    => $p['condition'],
            'location'     => $p['location'],
            'postedAt'     => $p['postedAt'],
            'views'        => (int)$p['views'],
            'sellerName'   => $p['sellerName'],
            'sellerRating' => (float)$p['sellerRating'],
            'images'       => $p['coverImage'] ? [$p['coverImage']] : [],
        ];
    }, $recommendations);

    jsonResponse(true, "Recommendations retrieved", [
        'strategy'        => $strategy,
        'recommendations' => $formatted,
    ]);

} catch (PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
