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
