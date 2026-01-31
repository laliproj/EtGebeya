<?php
// backend/api/products/index.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validator.php';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT p.*, u.name as seller_name, u.avatar as seller_avatar, u.trustScore as seller_rating,
              (SELECT GROUP_CONCAT(image_url) FROM product_images WHERE product_id = p.id) as images
              FROM products p
              LEFT JOIN users u ON p.sellerId = u.id
              WHERE p.status = 'active'";
    
    $params = [];

    // Filters
    if (isset($_GET['category'])) {
        $query .= " AND p.category = :category";
        $params[':category'] = Validator::sanitize($_GET['category']);
    }
    if (isset($_GET['brand'])) {
        $query .= " AND p.brand = :brand";
        $params[':brand'] = Validator::sanitize($_GET['brand']);
    }
    if (isset($_GET['condition'])) {
        $query .= " AND p.`condition` = :condition";
        $params[':condition'] = Validator::sanitize($_GET['condition']);
    }
    if (isset($_GET['priceMin'])) {
        $query .= " AND p.price >= :priceMin";
        $params[':priceMin'] = (float)$_GET['priceMin'];
    }
    if (isset($_GET['priceMax'])) {
        $query .= " AND p.price <= :priceMax";
        $params[':priceMax'] = (float)$_GET['priceMax'];
    }

    $query .= " ORDER BY p.postedAt DESC";

    $stmt = $db->prepare($query);
    $stmt->execute($params);

    $products = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Format product data to match frontend expectations
        $product = [
            'id' => (int)$row['id'],
            'title' => $row['title'],
            'description' => $row['description'],
            'price' => (float)$row['price'],
            'category' => $row['category'],
            'brand' => $row['brand'],
            'model' => $row['model'],
            'condition' => $row['condition'],
            'images' => $row['images'] ? explode(',', $row['images']) : [],
            'sellerId' => (int)$row['sellerId'],
            'sellerName' => $row['seller_name'],
            'sellerRating' => (float)$row['seller_rating'],
            'location' => $row['location'],
            'postedAt' => date('c', strtotime($row['postedAt'])),
            'views' => (int)$row['views'],
            'isFeatured' => (bool)$row['isFeatured']
        ];
        $products[] = $product;
    }

    jsonResponse(true, "Products retrieved", $products);

} catch(PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
