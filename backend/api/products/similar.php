<?php
// backend/api/products/similar.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

if (!isset($_GET['id'])) {
    jsonResponse(false, "Product ID is required", null, 400);
}

$productId = (int)$_GET['id'];

$database = new Database();
$db = $database->getConnection();

try {
    // Get category of the current product
    $catStmt = $db->prepare("SELECT category FROM products WHERE id = :id");
    $catStmt->execute([':id' => $productId]);
    
    if ($catStmt->rowCount() === 0) {
        jsonResponse(true, "No similar products", []);
    }
    
    $category = $catStmt->fetchColumn();

    // Get products in same category excluding the current one
    $query = "SELECT p.*, u.name as seller_name, u.avatar as seller_avatar, u.trustScore as seller_rating,
              (SELECT GROUP_CONCAT(image_url) FROM product_images WHERE product_id = p.id) as images
              FROM products p
              LEFT JOIN users u ON p.sellerId = u.id
              WHERE p.category = :category AND p.id != :id
              ORDER BY p.views DESC, p.postedAt DESC LIMIT 4";
    
    $stmt = $db->prepare($query);
    $stmt->execute([':category' => $category, ':id' => $productId]);

    $products = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $products[] = [
            'id' => (int)$row['id'],
            'title' => $row['title'],
            'price' => (float)$row['price'],
            'category' => $row['category'],
            'brand' => $row['brand'],
            'condition' => $row['condition'],
            'images' => $row['images'] ? explode(',', $row['images']) : [],
            'sellerId' => (int)$row['sellerId'],
            'sellerName' => $row['seller_name'],
            'sellerRating' => (float)$row['seller_rating'],
            'location' => $row['location'],
            'postedAt' => date('c', strtotime($row['postedAt'])),
            'isFeatured' => (bool)$row['isFeatured']
        ];
    }

    jsonResponse(true, "Similar products retrieved", $products);

} catch(PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
