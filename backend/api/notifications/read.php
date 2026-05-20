<?php
// backend/api/notifications/read.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$userId = AuthMiddleware::authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    jsonResponse(false, "Method not allowed", null, 405);
}

if (!isset($_GET['id'])) {
    jsonResponse(false, "Notification ID is required", null, 400);
}

$notificationId = (int)$_GET['id'];

$database = new Database();
$db = $database->getConnection();

try {
    $query = "UPDATE notifications SET is_read = 1 WHERE id = :id AND user_id = :user_id";
    $stmt = $db->prepare($query);
    
    if ($stmt->execute([':id' => $notificationId, ':user_id' => $userId])) {
        jsonResponse(true, "Notification marked as read");
    } else {
        jsonResponse(false, "Failed to update notification", null, 500);
    }
} catch(PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
