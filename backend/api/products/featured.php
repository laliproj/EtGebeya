<?php
// backend/api/products/featured.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT p.*, u.name as seller_name, u.avatar as seller_avatar, u.trustScore as seller_rating,
              (SELECT GROUP_CONCAT(image_url) FROM product_images WHERE product_id = p.id) as images
              FROM products p
              LEFT JOIN users u ON p.sellerId = u.id
              WHERE p.isFeatured = 1 AND p.status = 'active'
              ORDER BY p.postedAt DESC LIMIT 8";
    
    $stmt = $db->prepare($query);
    $stmt->execute();

    $products = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
