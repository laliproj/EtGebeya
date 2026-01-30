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
