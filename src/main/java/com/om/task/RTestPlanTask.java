package com.om.task;

import com.om.mapper.RTestPlanMapper;

import com.om.pojo.dto.RTestOrderAddDTO;

import com.om.pojo.entity.RTestPlan;

import com.om.service.RTestOrderService;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;



@Slf4j
@Component
public class RTestPlanTask {

    @Autowired
    private RTestPlanMapper rtestPlanMapper;
    @Autowired
    private RTestOrderService rtestOrderService;

    /**
     * 定时任务
     */
    @Scheduled(cron = "0 23 16 * * *")
    public void Schedule(){
        log.info("定时任务开始");
        List<RTestPlan> rtestPlans = rtestPlanMapper.findPlansToNext(LocalDateTime.now());
        for(RTestPlan rtestPlan:rtestPlans){
            nextOrder(rtestPlan);
            //更新下一次执行时间
            LocalDateTime nextTime = calculateNextTime(LocalDateTime.now(), rtestPlan.getFrequency());
            rtestPlan.setNextTime(nextTime);
            rtestPlanMapper.update(rtestPlan);
            log.info("检测计划{}已生成检测工单，更新下一次执行时间:{}", rtestPlan.getId(),nextTime);
        }
    }

    /**
     * 下次执行工单
     * @param rtestPlan
     */
    private void nextOrder(RTestPlan rtestPlan){
        log.info("检测计划{}正在生成检测工单",rtestPlan.getId());
        RTestOrderAddDTO rtestOrderAddDTO=new RTestOrderAddDTO(rtestPlan.getDeviceId(),rtestPlan.getTime());
        rtestOrderService.add(rtestOrderAddDTO);
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
