<?php
// backend/api/ai/negotiation.php — Smart Price Negotiation AI
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$userId = AuthMiddleware::authenticate();

$data       = json_decode(file_get_contents("php://input"), true);
$productId  = (int)($data['productId'] ?? 0);
$offerPrice = (float)($data['offerPrice'] ?? 0);

if (!$productId || $offerPrice <= 0) {
    jsonResponse(false, "Missing required fields", null, 400);
}

$database = new Database();
$db = $database->getConnection();

// Fetch product details
$stmt = $db->prepare("SELECT p.id, p.title, p.price, p.category, p.brand, p.condition, p.sellerId,
    a.market_low, a.market_high, a.market_avg
    FROM products p
    LEFT JOIN ai_product_analysis a ON a.product_id = p.id
    WHERE p.id = :id AND p.status = 'active'");
$stmt->execute([':id' => $productId]);
$product = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$product) {
    jsonResponse(false, "Product not found", null, 404);
}
if ((int)$product['sellerId'] === $userId) {
    jsonResponse(false, "You cannot negotiate on your own listing", null, 403);
}

$listingPrice = (float)$product['price'];
$marketAvg    = $product['market_avg'] ? (float)$product['market_avg'] : $listingPrice;
$offerRatio   = $offerPrice / $listingPrice;  // ratio of offer vs listed price

// ─── Negotiation Logic ────────────────────────────────────────────────────────
$verdict  = '';
$message  = '';
$counter  = null;
$accepted = false;
$rejected = false;
$notifySellerMsg = null;

if ($offerRatio < 0.50) {
    // Below 50% of listing price — automatic reject (lowball protection)
    $verdict  = 'rejected';
    $rejected = true;
    $message  = "❌ **Offer Rejected** — Your offer of **" . number_format($offerPrice) . " ETB** is too far below the asking price of **" . number_format($listingPrice) . " ETB** (" . round((1 - $offerRatio) * 100) . "% below).\n\nThis offer is unreasonably low and has been automatically declined to protect the seller. Try offering at least **" . number_format($listingPrice * 0.70) . " ETB**.";

} elseif ($offerRatio < 0.80) {
    // 50–80% of listing — counter with a middle-ground
    $verdict  = 'counter';
    $counter  = round($listingPrice * 0.88); // Counter at 88% of listing
    $message  = "🤝 **AI Counter-Offer** — Your offer of **" . number_format($offerPrice) . " ETB** is a good start, but the seller is unlikely to accept such a discount.\n\nOur AI suggests a counter-offer of **" . number_format($counter) . " ETB** — this saves you **" . number_format($listingPrice - $counter) . " ETB** while keeping the deal fair for the seller.\n\nClick **\"Send Counter-Offer\"** to forward this to the seller!";
    $notifySellerMsg = "A buyer has made an offer of " . number_format($offerPrice) . " ETB (AI counter-suggested: " . number_format($counter) . " ETB) on your listing: " . $product['title'];

} elseif ($offerRatio < 0.95) {
    // 80–95% of listing — pre-approve, notify seller
    $verdict  = 'pre_approved';
    $counter  = $offerPrice;
    $message  = "✅ **Great Offer! Forwarding to Seller...**\n\nYour offer of **" . number_format($offerPrice) . " ETB** is a reasonable " . round((1 - $offerRatio) * 100) . "% below the listed price.\n\nThis is within a fair negotiation range — our AI has **pre-approved** this offer and will notify the seller immediately.\n\n💬 *The seller will respond via the messaging system.*";
