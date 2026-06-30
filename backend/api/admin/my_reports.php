<?php
// backend/api/admin/my_reports.php
// Returns reports submitted by the authenticated user (for the user reports page)
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
    $query = "SELECT r.id, r.reason, r.details, r.status, r.created_at,
              p.id as product_id, p.title as product_title,
              u.name as seller_name
              FROM reports r
              JOIN products p ON r.product_id = p.id
              JOIN users u ON p.sellerId = u.id
              WHERE r.reporter_id = :uid
              ORDER BY r.created_at DESC";

    $stmt = $db->prepare($query);
    $stmt->execute([':uid' => $userId]);

    $reports = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $reports[] = [
            'id'            => (int)$row['id'],
            'reason'        => $row['reason'],
            'details'       => $row['details'],
            'status'        => $row['status'],
            'created_at'    => $row['created_at'],
            'product_id'    => (int)$row['product_id'],
            'product_title' => $row['product_title'],
            'seller_name'   => $row['seller_name'],
        ];
    }

    jsonResponse(true, "Your reports retrieved", $reports);

} catch(PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
