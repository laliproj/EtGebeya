<?php
// backend/api/products/show.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validator.php';

if (!isset($_GET['id'])) {
    jsonResponse(false, "Product ID is required", null, 400);
}

$productId = (int)$_GET['id'];

$database = new Database();
$db = $database->getConnection();

try {
    // Get basic product info
    $query = "SELECT p.*, u.name as seller_name, u.avatar as seller_avatar, u.trustScore as seller_rating,
              (SELECT GROUP_CONCAT(image_url) FROM product_images WHERE product_id = p.id) as images
              FROM products p
              LEFT JOIN users u ON p.sellerId = u.id
              WHERE p.id = :id LIMIT 1";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $productId);
    $stmt->execute();

    if ($stmt->rowCount() === 0) {
        jsonResponse(false, "Product not found", null, 404);
    }

    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    // Get Specs
    $specsQuery = "SELECT spec_key, spec_value FROM product_specs WHERE product_id = :id";
    $specsStmt = $db->prepare($specsQuery);
    $specsStmt->bindParam(':id', $productId);
    $specsStmt->execute();
    $specs = [];
    while ($specRow = $specsStmt->fetch(PDO::FETCH_ASSOC)) {
        $specs[$specRow['spec_key']] = $specRow['spec_value'];
    }

    // Get Features
    $featuresQuery = "SELECT feature FROM product_features WHERE product_id = :id";
    $featuresStmt = $db->prepare($featuresQuery);
    $featuresStmt->bindParam(':id', $productId);
    $featuresStmt->execute();
    $features = [];
    while ($featRow = $featuresStmt->fetch(PDO::FETCH_ASSOC)) {
        $features[] = $featRow['feature'];
    }

    // Increment views
    $updateViews = "UPDATE products SET views = views + 1 WHERE id = :id";
    $db->prepare($updateViews)->execute([':id' => $productId]);

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
        'specs' => $specs,
        'features' => $features,
        'sellerId' => (int)$row['sellerId'],
        'sellerName' => $row['seller_name'],
        'sellerRating' => (float)$row['seller_rating'],
        'location' => $row['location'],
        'postedAt' => $row['postedAt'] ? date('c', strtotime($row['postedAt'])) : date('c'),
        'views' => (int)$row['views'] + 1,
        'isFeatured' => (bool)$row['isFeatured'],
        'status' => $row['status'] ?? 'active',
    ];

    jsonResponse(true, "Product retrieved", $product);

} catch(PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
