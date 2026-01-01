    $query = "INSERT INTO products (sellerId, title, description, price, category, brand, model, `condition`, location, status)
              VALUES (:sellerId, :title, :description, :price, :category, :brand, :model, :condition, :location, 'pending')";
    $stmt = $db->prepare($query);
    $stmt->execute([
        ':sellerId'    => $sellerId,
        ':title'       => $title,
        ':description' => $description,
        ':price'       => $price,
        ':category'    => $category,
        ':brand'       => $brand,
        ':model'       => $model,
        ':condition'   => $condition,
        ':location'    => $location
    ]);

    $productId = $db->lastInsertId();

    // 2. Insert images
    $imgQuery = "INSERT INTO product_images (product_id, image_url, is_cover) VALUES (:pid, :url, :cover)";
    $imgStmt = $db->prepare($imgQuery);
    foreach ($imageUrls as $index => $url) {
        $imgStmt->execute([
            ':pid' => $productId,
            ':url' => $url,
            ':cover' => ($index === 0) ? 1 : 0
        ]);
    }

    // 3. Insert specs
    if (!empty($specs) && is_array($specs)) {
        $specQuery = "INSERT INTO product_specs (product_id, spec_key, spec_value) VALUES (:pid, :key, :val)";
        $specStmt = $db->prepare($specQuery);
        foreach ($specs as $key => $value) {
            $specStmt->execute([
                ':pid' => $productId,
                ':key' => Validator::sanitize($key),
                ':val' => Validator::sanitize($value)
            ]);
        }
    }

    // 4. Insert features
    if (!empty($features) && is_array($features)) {
        $featQuery = "INSERT INTO product_features (product_id, feature) VALUES (:pid, :feat)";
        $featStmt = $db->prepare($featQuery);
        foreach ($features as $feature) {
            $featStmt->execute([
                ':pid' => $productId,
                ':feat' => Validator::sanitize($feature)
            ]);
        }
    }

    $db->commit();

    // 5. Notify Admins
    try {
        $adminQ = $db->query("SELECT id FROM users WHERE isAdmin = 1");
        $admins = $adminQ->fetchAll(PDO::FETCH_ASSOC);
        $notifQuery = "INSERT INTO notifications (user_id, type, title, message, icon) VALUES (:uid, 'pending_product', 'New Listing Request', 'A new product is awaiting approval: $title', '📦')";
        $nStmt = $db->prepare($notifQuery);
        foreach ($admins as $adminRow) {
            $nStmt->execute([':uid' => $adminRow['id']]);
        }
    } catch(Exception $ex) {
        // Ignore notification errors
    }

    jsonResponse(true, "Product created successfully", ['id' => $productId], 201);

} catch(Exception $e) {
    $db->rollBack();
    jsonResponse(false, "Failed to create product: " . $e->getMessage(), null, 500);
}
?>
