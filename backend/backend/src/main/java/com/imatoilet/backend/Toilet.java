package com.imatoilet.backend;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "toilet")
@Data
public class Toilet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Double lat;
    private Double lng;
    private String address;
    private Boolean publicUse;
    private Boolean diaper;
    private Boolean wheelchair;
    private Boolean typePark;
    private Boolean typeStation;
    private Boolean typeMall;
    private String description;
    
    // DataLoaderのエラーを解消するために追加
    private Boolean open24h;
}
