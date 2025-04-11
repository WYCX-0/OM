package com.om.pojo.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Engineer {

    private long id;
    private String name;
    private String password;
    private String phone;
    private String engineerNo;
    private LocalDateTime createTime;
    private LocalDateTime deleteTime;
    private Integer status;
}
