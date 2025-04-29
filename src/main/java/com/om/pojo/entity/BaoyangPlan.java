package com.om.pojo.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;



@Data
@AllArgsConstructor
@NoArgsConstructor
public class BaoyangPlan {

    private long id;
    private long deviceId;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer frequency;
    private Integer time;
    private Integer status;

    private LocalDateTime nextTime;
}
