<?php
// backend/api/ai/negotiation.php — Smart Price Negotiation AI
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$userId = AuthMiddleware::authenticate();

$data       = json_decode(file_get_contents("php://input"), true);
$productId  = (int)($data['productId'] ?? 0);
$offerPrice = (float)($data['offerPrice'] ?? 0);

if (!$productId || $offerPrice <= 0) {
    jsonResponse(false, "Missing required fields", null, 400);
}

$database = new Database();
