<?php
// backend/api/products/mark-sold.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$sellerId = AuthMiddleware::authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, "Method not allowed", null, 405);
}

$data = json_decode(file_get_contents("php://input"), true);
$productId = (int)($data['productId'] ?? 0);

if (!$productId) {
    jsonResponse(false, "Product ID is required", null, 400);
}

$database = new Database();
$db = $database->getConnection();

try {
    // Verify ownership
    $checkStmt = $db->prepare("SELECT sellerId, title FROM products WHERE id = :id");
    $checkStmt->execute([':id' => $productId]);
    if ($checkStmt->rowCount() === 0) {
        jsonResponse(false, "Product not found", null, 404);
    }

    $row = $checkStmt->fetch(PDO::FETCH_ASSOC);
    if ((int)$row['sellerId'] !== $sellerId) {
        jsonResponse(false, "Unauthorized to update this product", null, 403);
    }

    $stmt = $db->prepare("UPDATE products SET status = 'sold' WHERE id = :id");
    $stmt->execute([':id' => $productId]);

    // Update totalSold for the seller
    $db->prepare("UPDATE users SET totalSold = totalSold + 1 WHERE id = :id")
       ->execute([':id' => $sellerId]);

    jsonResponse(true, "Product marked as sold.");

} catch(PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
