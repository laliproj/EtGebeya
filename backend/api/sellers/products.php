<?php
// backend/api/sellers/products.php
// Public: ?id=X  -> only returns active/sold products
// Private: ?id=X&own=1 (requires auth) -> returns all statuses for the seller's own dashboard
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

if (!isset($_GET['id'])) {
    jsonResponse(false, "Seller ID is required", null, 400);
}

$sellerId = (int)$_GET['id'];
$isOwn = isset($_GET['own']) && $_GET['own'] == '1';

// If requesting own dashboard view, require authentication and verify ownership
if ($isOwn) {
    $authUserId = AuthMiddleware::authenticate();
    if ($authUserId !== $sellerId) {
        jsonResponse(false, "Unauthorized.", null, 403);
    }
}

$database = new Database();
$db = $database->getConnection();

try {
    // For public profile: only show active products
    // For owner dashboard: show all statuses
    $statusFilter = $isOwn ? "" : "AND p.status = 'active'";

    $query = "SELECT p.*, u.name as seller_name, u.avatar as seller_avatar, u.trustScore as seller_rating,
              (SELECT GROUP_CONCAT(image_url) FROM product_images WHERE product_id = p.id) as images
              FROM products p
              JOIN users u ON p.sellerId = u.id
              WHERE p.sellerId = :id $statusFilter
              ORDER BY p.postedAt DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute([':id' => $sellerId]);

    $products = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $products[] = [
            'id'          => (int)$row['id'],
            'title'       => $row['title'],
            'description' => $row['description'],
            'price'       => (float)$row['price'],
            'category'    => $row['category'],
            'brand'       => $row['brand'],
            'model'       => $row['model'] ?? '',
            'condition'   => $row['condition'],
            'location'    => $row['location'],
            'images'      => $row['images'] ? explode(',', $row['images']) : [],
            'sellerId'    => (int)$row['sellerId'],
            'sellerName'  => $row['seller_name'],
            'sellerRating'=> (float)$row['seller_rating'],
            'postedAt'    => date('c', strtotime($row['postedAt'])),
            'isFeatured'  => (bool)$row['isFeatured'],
            'status'      => $row['status'] ?? 'active',
            'views'       => (int)$row['views'],
        ];
    }

    jsonResponse(true, "Seller products retrieved", $products);

} catch(PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
