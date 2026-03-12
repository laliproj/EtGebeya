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
