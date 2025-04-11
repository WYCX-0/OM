package com.om.pojo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FailAddDTO {

    private String detail;
    private long deviceId;
    private String beforeUrl;
}
