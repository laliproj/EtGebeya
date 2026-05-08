<?php
// backend/helpers/upload.php

class Uploader {
    private $target_dir = __DIR__ . "/../uploads/products/";
    private $max_size = 5242880; // 5MB
    private $allowed_types = ['image/jpeg', 'image/png', 'image/webp'];

    public function __construct() {
        if (!file_exists($this->target_dir)) {
            mkdir($this->target_dir, 0777, true);
        }
    }

    /**
     * Handle single or multiple file uploads
     * @param array $files - $_FILES['images'] array
     * @return array - Array of successfully uploaded file URLs or error messages
     */
    public function uploadImages($files) {
        $uploadedUrls = [];
        $errors = [];

        // Normalize $_FILES array structure if multiple files
        $file_ary = [];
        $file_count = is_array($files['name']) ? count($files['name']) : 1;
        $file_keys = array_keys($files);

        for ($i = 0; $i < $file_count; $i++) {
