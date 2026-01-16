<?php
// backend/api/sellers/show.php
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
    $query = "SELECT id, name, avatar, location, joinDate, bio, trustScore, totalSold, totalRatings, isVerified 
              FROM users WHERE id = :id AND isBanned = 0 LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->execute([':id' => $sellerId]);

    if ($stmt->rowCount() === 0) {
        jsonResponse(false, "Seller not found", null, 404);
    }

    $seller = $stmt->fetch(PDO::FETCH_ASSOC);
    $seller['trustScore'] = (float)$seller['trustScore'];
    $seller['totalSold'] = (int)$seller['totalSold'];
    $seller['totalRatings'] = (int)$seller['totalRatings'];
    $seller['isVerified'] = (bool)$seller['isVerified'];

    jsonResponse(true, "Seller retrieved", $seller);

} catch(PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
