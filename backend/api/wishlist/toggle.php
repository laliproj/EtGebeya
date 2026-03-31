<?php
// backend/api/wishlist/toggle.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$userId = AuthMiddleware::authenticate();

$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data['productId'])) {
    jsonResponse(false, "Product ID is required", null, 400);
}

$productId = (int)$data['productId'];

$database = new Database();
$db = $database->getConnection();

try {
    // Check if it exists
    $checkQuery = "SELECT id FROM wishlists WHERE user_id = :user_id AND product_id = :product_id";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([':user_id' => $userId, ':product_id' => $productId]);

    if ($checkStmt->rowCount() > 0) {
        // Exists, so remove it
        $deleteQuery = "DELETE FROM wishlists WHERE user_id = :user_id AND product_id = :product_id";
        $deleteStmt = $db->prepare($deleteQuery);
        $deleteStmt->execute([':user_id' => $userId, ':product_id' => $productId]);
        jsonResponse(true, "Removed from wishlist", ['action' => 'removed']);
    } else {
        // Doesn't exist, so add it
        $insertQuery = "INSERT INTO wishlists (user_id, product_id) VALUES (:user_id, :product_id)";
        $insertStmt = $db->prepare($insertQuery);
        $insertStmt->execute([':user_id' => $userId, ':product_id' => $productId]);
        jsonResponse(true, "Added to wishlist", ['action' => 'added']);
    }

} catch(PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
