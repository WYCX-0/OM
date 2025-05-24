package com.om.pojo.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SummaryVO {

    private Long engineerId;
    private Integer totalOrders; // 总工单数
    private Integer failCount;   // 故障工单数
    private Integer testCount;   // 检测工单数
    private Integer rTestCount;  // 可能是其他类型的检测工单
    private Integer baoyangCount; // 保养工单数
}
