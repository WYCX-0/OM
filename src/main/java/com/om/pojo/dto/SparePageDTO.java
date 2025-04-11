package com.om.pojo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SparePageDTO {
    private long engineerId;
    private Integer page;
    private Integer pageSize;
}
