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
