package com.om.pojo.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;



import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RTestOrder {

    private long id;
    private long deviceId;
    private long engineerId;
    private LocalDateTime createTime;
    private LocalDateTime dealTime;
    private LocalDateTime finishTime;
    private LocalDateTime deleteTime;
    private Integer status;
    private Integer time;
    private String finishUrl;
    private Integer current;
}
