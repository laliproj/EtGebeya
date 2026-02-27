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
            ["role" => "user", "parts" => [["text" => $pricePrompt]]]
        ],
        // Google Search grounding gives Gemini live web access
        "tools" => [
            ["google_search" => (object)[]]
        ],
        "generationConfig" => [
            "temperature"     => 0.1,
            "maxOutputTokens" => 60
        ]
    ];

    $geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" . $geminiApiKey;
    $ch = curl_init($geminiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST,           true);
    curl_setopt($ch, CURLOPT_POSTFIELDS,     json_encode($geminiBody));
    curl_setopt($ch, CURLOPT_HTTPHEADER,     ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT,        20);
    $geminiResp = curl_exec($ch);
    curl_close($ch);

    if ($geminiResp) {
        $geminiData = json_decode($geminiResp, true);
        $priceText  = $geminiData['candidates'][0]['content']['parts'][0]['text'] ?? '';
        
        // Remove commas just in case Gemini ignored the instruction
        $priceText = str_replace(',', '', $priceText);

        // Parse: LOW:xxx AVG:xxx HIGH:xxx
        $lowUSD = $avgUSD = $highUSD = null;
        if (preg_match('/LOW[:\s]+(\d+(?:\.\d+)?)/i',  $priceText, $m)) $lowUSD  = (float)$m[1];
        if (preg_match('/AVG[:\s]+(\d+(?:\.\d+)?)/i',  $priceText, $m)) $avgUSD  = (float)$m[1];
        if (preg_match('/HIGH[:\s]+(\d+(?:\.\d+)?)/i', $priceText, $m)) $highUSD = (float)$m[1];

        // Sanity check: all three values present, non-zero, and within a realistic USD range
        // If $avgUSD > 10000, Gemini probably returned ETB or another currency by mistake.
        if ($lowUSD > 0 && $avgUSD > 0 && $highUSD > 0
            && $lowUSD <= $avgUSD && $avgUSD <= $highUSD
            && $avgUSD < 10000) {
            $marketLow  = round($lowUSD  * $conversionRate * $condFactor);
            $marketAvg  = round($avgUSD  * $conversionRate * $condFactor);
            $marketHigh = round($highUSD * $conversionRate * $condFactor);
        }
    }
}

// ── Fallback to static baselines if Gemini failed / returned bad data ────────
if (!$marketLow || !$marketAvg || !$marketHigh) {
    $usdBaselines = [
        'phones'   => ['Apple'=>['low'=>400,'avg'=>800,'high'=>1200],  'Samsung'=>['low'=>200,'avg'=>600,'high'=>1100],
                       'Xiaomi'=>['low'=>150,'avg'=>280,'high'=>550],   'OnePlus'=>['low'=>300,'avg'=>500,'high'=>800],
                       'Google'=>['low'=>350,'avg'=>600,'high'=>900],   '_default'=>['low'=>120,'avg'=>300,'high'=>650]],
        'laptops'  => ['Apple'=>['low'=>999,'avg'=>1600,'high'=>3500],  'Dell'=>['low'=>400,'avg'=>800,'high'=>1800],
                       'HP'=>['low'=>350,'avg'=>750,'high'=>1500],      'Lenovo'=>['low'=>350,'avg'=>750,'high'=>1600],
                       'Asus'=>['low'=>400,'avg'=>850,'high'=>1800],    'Acer'=>['low'=>300,'avg'=>600,'high'=>1200],
                       '_default'=>['low'=>350,'avg'=>700,'high'=>1500]],
        'tablets'  => ['Apple'=>['low'=>329,'avg'=>650,'high'=>1200],   'Samsung'=>['low'=>200,'avg'=>400,'high'=>800],
                       '_default'=>['low'=>150,'avg'=>350,'high'=>700]],
        'audio'    => ['Apple'=>['low'=>129,'avg'=>220,'high'=>400],    'Sony'=>['low'=>80,'avg'=>200,'high'=>350],
                       'Bose'=>['low'=>150,'avg'=>280,'high'=>450],     'JBL'=>['low'=>50,'avg'=>100,'high'=>250],
                       '_default'=>['low'=>30,'avg'=>80,'high'=>150]],
        'gaming'   => ['PlayStation'=>['low'=>400,'avg'=>500,'high'=>700],'Xbox'=>['low'=>300,'avg'=>500,'high'=>600],
                       'Nintendo'=>['low'=>200,'avg'=>300,'high'=>400],  '_default'=>['low'=>250,'avg'=>400,'high'=>600]],
        'cameras'  => ['Canon'=>['low'=>400,'avg'=>800,'high'=>2000],   'Nikon'=>['low'=>400,'avg'=>800,'high'=>2000],
                       'Sony'=>['low'=>500,'avg'=>1000,'high'=>2500],   '_default'=>['low'=>300,'avg'=>700,'high'=>1500]],
        'tvs'      => ['Samsung'=>['low'=>300,'avg'=>700,'high'=>2000], 'LG'=>['low'=>300,'avg'=>700,'high'=>2000],
                       'Sony'=>['low'=>400,'avg'=>900,'high'=>2500],    '_default'=>['low'=>200,'avg'=>500,'high'=>1200]],
        '_default' => ['_default'=>['low'=>100,'avg'=>300,'high'=>800]],
    ];
    $catB   = $usdBaselines[$category]  ?? $usdBaselines['_default'];
    $brandB = $catB[$brand] ?? $catB['_default'] ?? array_values($catB)[0];
    $marketLow  = round($brandB['low']  * $conversionRate * $condFactor);
    $marketAvg  = round($brandB['avg']  * $conversionRate * $condFactor);
    $marketHigh = round($brandB['high'] * $conversionRate * $condFactor);
}

