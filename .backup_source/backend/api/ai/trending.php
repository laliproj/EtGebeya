<?php
// backend/api/ai/trending.php
// Returns trending products, brands, and categories based on search and view analytics
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

$database = new Database();
$db = $database->getConnection();

try {
    // 1. Trending Searches (last 7 days)
    $searchStmt = $db->prepare("SELECT query, COUNT(*) as count 
                                FROM search_analytics 
                                WHERE searched_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
                                GROUP BY query 
                                ORDER BY count DESC LIMIT 5");
    $searchStmt->execute();
    $trendingSearches = $searchStmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Trending Products (most viewed recently)
    // In a real app we'd use behavior logs. Here we mock it by recent high views.
    $productStmt = $db->prepare("
        SELECT p.id, p.title, p.price, p.category, p.brand, p.views, u.name as sellerName, u.trustScore as sellerRating,
            (SELECT image_url FROM product_images WHERE product_id = p.id AND is_cover = 1 LIMIT 1) as coverImage
        FROM products p
        LEFT JOIN users u ON p.sellerId = u.id
        WHERE p.status = 'active'
        ORDER BY p.views DESC, p.postedAt DESC LIMIT 6");
    $productStmt->execute();
    $trendingProductsRaw = $productStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $trendingProducts = array_map(function($p) {
        return [
            'id' => (int)$p['id'],
            'title' => $p['title'],
            'price' => (float)$p['price'],
            'category' => $p['category'],
            'brand' => $p['brand'],
            'views' => (int)$p['views'],
            'sellerName' => $p['sellerName'],
            'sellerRating' => (float)$p['sellerRating'],
            'images' => $p['coverImage'] ? [$p['coverImage']] : []
        ];
    }, $trendingProductsRaw);

    jsonResponse(true, "Trending data retrieved", [
        'searches' => array_column($trendingSearches, 'query'),
        'products' => $trendingProducts
    ]);

} catch (PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
