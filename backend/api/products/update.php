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
    if ((int)$row['sellerId'] !== $sellerId) {
        jsonResponse(false, "Unauthorized to update this product", null, 403);
    }

    // Build update query
    $allowed_fields = ['title', 'description', 'price', 'category', 'brand', 'model', 'condition', 'location'];
    $updates = [];
    $params = [':id' => $productId];
    
    foreach ($allowed_fields as $field) {
        if (isset($data[$field])) {
            $updates[] = "`{$field}` = :{$field}";
            if ($field === 'price') {
                $params[":{$field}"] = (float)$data[$field];
            } else {
                $params[":{$field}"] = Validator::sanitize($data[$field]);
            }
        }
    }
    
    if (empty($updates)) {
        jsonResponse(false, "No valid fields provided for update", null, 400);
    }
    
    $query = "UPDATE products SET " . implode(', ', $updates) . " WHERE id = :id";
    $stmt = $db->prepare($query);
    
    if ($stmt->execute($params)) {
        jsonResponse(true, "Product updated successfully");
    } else {
        jsonResponse(false, "Failed to update product", null, 500);
    }

} catch(PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
