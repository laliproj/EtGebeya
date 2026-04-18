<?php
// backend/config/env.php
// Stores global configuration and loads local overrides

// Load local environment overrides (like API keys) if available
$localEnvPath = __DIR__ . '/env.local.php';
if (file_exists($localEnvPath)) {
    require_once $localEnvPath;
}

