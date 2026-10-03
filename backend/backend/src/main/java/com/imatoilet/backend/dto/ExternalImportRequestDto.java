package com.imatoilet.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
public class ExternalImportRequestDto {
    private boolean dryRun;

    @NotEmpty(message = "toiletsは1件以上必要です")
    @Size(max = 100, message = "toiletsは100件以下で指定してください")
    @Valid
    private List<@NotNull(message = "toiletsの項目はnullにできません") ExternalImportItemDto> toilets;

    @AssertTrue(message = "同じrequest内でsourceKey + sourceExternalIdは重複できません")
    public boolean isExternalIdsUnique() {
        if (toilets == null) {
            return true;
        }
        Set<String> keys = new HashSet<>();
        for (ExternalImportItemDto item : toilets) {
            if (item == null || item.getSourceKey() == null || item.getSourceExternalId() == null) {
                continue;
            }
            if (!keys.add(item.getSourceKey() + "\u0000" + item.getSourceExternalId())) {
                return false;
            }
        }
        return true;
    }
}
