package com.om.pojo.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EngineerLoginVO {
    private long id;
    private String name;
    private String password;
    private String token;
}
