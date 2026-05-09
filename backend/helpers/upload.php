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
            foreach ($file_keys as $key) {
                $file_ary[$i][$key] = is_array($files[$key]) ? $files[$key][$i] : $files[$key];
            }
        }

        // Limit to 10 images max
        if (count($file_ary) > 10) {
            return ['success' => false, 'message' => 'Maximum 10 images allowed.'];
        }

        foreach ($file_ary as $file) {
            if ($file['error'] !== UPLOAD_ERR_OK) {
                continue; // Skip failed uploads
            }

            // Validate size
            if ($file['size'] > $this->max_size) {
                $errors[] = "File {$file['name']} exceeds 5MB limit.";
                continue;
            }

            // Validate type
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime_type = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);

            if (!in_array($mime_type, $this->allowed_types)) {
                $errors[] = "File {$file['name']} is not a valid image format.";
                continue;
