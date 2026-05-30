<?php
// backend/api/admin/stats.php
// Returns overall site stats for the admin dashboard
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
    $stats = [];

    $stats['total_users']     = (int)$db->query("SELECT COUNT(*) FROM users WHERE isAdmin = 0")->fetchColumn();
    $stats['total_products']  = (int)$db->query("SELECT COUNT(*) FROM products")->fetchColumn();
    $stats['pending_products']= (int)$db->query("SELECT COUNT(*) FROM products WHERE status = 'pending'")->fetchColumn();
    $stats['open_reports']    = (int)$db->query("SELECT COUNT(*) FROM reports WHERE status = 'pending'")->fetchColumn();
    $stats['banned_users']    = (int)$db->query("SELECT COUNT(*) FROM users WHERE isBanned = 1")->fetchColumn();

    jsonResponse(true, "Stats retrieved", $stats);

} catch(PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
