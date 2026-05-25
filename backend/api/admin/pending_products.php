<?php
// backend/api/admin/pending_products.php
// Returns products that are pending admin approval (status = 'pending')
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

// Admin check - authenticate and check isAdmin flag
$userId = AuthMiddleware::authenticate();

$database = new Database();
$db = $database->getConnection();

// Verify the user is an admin
$adminCheck = $db->prepare("SELECT isAdmin FROM users WHERE id = :id");
$adminCheck->execute([':id' => $userId]);
$admin = $adminCheck->fetch(PDO::FETCH_ASSOC);

if (!$admin || !$admin['isAdmin']) {
    jsonResponse(false, "Access denied. Admin privileges required.", null, 403);
}

try {
    $query = "SELECT p.*, u.name as seller_name, u.email as seller_email, u.phone as seller_phone,
              (SELECT image_url FROM product_images WHERE product_id = p.id AND is_cover = 1 LIMIT 1) as cover_image
              FROM products p
              LEFT JOIN users u ON p.sellerId = u.id
              WHERE p.status = 'pending'
              ORDER BY p.postedAt DESC";

    $stmt = $db->prepare($query);
    $stmt->execute();

    $products = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $products[] = [
            'id'           => (int)$row['id'],
            'title'        => $row['title'],
            'price'        => (float)$row['price'],
            'category'     => $row['category'],
            'brand'        => $row['brand'],
            'condition'    => $row['condition'],
            'location'     => $row['location'],
            'postedAt'     => $row['postedAt'],
            'cover_image'  => $row['cover_image'],
            'seller_name'  => $row['seller_name'],
            'seller_email' => $row['seller_email'],
            'seller_phone' => $row['seller_phone'],
            'sellerId'     => (int)$row['sellerId'],
        ];
    }

    jsonResponse(true, "Pending products retrieved", $products);

} catch(PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
