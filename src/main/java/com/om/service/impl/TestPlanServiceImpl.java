package com.om.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.om.mapper.EngineerMapper;
import com.om.mapper.TestOrderMapper;
import com.om.mapper.TestPlanMapper;
import com.om.pojo.dto.TestPlanAddDTO;
import com.om.pojo.dto.TestPlanPageDTO;
import com.om.pojo.entity.Engineer;
import com.om.pojo.entity.TestOrder;
import com.om.pojo.entity.TestPlan;
import com.om.pojo.result.PageResult;
import com.om.service.TestPlanService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j@Service
public class TestPlanServiceImpl implements TestPlanService {

    @Autowired
    private TestPlanMapper testPlanMapper;
    @Autowired
    private EngineerMapper engineerMapper;
    @Autowired
    private TestOrderMapper testOrderMapper;

    /**
     * 添加测试计划
     * @param testPlanAddDTO
     */
    @Override
    public void add(TestPlanAddDTO testPlanAddDTO) {
        TestPlan testPlan=new TestPlan();
        testPlan.setDeviceId(testPlanAddDTO.getDeviceId());
        testPlan.setCreateTime(LocalDateTime.now());
        testPlan.setFrequency(testPlanAddDTO.getFrequency());
        testPlan.setTime(testPlanAddDTO.getTime());
        testPlan.setStatus(0);
        testPlanMapper.add(testPlan);
    }

    /**
     * 获取测试计划列表
     * @param testPlanPageDTO
     * @return
     */
    @Override
    public PageResult list(TestPlanPageDTO testPlanPageDTO) {
        PageHelper.startPage(testPlanPageDTO.getPage(), testPlanPageDTO.getPageSize());
        Page<TestPlan> page=testPlanMapper.list(testPlanPageDTO);
        long total = page.getTotal();
        List<TestPlan> records = page.getResult();
        return new PageResult(total, records);
    }

    /**
     * 根据设备id获取测试计划
     * @param deviceId
     * @return
     */
    @Override
    public TestPlan getByDeviceId(long deviceId) {
        TestPlan testPlan = testPlanMapper.getByDeviceId(deviceId);
        return testPlan;
    }

    /**
     * 更新测试计划
     * @param testPlan
     */
    @Override
    public void update(TestPlan testPlan) {
        testPlan.setUpdateTime(LocalDateTime.now());
        testPlanMapper.update(testPlan);
    }

    /**
     * 更新测试计划状态
     * @param status
     * @param id
     */
    @Override
    public void status(Integer status, long id) {
        TestPlan testPlan =testPlanMapper.getById(id);
        testPlan.setStatus(status);
        testPlan.setUpdateTime(LocalDateTime.now());
        if(status==1){
            LocalDateTime nextTime =calculateNextTime(testPlan.getUpdateTime(),testPlan.getFrequency());
            testPlan.setNextTime(nextTime);
        }else{
            //停用状态下清除下次执行时间
            testPlan.setNextTime(null);
        }
        testPlanMapper.update(testPlan);
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
