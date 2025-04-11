package com.om.pojo.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Spare {

    private long id;
    private long engineerId;
    private String detail;
    private LocalDateTime createTime;
    private long failId;
}
