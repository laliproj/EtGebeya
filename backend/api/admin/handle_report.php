<?php
// backend/api/admin/handle_report.php
// Allows admin to resolve, dismiss, or ban a user from a report
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

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

$data   = json_decode(file_get_contents("php://input"), true);
$reportId = (int)($data['reportId'] ?? 0);
$action   = $data['action'] ?? ''; // 'dismiss', 'remove_product', 'ban_seller', 'warn_seller'

if (!$reportId || !in_array($action, ['dismiss', 'remove_product', 'ban_seller', 'warn_seller'])) {
    jsonResponse(false, "Invalid request.", null, 400);
}

try {
    $db->beginTransaction();

    // Get report info
    $rQ = $db->prepare("SELECT r.*, p.sellerId, p.title as product_title FROM reports r JOIN products p ON r.product_id = p.id WHERE r.id = :id");
    $rQ->execute([':id' => $reportId]);
