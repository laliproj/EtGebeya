<?php
// backend/api/ai/smart_search.php
// AI Semantic Search Parser
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$query = trim($_GET['q'] ?? '');
if (empty($query)) {
    jsonResponse(false, "Query is required", null, 400);
}

// Log search analytics
$database = new Database();
$db = $database->getConnection();
try {
    $userId = AuthMiddleware::authenticate();
} catch (Exception $e) {
    $userId = null;
}

// Basic Semantic Parsing Rules (Mock AI NLP)
$queryLower = strtolower($query);
$filters = [
    'category' => null,
    'maxPrice' => null,
    'brand' => null,
    'keywords' => [],
    'intent' => 'search' // e.g. 'cheap', 'best'
];

// 1. Price extraction (e.g. "under 50k", "under 50000", "< 30000")
if (preg_match('/(?:under|less than|<)\s*(\d+)(k|000)?/i', $queryLower, $m)) {
    $val = (int)$m[1];
    if (isset($m[2]) && strtolower($m[2]) === 'k') {
        $val *= 1000;
    }
    $filters['maxPrice'] = $val;
    $queryLower = preg_replace('/(?:under|less than|<)\s*\d+k?/i', '', $queryLower);
}
// 2. Category matching
$categories = ['phones' => ['phone', 'smartphone', 'mobile', 'iphone'], 
               'laptops' => ['laptop', 'macbook', 'pc', 'computer'],
               'tablets' => ['tablet', 'ipad'],
               'audio' => ['headphone', 'earbud', 'speaker', 'airpods'],
               'gaming' => ['console', 'playstation', 'xbox', 'nintendo'],
               'cameras' => ['camera', 'dslr', 'lens']];
foreach ($categories as $cat => $aliases) {
    foreach ($aliases as $alias) {
        if (strpos($queryLower, $alias) !== false) {
            $filters['category'] = $cat;
            $queryLower = str_replace($alias, '', $queryLower);
            break 2;
        }
    }
}
// 3. Brand extraction
$brands = ['apple', 'samsung', 'dell', 'hp', 'lenovo', 'sony', 'lg', 'asus'];
foreach ($brands as $brand) {
    if (strpos($queryLower, $brand) !== false) {
        $filters['brand'] = ucfirst($brand);
        $queryLower = str_replace($brand, '', $queryLower);
        break;
    }
}
// 4. Intent detection
if (strpos($queryLower, 'cheap') !== false || strpos($queryLower, 'affordable') !== false) {
    $filters['intent'] = 'budget';
    $queryLower = str_replace(['cheap', 'affordable'], '', $queryLower);
} elseif (strpos($queryLower, 'best') !== false || strpos($queryLower, 'premium') !== false) {
    $filters['intent'] = 'premium';
    $queryLower = str_replace(['best', 'premium'], '', $queryLower);
}

// 5. Remaining keywords
$words = array_filter(explode(' ', trim($queryLower)));
$filters['keywords'] = array_values($words);

// Execute Search
try {
    $sql = "SELECT p.id, p.title, p.price, p.category, p.brand, p.views, p.postedAt,
            u.name as sellerName, u.trustScore,
            (SELECT image_url FROM product_images WHERE product_id = p.id AND is_cover = 1 LIMIT 1) as coverImage
            FROM products p
            LEFT JOIN users u ON p.sellerId = u.id
            WHERE p.status = 'active'";
    
    $params = [];
    if ($filters['category']) {
        $sql .= " AND p.category = :cat";
        $params[':cat'] = $filters['category'];
    }
    if ($filters['brand']) {
        $sql .= " AND p.brand = :brand";
        $params[':brand'] = $filters['brand'];
    }
    if ($filters['maxPrice']) {
        $sql .= " AND p.price <= :price";
        $params[':price'] = $filters['maxPrice'];
    }
    foreach ($filters['keywords'] as $i => $word) {
        if (strlen($word) > 2) {
            $k = ":kw$i";
            $sql .= " AND (p.title LIKE $k OR p.description LIKE $k)";
            $params[$k] = '%' . $word . '%';
        }
    }
    
    if ($filters['intent'] === 'budget') {
        $sql .= " ORDER BY p.price ASC";
    } elseif ($filters['intent'] === 'premium') {
        $sql .= " ORDER BY p.price DESC";
    } else {
        // Semantic relevance sort mock: views and trust score
        $sql .= " ORDER BY u.trustScore DESC, p.views DESC, p.postedAt DESC";
    }
    $sql .= " LIMIT 20";

    $stmt = $db->prepare($sql);
    foreach ($params as $key => $val) {
        $stmt->bindValue($key, $val, is_int($val) ? PDO::PARAM_INT : PDO::PARAM_STR);
    }
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format
    $formatted = array_map(function($p) {
        return [
            'id' => (int)$p['id'],
            'title' => $p['title'],
            'price' => (float)$p['price'],
            'category' => $p['category'],
            'brand' => $p['brand'],
            'sellerName' => $p['sellerName'],
            'sellerRating' => (float)$p['trustScore'],
            'images' => $p['coverImage'] ? [$p['coverImage']] : []
        ];
    }, $results);

    // Log query asynchronously (if db supports it, else synchronously)
    $logStmt = $db->prepare("INSERT INTO search_analytics (query, user_id, result_count) VALUES (:q, :uid, :cnt)");
    $logStmt->execute([':q' => $query, ':uid' => $userId, ':cnt' => count($results)]);

    jsonResponse(true, "Search completed", [
        'parsed_intent' => $filters,
        'results' => $formatted
    ]);

} catch (PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
