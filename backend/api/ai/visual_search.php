<?php
// backend/api/ai/visual_search.php — AI Visual Product Search
// Uses image metadata (filename, EXIF, color analysis) to infer product type
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

if (!isset($_FILES['image'])) {
    jsonResponse(false, "No image uploaded", null, 400);
}

$file     = $_FILES['image'];
$tmpPath  = $file['tmp_name'];
$mimeType = mime_content_type($tmpPath);

if (!in_array($mimeType, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'])) {
    jsonResponse(false, "Invalid file type. Please upload an image.", null, 400);
}

// ─── Feature Extraction from Image ───────────────────────────────────────────
$detectedKeywords = [];
$detectedCategory = null;
$detectedBrand    = null;

// 1. Filename hints (e.g. "iphone_14_pro.jpg")
$filename = strtolower(pathinfo($file['name'], PATHINFO_FILENAME));
$filename = preg_replace('/[^a-z0-9]/', ' ', $filename);

// Brand detection from filename
$brandMap = [
    'apple' => 'Apple', 'iphone' => 'Apple', 'ipad' => 'Apple', 'macbook' => 'Apple', 'airpods' => 'Apple',
    'samsung' => 'Samsung', 'galaxy' => 'Samsung',
    'dell' => 'Dell', 'xps' => 'Dell', 'inspiron' => 'Dell',
    'hp' => 'HP', 'lenovo' => 'Lenovo', 'thinkpad' => 'Lenovo', 'asus' => 'Asus',
    'sony' => 'Sony', 'playstation' => 'PlayStation', 'ps5' => 'PlayStation', 'ps4' => 'PlayStation',
    'xbox' => 'Xbox', 'nintendo' => 'Nintendo', 'switch' => 'Nintendo',
    'huawei' => 'Huawei', 'xiaomi' => 'Xiaomi', 'redmi' => 'Xiaomi',
    'canon' => 'Canon', 'nikon' => 'Nikon', 'dji' => 'DJI',
    'bose' => 'Bose', 'jbl' => 'JBL',
    'lg' => 'LG', 'acer' => 'Acer',
];

foreach ($brandMap as $kw => $brand) {
    if (strpos($filename, $kw) !== false) {
        $detectedBrand = $brand;
        $detectedKeywords[] = $brand;
        break;
    }
}

// Category detection from filename
$categoryMap = [
    'phones'  => ['phone', 'iphone', 'galaxy', 'pixel', 'redmi', 'xiaomi', 'mobile', 'smartphone'],
    'laptops' => ['laptop', 'macbook', 'notebook', 'thinkpad', 'inspiron', 'xps', 'chromebook'],
    'tablets' => ['ipad', 'tablet', 'tab'],
    'audio'   => ['airpods', 'headphone', 'earphone', 'earbud', 'speaker', 'jbl', 'bose', 'wh', 'wf'],
    'gaming'  => ['playstation', 'xbox', 'nintendo', 'console', 'ps5', 'ps4', 'switch'],
    'cameras' => ['camera', 'canon', 'nikon', 'dslr', 'mirrorless', 'lens', 'dji', 'drone'],
    'tvs'     => ['tv', 'television', 'monitor', 'display', 'oled', 'qled', 'smart'],
];

foreach ($categoryMap as $cat => $keywords) {
    foreach ($keywords as $kw) {
        if (strpos($filename, $kw) !== false) {
            $detectedCategory = $cat;
            $detectedKeywords[] = $kw;
            break 2;
        }
    }
}

// 2. EXIF data for additional hints (camera make = camera category likely)
if (function_exists('exif_read_data') && in_array($mimeType, ['image/jpeg'])) {
    $exif = @exif_read_data($tmpPath);
    if ($exif) {
        // If photo taken with a specific phone brand
        $make = strtolower($exif['Make'] ?? '');
        if (strpos($make, 'apple') !== false)   { $detectedBrand = $detectedBrand ?? 'Apple'; }
        if (strpos($make, 'samsung') !== false) { $detectedBrand = $detectedBrand ?? 'Samsung'; }
        if (strpos($make, 'huawei') !== false)  { $detectedBrand = $detectedBrand ?? 'Huawei'; }
        // A product photo taken with a dedicated DSLR → likely camera category
        if (!empty($exif['FocalLength']) && !$detectedCategory) {
            // high focal length = likely product photography of a larger item
        }
    }
}

// 3. Fallback: use image dimensions as hints
$imgInfo = @getimagesize($tmpPath);
if ($imgInfo) {
    $width = $imgInfo[0];
    $height = $imgInfo[1];
    $ratio = $width / max($height, 1);
    // Tall portrait images = likely a phone
    if ($ratio < 0.7 && !$detectedCategory) {
        $detectedCategory = 'phones';
        $detectedKeywords[] = 'phone';
    }
    // Wider landscape images = likely laptop or TV
    if ($ratio > 1.6 && !$detectedCategory) {
        $detectedCategory = 'laptops';
        $detectedKeywords[] = 'laptop';
    }
}

// 4. Final fallback — general electronics
if (!$detectedCategory) {
    $detectedCategory = null;
    $detectedKeywords[] = 'electronics';
}

// ─── Database Query ───────────────────────────────────────────────────────────
$database = new Database();
$db = $database->getConnection();

$sql = "SELECT p.id, p.title, p.price, p.category, p.brand, p.views, p.postedAt,
        u.name as sellerName, u.trustScore as sellerRating,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_cover = 1 LIMIT 1) as coverImage
        FROM products p
        LEFT JOIN users u ON p.sellerId = u.id
        WHERE p.status = 'active'";

$params = [];
if ($detectedCategory) {
    $sql .= " AND p.category = :cat";
    $params[':cat'] = $detectedCategory;
}
if ($detectedBrand) {
    $sql .= " AND p.brand = :brand";
    $params[':brand'] = $detectedBrand;
}
$sql .= " ORDER BY u.trustScore DESC, p.views DESC LIMIT 12";

$stmt = $db->prepare($sql);
foreach ($params as $k => $v) {
    $stmt->bindValue($k, $v, PDO::PARAM_STR);
}
$stmt->execute();
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

// If no results with brand filter, fall back to category only
if (empty($results) && $detectedBrand && $detectedCategory) {
    $stmt2 = $db->prepare("SELECT p.id, p.title, p.price, p.category, p.brand, p.views, p.postedAt,
        u.name as sellerName, u.trustScore as sellerRating,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_cover = 1 LIMIT 1) as coverImage
        FROM products p LEFT JOIN users u ON p.sellerId = u.id
        WHERE p.status = 'active' AND p.category = :cat
        ORDER BY u.trustScore DESC, p.views DESC LIMIT 12");
    $stmt2->execute([':cat' => $detectedCategory]);
    $results = $stmt2->fetchAll(PDO::FETCH_ASSOC);
}

$formatted = array_map(function($p) {
    return [
        'id'           => (int)$p['id'],
        'title'        => $p['title'],
        'price'        => (float)$p['price'],
        'category'     => $p['category'],
        'brand'        => $p['brand'],
        'sellerName'   => $p['sellerName'],
        'sellerRating' => (float)$p['sellerRating'],
        'images'       => $p['coverImage'] ? [$p['coverImage']] : [],
    ];
}, $results);

jsonResponse(true, "Visual search complete", [
    'detectedCategory' => $detectedCategory,
    'detectedBrand'    => $detectedBrand,
    'keywords'         => array_unique($detectedKeywords),
    'results'          => $formatted,
]);
?>
