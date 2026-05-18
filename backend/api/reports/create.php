<?php
// backend/api/reports/create.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validator.php';
require_once __DIR__ . '/../../middleware/auth.php';

$userId = AuthMiddleware::authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, "Method not allowed", null, 405);
}

$data = json_decode(file_get_contents("php://input"), true);

$missing = Validator::checkRequired($data, ['productId', 'reason']);
if (!empty($missing)) {
    jsonResponse(false, "Missing required fields: " . implode(', ', $missing), null, 400);
}

$productId = (int)$data['productId'];
$reason = Validator::sanitize($data['reason']);
$details = isset($data['details']) ? Validator::sanitize($data['details']) : '';

$database = new Database();
$db = $database->getConnection();

// Check if user is the seller of the product
$sellerQuery = "SELECT sellerId FROM products WHERE id = :product";
$sellerStmt = $db->prepare($sellerQuery);
$sellerStmt->execute([':product' => $productId]);
$sellerId = $sellerStmt->fetchColumn();

if ($sellerId === $userId) {
    jsonResponse(false, "You cannot report your own product", null, 400);
}

try {
    $db->beginTransaction();

