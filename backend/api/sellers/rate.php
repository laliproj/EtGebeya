<?php
// backend/api/sellers/rate.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validator.php';
require_once __DIR__ . '/../../middleware/auth.php';

$userId = AuthMiddleware::authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, "Method not allowed", null, 405);
}

$data = json_decode(file_get_contents("php://input"), true);

$missing = Validator::checkRequired($data, ['sellerId', 'rating']);
if (!empty($missing)) {
    jsonResponse(false, "Missing required fields: " . implode(', ', $missing), null, 400);
}

$sellerId = (int)$data['sellerId'];
$rating = (int)$data['rating'];
$comment = isset($data['comment']) ? Validator::sanitize($data['comment']) : null;

if ($rating < 1 || $rating > 5) {
    jsonResponse(false, "Rating must be between 1 and 5", null, 400);
}

if ($sellerId === $userId) {
    jsonResponse(false, "You cannot rate yourself", null, 400);
}

$database = new Database();
$db = $database->getConnection();

try {
    $db->beginTransaction();

    // Insert rating
    $query = "INSERT INTO seller_ratings (seller_id, buyer_id, rating, comment) VALUES (:seller, :buyer, :rating, :comment)";
    $stmt = $db->prepare($query);
    $stmt->execute([
        ':seller' => $sellerId,
        ':buyer' => $userId,
        ':rating' => $rating,
        ':comment' => $comment
    ]);

