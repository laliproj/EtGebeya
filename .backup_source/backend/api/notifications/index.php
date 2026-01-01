<?php
// backend/api/notifications/index.php
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
    $query = "SELECT id, type, title, message, is_read as 'read', icon, created_at as createdAt
              FROM notifications 
              WHERE user_id = :user_id 
              ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute([':user_id' => $userId]);

    $notifications = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $row['id'] = (int)$row['id'];
        $row['read'] = (bool)$row['read'];
        $notifications[] = $row;
    }

    jsonResponse(true, "Notifications retrieved", $notifications);

} catch(PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
