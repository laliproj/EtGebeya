    jsonResponse(false, "Email is required", null, 400);
}

$email = Validator::sanitize($data['email']);

if (!Validator::isValidEmail($email)) {
    jsonResponse(false, "Invalid email format", null, 400);
}

