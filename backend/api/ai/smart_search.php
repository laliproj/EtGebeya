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