// ─── 2. PRICE VERDICT ────────────────────────────────────────────────────────
$priceVerdict = 'unknown';
$priceFlag = null;
if ($marketAvg && $marketLow && $marketHigh) {
    if ($price <= $marketLow * 0.75) {
        $priceVerdict = 'great_deal';
    } elseif ($price <= $marketHigh * 1.05) {
        $priceVerdict = 'fair_price';
    } else {
        $priceVerdict = 'overpriced';
        $priceFlag = sprintf("Price is %.0f%% above market average (%.0f ETB)", 
            (($price - $marketAvg) / $marketAvg * 100), $marketAvg);
    }
    // Suspiciously low = scam indicator
    if ($price < $marketAvg * 0.4) {
        $priceFlag = sprintf("Price is suspiciously low — %.0f%% below market average. Possible scam.", 
            (($marketAvg - $price) / $marketAvg * 100));
    }
}

// ─── 3. SCAM DETECTION ──────────────────────────────────────────────────────
$scamScore = 0; // 0 = clean, accumulate to determine risk
$flags = [];

// 3a. Suspiciously low price
if ($marketAvg && $price < $marketAvg * 0.4) {
    $scamScore += 40;
    $flags[] = "Price is suspiciously low compared to market average.";
}
// 3b. Very short/vague description
if (mb_strlen($description) < 30) {
    $scamScore += 20;
    $flags[] = "Description is too short and lacks detail.";
}
// 3c. Common scam phrases in description
$scamPhrases = ['whatsapp only', 'contact me on telegram', 'outside the platform', 
    'pay before viewing', 'western union', 'money transfer first', 'i am abroad',
    'send money', 'gift card', 'wire transfer'];
foreach ($scamPhrases as $phrase) {
    if (stripos($description, $phrase) !== false || stripos($title, $phrase) !== false) {
        $scamScore += 35;
        $flags[] = "Suspicious phrase detected: \"$phrase\"";
        break;
    }
}
// 3d. Title/brand mismatch
$knownBrands = ['Apple','Samsung','Dell','HP','Lenovo','Sony','LG','Asus','Acer','Huawei',
    'Xiaomi','OnePlus','Google','Microsoft','Nintendo','PlayStation','Xbox','Canon',
    'Nikon','DJI','Bose','JBL'];
$titleHasBrand = false;
foreach ($knownBrands as $kb) {
    if (stripos($title, $kb) !== false) { $titleHasBrand = true; break; }
}
if (!empty($brand) && !in_array($brand, $knownBrands) && $titleHasBrand) {
    $scamScore += 15;
    $flags[] = "Brand name does not match recognized brand list.";
}
// 3e. Check for duplicate similar titles from different sellers
if ($productId) {
    $dupStmt = $db->prepare("SELECT COUNT(*) FROM products 
        WHERE title LIKE :title AND sellerId != :uid AND status IN ('active','pending') AND id != :pid");
    $dupStmt->execute([':title' => '%' . substr($title, 0, 20) . '%', ':uid' => $userId, ':pid' => $productId]);
} else {
    $dupStmt = $db->prepare("SELECT COUNT(*) FROM products 
        WHERE title LIKE :title AND sellerId != :uid AND status IN ('active','pending')");
    $dupStmt->execute([':title' => '%' . substr($title, 0, 20) . '%', ':uid' => $userId]);
}
$dupCount = (int)$dupStmt->fetchColumn();
if ($dupCount >= 3) {
    $scamScore += 15;
