<?php
// backend/api/products/update.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validator.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Authenticate and get seller ID
$sellerId = AuthMiddleware::authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    jsonResponse(false, "Method not allowed", null, 405);
}

if (!isset($_GET['id'])) {
    jsonResponse(false, "Product ID is required", null, 400);
}

$productId = (int)$_GET['id'];
$data = json_decode(file_get_contents("php://input"), true);

$database = new Database();
$db = $database->getConnection();

try {
    // Verify ownership
    $checkStmt = $db->prepare("SELECT sellerId FROM products WHERE id = :id");
    $checkStmt->execute([':id' => $productId]);
    if ($checkStmt->rowCount() === 0) {
        jsonResponse(false, "Product not found", null, 404);
    }
    
    $row = $checkStmt->fetch(PDO::FETCH_ASSOC);
