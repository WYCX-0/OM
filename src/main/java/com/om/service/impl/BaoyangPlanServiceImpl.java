package com.om.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.om.mapper.*;
import com.om.pojo.dto.BaoyangPlanAddDTO;
import com.om.pojo.dto.BaoyangPlanPageDTO;

import com.om.pojo.entity.BaoyangPlan;

import com.om.pojo.result.PageResult;
import com.om.service.BaoyangPlanService;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;



@Slf4j
@Service
public class BaoyangPlanServiceImpl implements BaoyangPlanService {

    @Autowired
    private BaoyangPlanMapper baoyangPlanMapper;
    @Autowired
    private EngineerMapper engineerMapper;
    @Autowired
    private BaoyangOrderMapper baoyangOrderMapper;

    /**
     * 添加测试计划
     * @param baoyangPlanAddDTO
     */
    @Override
    public void add(BaoyangPlanAddDTO baoyangPlanAddDTO) {
        BaoyangPlan baoyangPlan=new BaoyangPlan();
        baoyangPlan.setDeviceId(baoyangPlanAddDTO.getDeviceId());
        baoyangPlan.setCreateTime(LocalDateTime.now());
        baoyangPlan.setFrequency(baoyangPlanAddDTO.getFrequency());
        baoyangPlan.setTime(baoyangPlanAddDTO.getTime());
        baoyangPlan.setStatus(0);
        baoyangPlanMapper.add(baoyangPlan);
    }

    /**
     * 获取测试计划列表
     * @param baoyangPlanPageDTO
     * @return
     */
    @Override
    public PageResult list(BaoyangPlanPageDTO baoyangPlanPageDTO) {
        PageHelper.startPage(baoyangPlanPageDTO.getPage(), baoyangPlanPageDTO.getPageSize());
        Page<BaoyangPlan> page=baoyangPlanMapper.list(baoyangPlanPageDTO);
        long total = page.getTotal();
        List<BaoyangPlan> records = page.getResult();
        return new PageResult(total, records);
    }

    /**
     * 根据设备id获取测试计划
     * @param deviceId
     * @return
     */
    @Override
    public BaoyangPlan getByDeviceId(long deviceId) {
        BaoyangPlan baoyangPlan = baoyangPlanMapper.getByDeviceId(deviceId);
        return baoyangPlan;
    }

    /**
     * 更新测试计划
     * @param baoyangPlan
     */
    @Override
    public void update(BaoyangPlan baoyangPlan) {
        baoyangPlan.setUpdateTime(LocalDateTime.now());
        baoyangPlanMapper.update(baoyangPlan);
    }

    /**
     * 更新测试计划状态
     * @param status
     * @param id
     */
    @Override
    public void status(Integer status, long id) {
        BaoyangPlan baoyangPlan =baoyangPlanMapper.getById(id);
        baoyangPlan.setStatus(status);
        baoyangPlan.setUpdateTime(LocalDateTime.now());
        if(status==1){
            LocalDateTime nextTime =calculateNextTime(baoyangPlan.getUpdateTime(),baoyangPlan.getFrequency());
            baoyangPlan.setNextTime(nextTime);
        }else{
            //停用状态下清除下次执行时间
            baoyangPlan.setNextTime(null);
        }
        baoyangPlanMapper.update(baoyangPlan);
    }

    /**
     * 计算下次执行时间
     * @param createTime
     * @param frequency
     * @return
     */
    private LocalDateTime calculateNextTime(LocalDateTime createTime,Integer frequency){
        switch(frequency){
            case 1:
                return createTime.plusDays(1);
            case 2:
                return createTime.plusMonths(1);
            case 3:
                return createTime.plusMonths(3);
            case 4:
                return createTime.plusMonths(6);
            case 5:
                return createTime.plusYears(1);
            default:
                throw new RuntimeException("frequency is error");
        }
    }



}
