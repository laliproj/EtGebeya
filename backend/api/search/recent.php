<?php
// backend/api/search/recent.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$userId = AuthMiddleware::authenticate();

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT DISTINCT query FROM searches WHERE user_id = :user_id ORDER BY created_at DESC LIMIT 5";
    $stmt = $db->prepare($query);
    $stmt->execute([':user_id' => $userId]);

    $searches = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $searches[] = $row['query'];
    }

    jsonResponse(true, "Recent searches retrieved", $searches);

} catch(PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
