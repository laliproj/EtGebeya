<?php
// backend/api/ai/chatbot.php — Generative AI Support Chatbot using Google Gemini API
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../config/env.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

$data    = json_decode(file_get_contents("php://input"), true);
$message = trim($data['message'] ?? '');
$history = $data['history'] ?? [];

if (empty($message)) {
    jsonResponse(false, "Message is empty", null, 400);
}

// ─── Fallback response if API key is missing ──────────────────────────────
$apiKey = defined('GEMINI_API_KEY') ? GEMINI_API_KEY : '';
if (empty($apiKey)) {
    jsonResponse(true, "Mock response", [
        'reply'        => "I'm sorry, my AI connection is currently offline (Missing API Key). Please contact **admin@etgebeya.com**.",
        'quickReplies' => ['Contact admin']
    ]);
}

// ─── Pull real pricing context from the database ──────────────────────────
$priceContext = '';
try {
    $database = new Database();
    $db       = $database->getConnection();

    // Average, min, and max active listing prices per category
    $priceStmt = $db->query(
        "SELECT category,
                COUNT(*)               AS total_listings,
                ROUND(AVG(price))      AS avg_price,
                ROUND(MIN(price))      AS min_price,
                ROUND(MAX(price))      AS max_price
         FROM   products
         WHERE  status = 'active'
           AND  price  > 0
         GROUP  BY category
         ORDER  BY total_listings DESC
         LIMIT  15"
    );
    $priceRows = $priceStmt->fetchAll(PDO::FETCH_ASSOC);

    if (!empty($priceRows)) {
        $lines = [];
        foreach ($priceRows as $row) {
            $lines[] = sprintf(
                "- %s: %d active listings | avg %s ETB | range %s–%s ETB",
                ucfirst($row['category']),
                $row['total_listings'],
                number_format($row['avg_price']),
                number_format($row['min_price']),
                number_format($row['max_price'])
            );
        }
        $priceContext = "\n\nReal-time market prices on EtGebeya (active listings only):\n"
                      . implode("\n", $lines)
                      . "\n\nAlways use these REAL prices when answering price questions. "
                      . "Do NOT invent or assume prices outside these ranges. "
                      . "If a category isn't listed, say you don't have enough data and advise the user to browse the site.";
    }
} catch (Exception $e) {
    // DB failure is non-fatal — continue without price context
    $priceContext = "\n\n(Live market price data is temporarily unavailable. "
                  . "Advise the user to browse listings directly for current prices.)";
}

// ─── System prompt ────────────────────────────────────────────────────────
$systemInstruction = "You are EtBot, the official AI assistant for EtGebeya, Ethiopia's premier peer-to-peer electronics marketplace.
Your goal is to help buyers and sellers navigate the platform. Keep answers concise, friendly, and formatted nicely in markdown.

Platform context:
- Users buy/sell new and used electronics safely on EtGebeya.
- Trust Scores rate sellers (Platinum, Gold, Silver, Bronze) based on their history.
- AI Market Pricing compares listed prices against real market data from the platform.
- Users can negotiate with AI, do Voice Search, and Visual Search via the search bar.
- Always advise meeting in public places (e.g. cafes, malls) and inspecting items before paying. Never send money in advance.
- For human support or admin help: admin@etgebeya.com | +251 900 000 000.
- IMPORTANT: When asked about prices, ONLY use the real market data provided below. Never make up or guess specific prices.
  If you lack real data for a specific item, say so honestly and direct the user to browse the site.$priceContext

Be conversational, real-time, and helpful. If you don't know something, say so politely.";

// ─── Build conversation history for Gemini ────────────────────────────────
$contents = [];
foreach ($history as $msg) {
    $role = $msg['role'] === 'bot' ? 'model' : 'user';
    // Skip the typing placeholder text
    if (isset($msg['isTyping']) && $msg['isTyping']) continue;
    $contents[] = [
        "role"  => $role,
        "parts" => [["text" => $msg['text']]]
    ];
}

// Append current user message
$contents[] = [
    "role"  => "user",
    "parts" => [["text" => $message]]
];

$postData = [
    "system_instruction" => [
        "parts" => [["text" => $systemInstruction]]
    ],
    "contents"         => $contents,
    "generationConfig" => [
        "temperature"     => 0.4,
        "maxOutputTokens" => 500,
    ]
];

// ─── cURL Request to Gemini ───────────────────────────────────────────────
$apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" . $apiKey;

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST,           true);
curl_setopt($ch, CURLOPT_POSTFIELDS,     json_encode($postData));
curl_setopt($ch, CURLOPT_HTTPHEADER,     ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // For local XAMPP dev
curl_setopt($ch, CURLOPT_TIMEOUT,        15);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr  = curl_error($ch);
curl_close($ch);

$result = $response ? json_decode($response, true) : null;

// ─── Handle Gemini errors — always return HTTP 200 so the frontend
//     can display the message instead of showing "trouble connecting" ───────
if (!$response || $curlErr) {
    jsonResponse(true, "AI offline", [
        'reply'        => "😔 I'm having trouble reaching my AI brain right now. Please try again in a moment, or contact **admin@etgebeya.com**.",
        'quickReplies' => ['Try again', 'Contact admin']
    ]);
}

if ($httpCode !== 200) {
    $errorCode = $result['error']['code']   ?? $httpCode;
    $errorMsg  = $result['error']['message'] ?? 'Unknown error';

    $replyText = "😔 I'm having trouble thinking right now. Please try again later.";
    if ($errorCode === 429) {
        $replyText = "⚠️ **Too many requests!** Our AI is temporarily rate-limited. Please wait a moment and try again.";
    } elseif ($errorCode === 400) {
        $replyText = "⚠️ Something went wrong with my request. Please rephrase and try again.";
    } elseif ($errorCode === 403) {
        $replyText = "⚠️ AI service is not authorized right now. Please contact **admin@etgebeya.com**.";
    }

    // Return 200 so Axios doesn't throw — display the error as a bot reply
    jsonResponse(true, "AI error handled", [
        'reply'        => $replyText,
        'quickReplies' => ['Try again', 'Contact admin']
    ]);
}

// ─── Success path ─────────────────────────────────────────────────────────
$replyText = $result['candidates'][0]['content']['parts'][0]['text']
             ?? "I'm not sure how to respond to that. Could you rephrase?";

// Suggest contextual quick replies
$quickReplies = [];
if (stripos($replyText, 'admin@etgebeya') !== false) {
    // Already pointed to admin — no extra chips needed
} elseif (stripos($message, 'scam') !== false || stripos($message, 'safe') !== false) {
    $quickReplies = ['How does Trust Score work?', 'Safe meeting tips'];
} elseif (stripos($message, 'sell') !== false || stripos($message, 'post') !== false) {
    $quickReplies = ['How do I post an item?', 'Pricing tips'];
} elseif (stripos($message, 'price') !== false || stripos($message, 'cost') !== false || stripos($message, 'how much') !== false) {
    $quickReplies = ['Find a laptop', 'Find a phone', 'Browse all listings'];
} else {
    $quickReplies = ['Find a laptop', 'Am I safe from scams?', 'Contact admin'];
}

jsonResponse(true, "AI Response", [
    'reply'        => $replyText,
    'quickReplies' => $quickReplies
]);
?>
