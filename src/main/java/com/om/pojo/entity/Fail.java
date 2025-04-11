package com.om.pojo.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Fail implements Serializable {
    private long id;
    private String detail;
    private LocalDateTime createTime;
    private LocalDateTime dealTime;
    private LocalDateTime finishTime;
    private LocalDateTime deleteTime;
    private String beforeUrl;
    private String finishUrl;
    private  long engineerId;
    private  long deviceId;
    private  Integer status;
    private  long spareId;
}
