package com.om.service;

import com.om.pojo.dto.TestPlanAddDTO;
import com.om.pojo.dto.TestPlanPageDTO;
import com.om.pojo.entity.TestPlan;
import com.om.pojo.result.PageResult;

public interface TestPlanService {

    /**
     * 添加测试计划
     * @param testPlanAddDTO
     */
    void add(TestPlanAddDTO testPlanAddDTO);

    /**
     * 分页获取测试计划
     * @param testPlanPageDTO
     * @return
     */
    PageResult list(TestPlanPageDTO testPlanPageDTO);

    /**
     * 根据设备id获取测试计划
     * @param deviceId
     * @return
     */
    TestPlan getByDeviceId(long deviceId);

    /**
     * 更新测试计划
     * @param testPlan
     */
    void update(TestPlan testPlan);

    /**
     * 更新测试计划状态
     * @param status
     * @param id
     */
    void status(Integer status, long id);
}
