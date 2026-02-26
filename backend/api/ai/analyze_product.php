    $aiSummary = sprintf("This %s %s is a %s device suitable for %s. It features %s.",
        $conditionText, "$brand $title",
        $priceVerdict === 'great_deal' ? 'great value' : 'quality',
        $useCase,
        implode(', ', $specList)
    );
} else {
    $aiSummary = sprintf("This %s %s %s is listed for %s. %s",
        $conditionText, $brand,
        $category,
        number_format($price) . ' ETB',
        strlen($description) > 100 ? substr($description, 0, 150) . '...' : $description
    );
}

// ─── 6. ELECTRONICS HEALTH (For Used devices) ────────────────────────────────
$healthBattery = null;
$healthLifespan = null;
if (strtolower($condition) === 'used') {
    // Extract age hints from description
    $ageMonths = 12; // default assume 1 year
    if (preg_match('/(\d+)\s*(?:year|yr)s?\s*old/i', $description, $m)) {
        $ageMonths = min((int)$m[1] * 12, 60);
    } elseif (preg_match('/(\d+)\s*months?\s*(?:old|used)/i', $description, $m)) {
        $ageMonths = min((int)$m[1], 60);
    }
    // Battery health degrades ~2% per month of typical use
    $healthBattery = max(60, 100 - ($ageMonths * 2));
    // Lifespan estimate
    $remainingMonths = max(6, 36 - $ageMonths);
    if ($remainingMonths >= 24)      $healthLifespan = "2–3 more years";
    elseif ($remainingMonths >= 12)  $healthLifespan = "1–2 more years";
    elseif ($remainingMonths >= 6)   $healthLifespan = "6–12 more months";
    else                             $healthLifespan = "Less than 6 months";
}

// ─── 7. SAVE ANALYSIS TO DB (if productId is given) ──────────────────────────
if ($productId) {
    $saveStmt = $db->prepare("INSERT INTO ai_product_analysis 
        (product_id, scam_risk, authenticity_score, price_verdict, ai_summary, extracted_specs, 
         health_battery, health_lifespan, flags, market_low, market_high, market_avg)
        VALUES (:pid, :risk, :auth, :verdict, :summary, :specs, :battery, :lifespan, :flags, :mlow, :mhigh, :mavg)
        ON DUPLICATE KEY UPDATE
            scam_risk = VALUES(scam_risk),
            authenticity_score = VALUES(authenticity_score),
            price_verdict = VALUES(price_verdict),
            ai_summary = VALUES(ai_summary),
            extracted_specs = VALUES(extracted_specs),
            health_battery = VALUES(health_battery),
            health_lifespan = VALUES(health_lifespan),
            flags = VALUES(flags),
            market_low = VALUES(market_low),
            market_high = VALUES(market_high),
            market_avg = VALUES(market_avg),
            analyzed_at = CURRENT_TIMESTAMP");
    $saveStmt->execute([
        ':pid'       => $productId,
        ':risk'      => $scamRisk,
        ':auth'      => (int)$authenticityScore,
        ':verdict'   => $priceVerdict,
        ':summary'   => $aiSummary,
        ':specs'     => json_encode($extractedSpecs),
        ':battery'   => $healthBattery,
        ':lifespan'  => $healthLifespan,
        ':flags'     => json_encode($flags),
        ':mlow'      => $marketLow,
        ':mhigh'     => $marketHigh,
        ':mavg'      => $marketAvg,
    ]);
}

jsonResponse(true, "Analysis complete", [
    'scamRisk'          => $scamRisk,
    'scamScore'         => $scamScore,
