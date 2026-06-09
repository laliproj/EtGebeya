<?php
// backend/api/messages/send.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$userId = AuthMiddleware::authenticate();

$data = json_decode(file_get_contents("php://input"), true);
$receiverId = (int)($data['receiverId'] ?? 0);
$productId = isset($data['productId']) ? (int)$data['productId'] : null;
$content = trim($data['content'] ?? '');

if (!$receiverId || empty($content)) {
    jsonResponse(false, "Receiver and content are required.", null, 400);
}

$database = new Database();
$db = $database->getConnection();

try {
    $db->beginTransaction();

    $query = "INSERT INTO messages (sender_id, receiver_id, product_id, content) VALUES (:s, :r, :p, :c)";
    $stmt = $db->prepare($query);
    $stmt->execute([
        ':s' => $userId,
        ':r' => $receiverId,
        ':p' => $productId,
        ':c' => htmlspecialchars($content)
    ]);
    
    // Notify receiver
    $notifQuery = "INSERT INTO notifications (user_id, type, title, message, icon) VALUES (:uid, 'message', 'New Message', 'You received a new message.', '💬')";
    $db->prepare($notifQuery)->execute([':uid' => $receiverId]);

    $db->commit();
    jsonResponse(true, "Message sent successfully");
} catch(PDOException $e) {
    $db->rollBack();
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
