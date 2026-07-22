package com.imatoilet.backend.dto;

import java.util.List;

public class EditToiletRequestDto {
    private String facilityCategory;
    private String usageConditions;
    private List<String> equipment;

    public String getFacilityCategory() { return facilityCategory; }
    public void setFacilityCategory(String facilityCategory) { this.facilityCategory = facilityCategory; }

    public String getUsageConditions() { return usageConditions; }
    public void setUsageConditions(String usageConditions) { this.usageConditions = usageConditions; }

    public List<String> getEquipment() { return equipment; }
    public void setEquipment(List<String> equipment) { this.equipment = equipment; }
}
