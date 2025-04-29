package com.om.pojo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;



@Data
@AllArgsConstructor
@NoArgsConstructor
public class BaoyangPlanAddDTO {

    private long deviceId;
    private Integer frequency;
    private Integer time;
}
