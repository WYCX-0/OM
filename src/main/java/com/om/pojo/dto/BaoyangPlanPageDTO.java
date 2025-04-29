package com.om.pojo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;



@Data
@AllArgsConstructor
@NoArgsConstructor
public class BaoyangPlanPageDTO {

    private long deviceId;
    private Integer status;
    private Integer page;
    private Integer pageSize;
}

