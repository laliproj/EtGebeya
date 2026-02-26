    $aiSummary = sprintf("This %s %s is a %s device suitable for %s. It features %s.",
        $conditionText, "$brand $title",
        $priceVerdict === 'great_deal' ? 'great value' : 'quality',
        $useCase,
        implode(', ', $specList)
    );
} else {
    $aiSummary = sprintf("This %s %s %s is listed for %s. %s",
        $conditionText, $brand,
        $category,
        number_format($price) . ' ETB',
        strlen($description) > 100 ? substr($description, 0, 150) . '...' : $description
    );
}

// ─── 6. ELECTRONICS HEALTH (For Used devices) ────────────────────────────────
$healthBattery = null;
$healthLifespan = null;
if (strtolower($condition) === 'used') {
    // Extract age hints from description
    $ageMonths = 12; // default assume 1 year
    if (preg_match('/(\d+)\s*(?:year|yr)s?\s*old/i', $description, $m)) {
        $ageMonths = min((int)$m[1] * 12, 60);
    } elseif (preg_match('/(\d+)\s*months?\s*(?:old|used)/i', $description, $m)) {
        $ageMonths = min((int)$m[1], 60);
    }
    // Battery health degrades ~2% per month of typical use
    $healthBattery = max(60, 100 - ($ageMonths * 2));
    // Lifespan estimate
    $remainingMonths = max(6, 36 - $ageMonths);
    if ($remainingMonths >= 24)      $healthLifespan = "2–3 more years";
    elseif ($remainingMonths >= 12)  $healthLifespan = "1–2 more years";
    elseif ($remainingMonths >= 6)   $healthLifespan = "6–12 more months";
    else                             $healthLifespan = "Less than 6 months";
}

// ─── 7. SAVE ANALYSIS TO DB (if productId is given) ──────────────────────────
if ($productId) {
    $saveStmt = $db->prepare("INSERT INTO ai_product_analysis 
        (product_id, scam_risk, authenticity_score, price_verdict, ai_summary, extracted_specs, 
         health_battery, health_lifespan, flags, market_low, market_high, market_avg)
        VALUES (:pid, :risk, :auth, :verdict, :summary, :specs, :battery, :lifespan, :flags, :mlow, :mhigh, :mavg)
        ON DUPLICATE KEY UPDATE
            scam_risk = VALUES(scam_risk),
            authenticity_score = VALUES(authenticity_score),
            price_verdict = VALUES(price_verdict),
            ai_summary = VALUES(ai_summary),
            extracted_specs = VALUES(extracted_specs),
            health_battery = VALUES(health_battery),
            health_lifespan = VALUES(health_lifespan),
            flags = VALUES(flags),
            market_low = VALUES(market_low),
            market_high = VALUES(market_high),
            market_avg = VALUES(market_avg),
            analyzed_at = CURRENT_TIMESTAMP");
    $saveStmt->execute([
        ':pid'       => $productId,
        ':risk'      => $scamRisk,
        ':auth'      => (int)$authenticityScore,
        ':verdict'   => $priceVerdict,
        ':summary'   => $aiSummary,
        ':specs'     => json_encode($extractedSpecs),
        ':battery'   => $healthBattery,
        ':lifespan'  => $healthLifespan,
        ':flags'     => json_encode($flags),
        ':mlow'      => $marketLow,
        ':mhigh'     => $marketHigh,
        ':mavg'      => $marketAvg,
    ]);
}

jsonResponse(true, "Analysis complete", [
    'scamRisk'          => $scamRisk,
    'scamScore'         => $scamScore,
    'authenticityScore' => (int)$authenticityScore,
    'priceVerdict'      => $priceVerdict,
    'flags'             => $flags,
    'aiSummary'         => $aiSummary,
    'extractedSpecs'    => $extractedSpecs,
    'market'            => [
        'low'  => $marketLow,
        'high' => $marketHigh,
        'avg'  => $marketAvg,
    ],
    'health' => [
        'battery'  => $healthBattery,
        'lifespan' => $healthLifespan,
    ],
]);
?>
      <?php
// backend/api/ai/analyze_product.php
// AI Product Analyzer: Scam Detection, Price Intelligence, Spec Extraction, Summary Generator
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/env.php';

$userId = AuthMiddleware::authenticate();

$data = json_decode(file_get_contents("php://input"), true);
$title       = trim($data['title'] ?? '');
$description = trim($data['description'] ?? '');
$price       = (float)($data['price'] ?? 0);
$category    = trim($data['category'] ?? '');
$brand       = trim($data['brand'] ?? '');
$condition   = trim($data['condition'] ?? '');
$productId   = isset($data['productId']) ? (int)$data['productId'] : null;

if (empty($title) || $price <= 0 || empty($category)) {
    jsonResponse(false, "Missing required fields", null, 400);
}

$database = new Database();
$db = $database->getConnection();

// ─── 1. MARKET PRICE ESTIMATION via Gemini + Google Search ──────────────────
// Ask Gemini (with real-time Google Search grounding) for the actual USD retail
// price of this exact product, then convert to ETB × 170.
$marketLow = $marketHigh = $marketAvg = null;
$conversionRate = defined('USD_TO_ETB_RATE') ? USD_TO_ETB_RATE : 170;

// Condition depreciation factor (applied after we get the USD price)
$condFactor = 1.0;
if (strtolower($condition) === 'used')         $condFactor = 0.65;
if (strtolower($condition) === 'refurbished')   $condFactor = 0.80;

$geminiApiKey = defined('GEMINI_API_KEY') ? GEMINI_API_KEY : '';
if (!empty($geminiApiKey)) {
    // Build a very focused prompt so Gemini returns only numbers
    $condLabel  = $condition ?: 'new';
    $searchTerm = trim("$brand $title");
    $pricePrompt = "Search Google and find the current real retail market price STRICTLY in USD (United States Dollars) for: \"$searchTerm\" ($condLabel condition, $category). "
        . "DO NOT return Ethiopian Birr (ETB) or any other local currency. USD ONLY. "
        . "Reply ONLY in this exact format with no other text:\n"
        . "LOW:[number] AVG:[number] HIGH:[number]\n"
        . "Example: LOW:800 AVG:1200 HIGH:1500\n"
        . "Numbers only, no $ sign, no commas.";

    $geminiBody = [
        "contents" => [
