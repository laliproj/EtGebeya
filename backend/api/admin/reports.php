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
              JOIN users s ON p.sellerId = s.id
              ORDER BY r.created_at DESC";

    $stmt = $db->prepare($query);
    $stmt->execute();

    $reports = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $reports[] = [
            'id'             => (int)$row['id'],
            'reason'         => $row['reason'],
            'details'        => $row['details'],
            'status'         => $row['status'],
            'created_at'     => $row['created_at'],
            'product_id'     => (int)$row['product_id'],
            'product_title'  => $row['product_title'],
            'seller_id'      => (int)$row['sellerId'],
            'reporter_name'  => $row['reporter_name'],
            'reporter_email' => $row['reporter_email'],
            'seller_name'    => $row['seller_name'],
            'seller_email'   => $row['seller_email'],
        ];
    }

    jsonResponse(true, "Reports retrieved", $reports);

} catch(PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
