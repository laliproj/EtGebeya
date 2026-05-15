<?php
// backend/api/messages/send.php
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
$receiverId = (int)($data['receiverId'] ?? 0);
$productId = isset($data['productId']) ? (int)$data['productId'] : null;
$content = trim($data['content'] ?? '');

if (!$receiverId || empty($content)) {
    jsonResponse(false, "Receiver and content are required.", null, 400);
}

$database = new Database();
