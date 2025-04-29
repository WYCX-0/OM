package com.om.service;

import com.om.pojo.dto.BaoyangPlanAddDTO;
import com.om.pojo.dto.BaoyangPlanPageDTO;

import com.om.pojo.entity.BaoyangPlan;

import com.om.pojo.result.PageResult;



public interface BaoyangPlanService {

    /**
     * 添加测试计划
     * @param baoyangPlanAddDTO
     */
    void add(BaoyangPlanAddDTO baoyangPlanAddDTO);

    /**
     * 分页获取测试计划
     * @param baoyangPlanPageDTO
     * @return
     */
    PageResult list(BaoyangPlanPageDTO baoyangPlanPageDTO);

    /**
     * 根据设备id获取测试计划
     * @param deviceId
     * @return
     */
    BaoyangPlan getByDeviceId(long deviceId);

    /**
     * 更新测试计划
     * @param baoyangPlan
     */
    void update(BaoyangPlan baoyangPlan);

    /**
     * 更新测试计划状态
     * @param status
     * @param id
     */
    void status(Integer status, long id);
}
