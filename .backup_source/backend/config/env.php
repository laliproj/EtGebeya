<?php
// backend/config/env.php
// Stores global configuration and loads local overrides

// Load local environment overrides (like API keys) if available
$localEnvPath = __DIR__ . '/env.local.php';
if (file_exists($localEnvPath)) {
    require_once $localEnvPath;
}

// Fallback if not defined in env.local.php
if (!defined('GEMINI_API_KEY')) {
    $envKey = getenv('GEMINI_API_KEY');
    define('GEMINI_API_KEY', $envKey ? $envKey : 'put_your_api_key_here');
}

// Other global configs
define('USD_TO_ETB_RATE', 170.0);
?>
