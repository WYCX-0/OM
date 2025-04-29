package com.om.task;

import com.om.mapper.BaoyangPlanMapper;

import com.om.pojo.dto.BaoyangOrderAddDTO;

import com.om.pojo.entity.BaoyangPlan;

import com.om.service.BaoyangOrderService;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;


@Slf4j
@Component
public class BaoyangPlanTask {

    @Autowired
    private BaoyangPlanMapper baoyangPlanMapper;
    @Autowired
    private BaoyangOrderService baoyangOrderService;

    /**
     * 定时任务
     */
    @Scheduled(cron = "0 52 20 * * *")
    public void Schedule(){
        log.info("定时任务开始");
        List<BaoyangPlan> baoyangPlans = baoyangPlanMapper.findPlansToNext(LocalDateTime.now());
        for(BaoyangPlan baoyangPlan:baoyangPlans){
            nextOrder(baoyangPlan);
            //更新下一次执行时间
            LocalDateTime nextTime = calculateNextTime(LocalDateTime.now(), baoyangPlan.getFrequency());
            baoyangPlan.setNextTime(nextTime);
            baoyangPlanMapper.update(baoyangPlan);
            log.info("检测计划{}已生成检测工单，更新下一次执行时间:{}",baoyangPlan.getId(),nextTime);
        }
    }

    /**
     * 下次执行工单
     * @param baoyangPlan
     */
    private void nextOrder(BaoyangPlan baoyangPlan){
        log.info("检测计划{}正在生成检测工单",baoyangPlan.getId());
        BaoyangOrderAddDTO baoyangOrderAddDTO=new BaoyangOrderAddDTO(baoyangPlan.getDeviceId(),baoyangPlan.getTime());
        baoyangOrderService.add(baoyangOrderAddDTO);
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
