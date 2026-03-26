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
    'apple' => 'Apple', 'iphone' => 'Apple', 'ipad' => 'Apple', 'macbook' => 'Apple', 'airpods' => 'Apple',
    'samsung' => 'Samsung', 'galaxy' => 'Samsung',
    'dell' => 'Dell', 'xps' => 'Dell', 'inspiron' => 'Dell',
    'hp' => 'HP', 'lenovo' => 'Lenovo', 'thinkpad' => 'Lenovo', 'asus' => 'Asus',
    'sony' => 'Sony', 'playstation' => 'PlayStation', 'ps5' => 'PlayStation', 'ps4' => 'PlayStation',
    'xbox' => 'Xbox', 'nintendo' => 'Nintendo', 'switch' => 'Nintendo',
    'huawei' => 'Huawei', 'xiaomi' => 'Xiaomi', 'redmi' => 'Xiaomi',
    'canon' => 'Canon', 'nikon' => 'Nikon', 'dji' => 'DJI',
    'bose' => 'Bose', 'jbl' => 'JBL',
    'lg' => 'LG', 'acer' => 'Acer',
];

foreach ($brandMap as $kw => $brand) {
    if (strpos($filename, $kw) !== false) {
        $detectedBrand = $brand;
        $detectedKeywords[] = $brand;
        break;
    }
}

// Category detection from filename
$categoryMap = [
    'phones'  => ['phone', 'iphone', 'galaxy', 'pixel', 'redmi', 'xiaomi', 'mobile', 'smartphone'],
    'laptops' => ['laptop', 'macbook', 'notebook', 'thinkpad', 'inspiron', 'xps', 'chromebook'],
    'tablets' => ['ipad', 'tablet', 'tab'],
    'audio'   => ['airpods', 'headphone', 'earphone', 'earbud', 'speaker', 'jbl', 'bose', 'wh', 'wf'],
    'gaming'  => ['playstation', 'xbox', 'nintendo', 'console', 'ps5', 'ps4', 'switch'],
    'cameras' => ['camera', 'canon', 'nikon', 'dslr', 'mirrorless', 'lens', 'dji', 'drone'],
    'tvs'     => ['tv', 'television', 'monitor', 'display', 'oled', 'qled', 'smart'],
];

foreach ($categoryMap as $cat => $keywords) {
    foreach ($keywords as $kw) {
        if (strpos($filename, $kw) !== false) {
            $detectedCategory = $cat;
            $detectedKeywords[] = $kw;
