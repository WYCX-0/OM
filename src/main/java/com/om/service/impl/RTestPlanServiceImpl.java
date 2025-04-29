package com.om.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;

import com.om.mapper.EngineerMapper;
import com.om.mapper.RTestOrderMapper;
import com.om.mapper.RTestPlanMapper;
import com.om.pojo.dto.RTestPlanAddDTO;
import com.om.pojo.dto.RTestPlanPageDTO;
import com.om.pojo.dto.TestPlanAddDTO;
import com.om.pojo.dto.TestPlanPageDTO;
import com.om.pojo.entity.RTestPlan;
import com.om.pojo.entity.TestPlan;
import com.om.pojo.result.PageResult;

import com.om.service.RTestPlanService;
import com.om.service.TestPlanService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;



@Slf4j
@Service
public class RTestPlanServiceImpl implements RTestPlanService {

    @Autowired
    private RTestPlanMapper rtestPlanMapper;
    @Autowired
    private EngineerMapper engineerMapper;
    @Autowired
    private RTestOrderMapper testOrderMapper;

    /**
     * 添加测试计划
     * @param rtestPlanAddDTO
     */
    @Override
    public void add(RTestPlanAddDTO rtestPlanAddDTO) {
        RTestPlan rtestPlan=new RTestPlan();
        rtestPlan.setDeviceId(rtestPlanAddDTO.getDeviceId());
        rtestPlan.setCreateTime(LocalDateTime.now());
        rtestPlan.setFrequency(rtestPlanAddDTO.getFrequency());
        rtestPlan.setTime(rtestPlanAddDTO.getTime());
        rtestPlan.setStatus(0);
        rtestPlanMapper.add(rtestPlan);
    }

    /**
     * 获取测试计划列表
     * @param rtestPlanPageDTO
     * @return
     */
    @Override
    public PageResult list(RTestPlanPageDTO rtestPlanPageDTO) {
        PageHelper.startPage(rtestPlanPageDTO.getPage(), rtestPlanPageDTO.getPageSize());
        Page<RTestPlan> page=rtestPlanMapper.list(rtestPlanPageDTO);
        long total = page.getTotal();
        List<RTestPlan> records = page.getResult();
        return new PageResult(total, records);
    }

    /**
     * 根据设备id获取测试计划
     * @param deviceId
     * @return
     */
    @Override
    public RTestPlan getByDeviceId(long deviceId) {
        RTestPlan rtestPlan = rtestPlanMapper.getByDeviceId(deviceId);
        return rtestPlan;
    }

    /**
     * 更新测试计划
     * @param rtestPlan
     */
    @Override
    public void update(RTestPlan rtestPlan) {
        rtestPlan.setUpdateTime(LocalDateTime.now());
        rtestPlanMapper.update(rtestPlan);
    }

    /**
     * 更新测试计划状态
     * @param status
     * @param id
     */
    @Override
    public void status(Integer status, long id) {
        RTestPlan rtestPlan =rtestPlanMapper.getById(id);
        rtestPlan.setStatus(status);
        rtestPlan.setUpdateTime(LocalDateTime.now());
        if(status==1){
            LocalDateTime nextTime =calculateNextTime(rtestPlan.getUpdateTime(),rtestPlan.getFrequency());
            rtestPlan.setNextTime(nextTime);
        }else{
            //停用状态下清除下次执行时间
            rtestPlan.setNextTime(null);
        }
        rtestPlanMapper.update(rtestPlan);
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
