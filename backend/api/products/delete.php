<?php
// backend/api/products/delete.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Authenticate and get seller ID
$sellerId = AuthMiddleware::authenticate();

if (!in_array($_SERVER['REQUEST_METHOD'], ['DELETE', 'POST'])) {
    jsonResponse(false, "Method not allowed", null, 405);
}

// Support product ID via query string (DELETE) or JSON body (POST)
if (isset($_GET['id'])) {
    $productId = (int)$_GET['id'];
} else {
    $body = json_decode(file_get_contents("php://input"), true);
    $productId = (int)($body['productId'] ?? 0);
}

if (!$productId) {
    jsonResponse(false, "Product ID is required", null, 400);
}

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
    if ((int)$row['sellerId'] !== $sellerId) {
        jsonResponse(false, "Unauthorized to delete this product", null, 403);
    }

    // Delete product (Cascade will delete images, specs, features, wishlist entries)
    $stmt = $db->prepare("DELETE FROM products WHERE id = :id");
    
    if ($stmt->execute([':id' => $productId])) {
        jsonResponse(true, "Product deleted successfully");
    } else {
        jsonResponse(false, "Failed to delete product", null, 500);
    }

} catch(PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
