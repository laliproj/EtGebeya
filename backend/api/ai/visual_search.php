<?php
// backend/api/ai/visual_search.php — AI Visual Product Search
// Uses image metadata (filename, EXIF, color analysis) to infer product type
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/response.php';

if (!isset($_FILES['image'])) {
    jsonResponse(false, "No image uploaded", null, 400);
}

$file     = $_FILES['image'];
$tmpPath  = $file['tmp_name'];
$mimeType = mime_content_type($tmpPath);

if (!in_array($mimeType, ['image/jpeg', 'image/png', 'image/webp', 'image/gif'])) {
    jsonResponse(false, "Invalid file type. Please upload an image.", null, 400);
}

// ─── Feature Extraction from Image ───────────────────────────────────────────
$detectedKeywords = [];
$detectedCategory = null;
$detectedBrand    = null;

// 1. Filename hints (e.g. "iphone_14_pro.jpg")
$filename = strtolower(pathinfo($file['name'], PATHINFO_FILENAME));
$filename = preg_replace('/[^a-z0-9]/', ' ', $filename);

// Brand detection from filename
$brandMap = [
