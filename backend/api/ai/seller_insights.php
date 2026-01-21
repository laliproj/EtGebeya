<?php
// backend/api/ai/seller_insights.php
// Provides AI insights for the Seller Dashboard
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$userId = AuthMiddleware::authenticate();

$database = new Database();
$db = $database->getConnection();

try {
    // 1. Get Trust Score details
    $trustStmt = $db->prepare("SELECT score, level FROM seller_trust_scores WHERE seller_id = :uid LIMIT 1");
    $trustStmt->execute([':uid' => $userId]);
    $trust = $trustStmt->fetch(PDO::FETCH_ASSOC) ?: ['score' => 50, 'level' => 'bronze'];

    // 2. Pricing Competitiveness (How many of their active listings are "great_deal" or "fair_price")
