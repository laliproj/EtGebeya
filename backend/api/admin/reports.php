<?php
// backend/api/admin/reports.php
// Returns all user-submitted reports for admin review
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

$adminCheck = $db->prepare("SELECT isAdmin FROM users WHERE id = :id");
$adminCheck->execute([':id' => $userId]);
$admin = $adminCheck->fetch(PDO::FETCH_ASSOC);
if (!$admin || !$admin['isAdmin']) {
    jsonResponse(false, "Access denied.", null, 403);
}

try {
    $query = "SELECT r.id, r.reason, r.details, r.status, r.created_at,
              p.id as product_id, p.title as product_title, p.sellerId,
              u.name as reporter_name, u.email as reporter_email,
              s.name as seller_name, s.email as seller_email
              FROM reports r
              JOIN products p ON r.product_id = p.id
              JOIN users u ON r.reporter_id = u.id
