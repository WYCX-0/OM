package com.om.pojo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DevicePageDTO {

    private String name;
    private String address;
    private Integer type;
    private Integer page;
    private Integer pageSize;
}
