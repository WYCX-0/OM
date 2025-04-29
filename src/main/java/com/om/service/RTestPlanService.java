package com.om.service;

import com.om.pojo.dto.RTestPlanPageDTO;

import com.om.pojo.dto.RTestPlanAddDTO;

import com.om.pojo.entity.RTestPlan;

import com.om.pojo.result.PageResult;


public interface RTestPlanService {

    /**
     * 添加测试计划
     * @param rtestPlanAddDTO
     */
    void add(RTestPlanAddDTO rtestPlanAddDTO);

    /**
     * 分页获取测试计划
     * @param rtestPlanPageDTO
     * @return
     */
    PageResult list(RTestPlanPageDTO rtestPlanPageDTO);

    /**
     * 根据设备id获取测试计划
     * @param deviceId
     * @return
     */
    RTestPlan getByDeviceId(long deviceId);

    /**
     * 更新测试计划
     * @param rtestPlan
     */
    void update(RTestPlan rtestPlan);

    /**
     * 更新测试计划状态
     * @param status
     * @param id
     */
    void status(Integer status, long id);
}
