package com.imatoilet.backend;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInventoryId implements Serializable {
    private String userId;
    private String materialKey;
}
