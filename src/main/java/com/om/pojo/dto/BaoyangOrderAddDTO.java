package com.om.pojo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class BaoyangOrderAddDTO {

    private long deviceId;
    private Integer time;
}
