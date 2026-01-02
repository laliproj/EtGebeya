    jsonResponse(false, "Email is required", null, 400);
}

$email = Validator::sanitize($data['email']);

if (!Validator::isValidEmail($email)) {
    jsonResponse(false, "Invalid email format", null, 400);
}

// In a real application, you would:
// 1. Check if email exists
// 2. Generate a secure reset token
// 3. Save token in db with expiration
// 4. Send email with the reset link

// For this project, we just mock the success response.
jsonResponse(true, "If that email is in our database, we will send a password reset link.");
?>
