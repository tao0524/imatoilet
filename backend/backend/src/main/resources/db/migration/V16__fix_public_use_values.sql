-- 商業施設・ホテル・病院 → null（施設利用可・publicUseでは判定しない）
UPDATE toilet SET public_use = null
WHERE facility_category IN ('commercial', 'hotel_tourism', 'medical');

-- コンビニ → false（要購入）
UPDATE toilet SET public_use = false
WHERE facility_category = 'convenience';

-- 公衆トイレ・公園・駅 → true（誰でも無料）
UPDATE toilet SET public_use = true
WHERE facility_category IN ('public', 'park', 'station');
