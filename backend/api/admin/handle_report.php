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
    $report = $rQ->fetch(PDO::FETCH_ASSOC);
    if (!$report) jsonResponse(false, "Report not found", null, 404);

    $sellerId = (int)$report['sellerId'];

    if ($action === 'dismiss') {
        $db->prepare("UPDATE reports SET status = 'dismissed' WHERE id = :id")->execute([':id' => $reportId]);

    } elseif ($action === 'remove_product') {
        $db->prepare("DELETE FROM products WHERE id = :id")->execute([':id' => $report['product_id']]);
        $db->prepare("UPDATE reports SET status = 'resolved' WHERE id = :id")->execute([':id' => $reportId]);

        // Notify seller
        $db->prepare("INSERT INTO notifications (user_id, type, title, message, icon) VALUES (:uid, 'product_removed', 'ማስታወቂያ ተወግዷል', :msg, '❌')")
           ->execute([':uid' => $sellerId, ':msg' => "ማስታወቂያዎ \"{$report['product_title']}\" ጥሰት ምክንያት ተወግዷል። (Your listing was removed due to a policy violation.)"]);

    } elseif ($action === 'warn_seller') {
        $db->prepare("UPDATE users SET warnings = warnings + 1 WHERE id = :id")->execute([':id' => $sellerId]);
        $db->prepare("INSERT INTO warnings (user_id, reason) VALUES (:uid, :reason)")->execute([':uid' => $sellerId, ':reason' => $report['reason']]);
        $db->prepare("UPDATE reports SET status = 'resolved' WHERE id = :id")->execute([':id' => $reportId]);

        $db->prepare("INSERT INTO notifications (user_id, type, title, message, icon) VALUES (:uid, 'warning', 'ማስጠንቀቂያ ደረሰዎ', 'ሪፖርት ምክንያት ማስጠንቀቂያ ደርሷወ። (You received a warning due to a report.)', '⚠️')")
           ->execute([':uid' => $sellerId]);

    } elseif ($action === 'ban_seller') {
        $db->prepare("UPDATE users SET isBanned = 1 WHERE id = :id")->execute([':id' => $sellerId]);
        $db->prepare("UPDATE reports SET status = 'resolved' WHERE id = :id")->execute([':id' => $reportId]);

        $db->prepare("INSERT INTO notifications (user_id, type, title, message, icon) VALUES (:uid, 'ban', 'አካውንት ታግዷል', 'የሻጭ አካውንት ታግዷል። (Your seller account has been banned due to policy violations.)', '🚫')")
           ->execute([':uid' => $sellerId]);
    }

    $db->commit();
    jsonResponse(true, "Report handled successfully.");

} catch(PDOException $e) {
    $db->rollBack();
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
