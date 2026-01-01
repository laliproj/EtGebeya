<?php
// backend/api/messages/conversations.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$userId = AuthMiddleware::authenticate();

$database = new Database();
$db = $database->getConnection();

try {
    // Get latest message per conversation
    $query = "
        SELECT 
            u.id as contact_id, 
            u.name as contact_name, 
            u.avatar as contact_avatar,
            m.content as last_message,
            m.created_at as last_message_date,
            m.is_read
        FROM users u
        JOIN messages m ON (u.id = m.sender_id OR u.id = m.receiver_id)
        WHERE (m.sender_id = :uid OR m.receiver_id = :uid) AND u.id != :uid
        AND m.id = (
            SELECT MAX(id) FROM messages m2 
            WHERE (m2.sender_id = :uid AND m2.receiver_id = u.id) 
               OR (m2.receiver_id = :uid AND m2.sender_id = u.id)
        )
        ORDER BY m.created_at DESC
    ";
    
    $stmt = $db->prepare($query);
    $stmt->execute([':uid' => $userId]);

    $conversations = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $row['contact_id'] = (int)$row['contact_id'];
        $row['is_read'] = (bool)$row['is_read'];
        $conversations[] = $row;
    }

    jsonResponse(true, "Conversations retrieved", $conversations);
} catch(PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
