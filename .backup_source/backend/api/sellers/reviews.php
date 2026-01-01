<?php
// backend/api/sellers/reviews.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

if (!isset($_GET['id'])) {
    jsonResponse(false, "Seller ID is required", null, 400);
}

$sellerId = (int)$_GET['id'];

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT r.id, r.rating, r.comment, r.created_at as date, u.name as author
              FROM seller_ratings r
              JOIN users u ON r.buyer_id = u.id
              WHERE r.seller_id = :id
              ORDER BY r.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute([':id' => $sellerId]);

    $reviews = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $reviews[] = [
            'id' => (int)$row['id'],
            'rating' => (int)$row['rating'],
            'comment' => $row['comment'],
            'author' => $row['author'],
            'date' => date('Y-m-d', strtotime($row['date']))
        ];
    }

    jsonResponse(true, "Seller reviews retrieved", $reviews);

} catch(PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
