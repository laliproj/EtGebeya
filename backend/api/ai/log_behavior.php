<?php
// backend/api/ai/log_behavior.php
// Logs user views, searches, and wishlist adds for recommendation engine
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$userId = AuthMiddleware::authenticate();
$data = json_decode(file_get_contents("php://input"), true);

$action    = $data['action'] ?? 'view';
$productId = $data['productId'] ?? null;
$category  = $data['category'] ?? null;
$brand     = $data['brand'] ?? null;

