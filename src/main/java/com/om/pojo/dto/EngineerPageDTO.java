package com.om.pojo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EngineerPageDTO {

    private String name;
    private String engineerNo;
    private Integer page;
    private Integer pageSize;
}
