<?php
// backend/api/messages/history.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$userId = AuthMiddleware::authenticate();
$contactId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

if (!$contactId) {
    jsonResponse(false, "Contact ID required.", null, 400);
}

$database = new Database();
$db = $database->getConnection();

try {
    // Mark as read
    $updateStmt = $db->prepare("UPDATE messages SET is_read = 1 WHERE receiver_id = :uid AND sender_id = :cid");
    $updateStmt->execute([':uid' => $userId, ':cid' => $contactId]);

    // Get chat history
    $query = "SELECT m.*, p.title as product_title FROM messages m 
              LEFT JOIN products p ON m.product_id = p.id
              WHERE (m.sender_id = :uid AND m.receiver_id = :cid) 
                 OR (m.sender_id = :cid AND m.receiver_id = :uid)
              ORDER BY m.created_at ASC";
    
    $stmt = $db->prepare($query);
