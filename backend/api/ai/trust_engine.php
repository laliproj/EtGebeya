<?php
// backend/api/ai/trust_engine.php
// Recalculates and returns a seller's trust score
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

$sellerId = isset($_GET['sellerId']) ? (int)$_GET['sellerId'] : 0;
if (!$sellerId) {
    $body = json_decode(file_get_contents("php://input"), true);
    $sellerId = (int)($body['sellerId'] ?? 0);
}
if (!$sellerId) jsonResponse(false, "sellerId required", null, 400);

$database = new Database();
$db = $database->getConnection();

try {
    // Fetch seller base data
    $sellerStmt = $db->prepare("SELECT id, totalSold, totalRatings, trustScore, warnings, isBanned, 
        DATEDIFF(NOW(), created_at) as account_age_days
        FROM users WHERE id = :id LIMIT 1");
    $sellerStmt->execute([':id' => $sellerId]);
    $seller = $sellerStmt->fetch(PDO::FETCH_ASSOC);

    if (!$seller) jsonResponse(false, "Seller not found", null, 404);

    // ── Scoring Formula ───────────────────────────────────────────────────────
    // Base score = 50
    // + Sales bonus: up to +25 pts (5 pts per 2 sales, cap at 25)
    // + Rating bonus: up to +20 pts (trustScore * 4)
    // + Account age bonus: up to +5 pts (1 pt per 60 days, cap at 5)
    // - Warning deductions: -15 pts per warning
    // - Ban deduction: hard cap score at 10

    $salesPoints  = min(25, (int)($seller['totalSold'] / 2) * 5);
    $ratingPoints = min(20, (float)$seller['trustScore'] * 4);
    $agePoints    = min(5, (int)($seller['account_age_days'] / 60));
    $warnDeduct   = (int)$seller['warnings'] * 15;

    $rawScore = 50 + $salesPoints + $ratingPoints + $agePoints - $warnDeduct;

    // Product approval rate bonus
    $approvalStmt = $db->prepare("SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' OR status = 'sold' THEN 1 ELSE 0 END) as approved
        FROM products WHERE sellerId = :id");
    $approvalStmt->execute([':id' => $sellerId]);
    $approval = $approvalStmt->fetch(PDO::FETCH_ASSOC);
    if ($approval['total'] > 0) {
        $approvalRate = $approval['approved'] / $approval['total'];
        $rawScore += (int)($approvalRate * 10); // up to +10 pts
    }

