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
