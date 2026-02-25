<?php
// backend/api/ai/seller_insights.php
// Provides AI insights for the Seller Dashboard
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';

$userId = AuthMiddleware::authenticate();

$database = new Database();
$db = $database->getConnection();

try {
    // 1. Get Trust Score details
    $trustStmt = $db->prepare("SELECT score, level FROM seller_trust_scores WHERE seller_id = :uid LIMIT 1");
    $trustStmt->execute([':uid' => $userId]);
    $trust = $trustStmt->fetch(PDO::FETCH_ASSOC) ?: ['score' => 50, 'level' => 'bronze'];

    // 2. Pricing Competitiveness (How many of their active listings are "great_deal" or "fair_price")
    $compStmt = $db->prepare("
        SELECT a.price_verdict, COUNT(*) as count 
        FROM ai_product_analysis a
        JOIN products p ON a.product_id = p.id
        WHERE p.sellerId = :uid AND p.status = 'active'
        GROUP BY a.price_verdict");
    $compStmt->execute([':uid' => $userId]);
    $verdicts = $compStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $competitiveness = [
        'great_deal' => 0,
        'fair_price' => 0,
        'overpriced' => 0,
        'unknown'    => 0
    ];
    $totalActive = 0;
    foreach ($verdicts as $v) {
        $competitiveness[$v['price_verdict']] = (int)$v['count'];
        $totalActive += (int)$v['count'];
    }

    $compScore = 0;
    if ($totalActive > 0) {
        $goodPricing = $competitiveness['great_deal'] + $competitiveness['fair_price'];
        $compScore = round(($goodPricing / $totalActive) * 100);
    }

    // 3. Conversion Rate / Views
    $viewsStmt = $db->prepare("
        SELECT SUM(views) as total_views, 
               SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as total_sold,
               COUNT(*) as total_listings
        FROM products WHERE sellerId = :uid");
    $viewsStmt->execute([':uid' => $userId]);
    $stats = $viewsStmt->fetch(PDO::FETCH_ASSOC);
    
    $totalViews = (int)$stats['total_views'];
    $totalSold = (int)$stats['total_sold'];
    $conversionRate = $totalViews > 0 ? round(($totalSold / $totalViews) * 100, 2) : 0;

    // 4. Generate AI Suggestion Text
    $aiSuggestions = [];
    if ($compScore < 50 && $totalActive > 0) {
        $aiSuggestions[] = "Over {$competitiveness['overpriced']} of your products are priced above the market average. Consider lowering prices to sell faster.";
    } elseif ($compScore >= 80) {
        $aiSuggestions[] = "Your pricing strategy is excellent! Most of your products are highly competitive.";
    }

    if ($trust['score'] < 60) {
        $aiSuggestions[] = "Your trust score is low. Try to get more successful sales and ask buyers to leave 5-star reviews.";
    } elseif ($trust['level'] === 'platinum') {
        $aiSuggestions[] = "You are a Platinum Trusted Seller! This gives your listings priority visibility.";
    }

    if ($conversionRate < 1 && $totalViews > 100) {
        $aiSuggestions[] = "You are getting views, but low sales. Try improving your product images and adding more detailed AI specs.";
    }

    jsonResponse(true, "Insights retrieved", [
        'trust' => $trust,
        'pricingCompetitiveness' => [
            'score' => $compScore,
            'breakdown' => $competitiveness
        ],
        'performance' => [
            'totalViews' => $totalViews,
            'conversionRate' => $conversionRate
        ],
        'aiSuggestions' => $aiSuggestions
    ]);

} catch (PDOException $e) {
    jsonResponse(false, "Database error: " . $e->getMessage(), null, 500);
}
?>
