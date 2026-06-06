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
