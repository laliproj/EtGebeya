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
