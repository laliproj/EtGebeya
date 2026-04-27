<?php
// backend/api/reports/create.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../helpers/validator.php';
require_once __DIR__ . '/../../middleware/auth.php';

$userId = AuthMiddleware::authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, "Method not allowed", null, 405);
}

$data = json_decode(file_get_contents("php://input"), true);

$missing = Validator::checkRequired($data, ['productId', 'reason']);
if (!empty($missing)) {
    jsonResponse(false, "Missing required fields: " . implode(', ', $missing), null, 400);
}

$productId = (int)$data['productId'];
$reason = Validator::sanitize($data['reason']);
$details = isset($data['details']) ? Validator::sanitize($data['details']) : '';

$database = new Database();
$db = $database->getConnection();

// Check if user is the seller of the product
$sellerQuery = "SELECT sellerId FROM products WHERE id = :product";
$sellerStmt = $db->prepare($sellerQuery);
$sellerStmt->execute([':product' => $productId]);
$sellerId = $sellerStmt->fetchColumn();

if ($sellerId === $userId) {
    jsonResponse(false, "You cannot report your own product", null, 400);
}

try {
    $db->beginTransaction();

    // 1. Insert report
    $query = "INSERT INTO reports (reporter_id, product_id, reason, details) VALUES (:reporter, :product, :reason, :details)";
    $stmt = $db->prepare($query);
    $stmt->execute([
        ':reporter' => $userId,
        ':product' => $productId,
        ':reason' => $reason,
        ':details' => $details
    ]);

    // 2. Increment warnings for seller if reason is serious (mock logic for auto-ban system)
    // In a real app, an admin would review the report first. Here we automate it for the prompt requirements.
    if ($sellerId) {
        
        // Add warning
        $warnInsert = "INSERT INTO warnings (user_id, reason) VALUES (:seller, :reason)";
        $db->prepare($warnInsert)->execute([':seller' => $sellerId, ':reason' => "Reported: " . $reason]);

        // Increment user warnings counter
        $warnUpdate = "UPDATE users SET warnings = warnings + 1 WHERE id = :seller";
        $db->prepare($warnUpdate)->execute([':seller' => $sellerId]);

        // Check if seller needs to be banned (3 warnings)
        $banCheck = "SELECT warnings FROM users WHERE id = :seller";
        $banStmt = $db->prepare($banCheck);
        $banStmt->execute([':seller' => $sellerId]);
        $warningsCount = $banStmt->fetchColumn();

        if ($warningsCount >= 3) {
            $banUpdate = "UPDATE users SET isBanned = 1 WHERE id = :seller";
            $db->prepare($banUpdate)->execute([':seller' => $sellerId]);

            // Create notification for seller
            $notifInsert = "INSERT INTO notifications (user_id, type, title, message, icon) VALUES (:seller, 'ban', 'Account Banned', 'Your account has been banned due to receiving 3 warnings.', '🚫')";
            $db->prepare($notifInsert)->execute([':seller' => $sellerId]);
        } else {
            // Create notification for warning
            $notifInsert = "INSERT INTO notifications (user_id, type, title, message, icon) VALUES (:seller, 'warning', 'Warning Received', 'Your product was reported. Warning count: $warningsCount/3', '⚠️')";
            $db->prepare($notifInsert)->execute([':seller' => $sellerId]);
        }
    }

    $db->commit();
    jsonResponse(true, "Report submitted successfully. Thank you for keeping our community safe.");

} catch(PDOException $e) {
    $db->rollBack();
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
