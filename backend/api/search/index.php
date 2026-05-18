<?php
// backend/api/search/index.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validator.php';
require_once __DIR__ . '/../../middleware/auth.php';

$database = new Database();
$db = $database->getConnection();

if (!isset($_GET['q']) || empty(trim($_GET['q']))) {
    jsonResponse(true, "No query provided", []);
}

$queryParam = Validator::sanitize($_GET['q']);
$searchQuery = "%{$queryParam}%";

try {
    // Optionally log the search if user is logged in (auth is optional here, so we won't throw error if no token)
    $headers = apache_request_headers();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    if (empty($authHeader)) {
        $authHeader = isset($headers['authorization']) ? $headers['authorization'] : '';
    }

    if ($authHeader) {
        try {
            $userId = AuthMiddleware::authenticate();
            // Record search
            $recordStmt = $db->prepare("INSERT INTO searches (user_id, query) VALUES (:user_id, :query)");
            $recordStmt->execute([':user_id' => $userId, ':query' => $queryParam]);
        } catch (Exception $e) {
            // Ignore if invalid token, just don't record search
        }
    }

    $query = "SELECT p.*, u.name as seller_name, u.avatar as seller_avatar, u.trustScore as seller_rating,
              (SELECT GROUP_CONCAT(image_url) FROM product_images WHERE product_id = p.id) as images
              FROM products p
              LEFT JOIN users u ON p.sellerId = u.id
              WHERE p.title LIKE :q OR p.description LIKE :q OR p.brand LIKE :q OR p.category LIKE :q
              ORDER BY p.views DESC LIMIT 20";
    
    $stmt = $db->prepare($query);
    $stmt->execute([':q' => $searchQuery]);

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

    jsonResponse(true, "Search results", $products);

} catch(PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
