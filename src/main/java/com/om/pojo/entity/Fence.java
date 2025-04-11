package com.om.pojo.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Fence {

    private long id;
    private BigDecimal centerLat;
    private BigDecimal centerLng;
    private Integer radius;
}
