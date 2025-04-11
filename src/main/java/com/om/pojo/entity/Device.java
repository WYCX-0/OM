package com.om.pojo.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Device {

    private  long id;
    private  String name;
    private  String address;
    private  Integer type;
    private  long fenceId;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime deleteTime;
}
