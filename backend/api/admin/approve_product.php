<?php
// backend/api/admin/approve_product.php
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

$data = json_decode(file_get_contents("php://input"), true);
$productId = (int)($data['productId'] ?? 0);
$action    = $data['action'] ?? ''; // 'approve' or 'reject'

if (!$productId || !in_array($action, ['approve', 'reject'])) {
    jsonResponse(false, "Invalid request.", null, 400);
}

try {
    $newStatus = $action === 'approve' ? 'active' : 'rejected';
    $stmt = $db->prepare("UPDATE products SET status = :status WHERE id = :id");
    $stmt->execute([':status' => $newStatus, ':id' => $productId]);

    // Notify seller
    $sellerQ = $db->prepare("SELECT sellerId, title FROM products WHERE id = :id");
    $sellerQ->execute([':id' => $productId]);
    $product = $sellerQ->fetch(PDO::FETCH_ASSOC);

    if ($product) {
        $msg   = $action === 'approve'
            ? "እርስዎ ያስቀመጡት \"{$product['title']}\" ተቀብሎ ታትሟል። (Your listing has been approved)"
            : "እርስዎ ያስቀመጡት \"{$product['title']}\" አልፈቀድንም። (Your listing was rejected)";
        $title = $action === 'approve' ? 'ማስታወቂያ ተቀበሎ' : 'ማስታወቂያ ተቀባይነት አላገኘም';
        $icon  = $action === 'approve' ? '✅' : '❌';

        $notif = $db->prepare("INSERT INTO notifications (user_id, type, title, message, icon) VALUES (:uid, 'product_status', :title, :msg, :icon)");
        $notif->execute([
            ':uid'   => $product['sellerId'],
            ':title' => $title,
            ':msg'   => $msg,
            ':icon'  => $icon,
        ]);
    }

    jsonResponse(true, "Product " . $newStatus . " successfully.");

} catch(PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
