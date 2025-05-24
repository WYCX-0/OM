package com.om.task;

import com.om.mapper.TestPlanMapper;
import com.om.pojo.dto.TestOrderAddDTO;
import com.om.pojo.entity.TestPlan;
import com.om.service.TestOrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
public class TestPlanTask {

    @Autowired
    private TestPlanMapper testPlanMapper;
    @Autowired
    private TestOrderService testOrderService;

    /**
     * 定时任务
     */
    @Scheduled(cron = "0 26 16 * * *")
    public void Schedule(){
        log.info("定时任务开始");
        List<TestPlan> testPlans = testPlanMapper.findPlansToNext(LocalDateTime.now());
        for(TestPlan testPlan:testPlans){
            nextOrder(testPlan);
            //更新下一次执行时间
            LocalDateTime nextTime = calculateNextTime(LocalDateTime.now(), testPlan.getFrequency());
            testPlan.setNextTime(nextTime);
            testPlanMapper.update(testPlan);
            log.info("检测计划{}已生成检测工单，更新下一次执行时间:{}", testPlan.getId(),nextTime);
        }
    }

    /**
     * 下次执行工单
     * @param testPlan
     */
    private void nextOrder(TestPlan testPlan){
        log.info("检测计划{}正在生成检测工单",testPlan.getId());
        TestOrderAddDTO testOrderAddDTO=new TestOrderAddDTO(testPlan.getDeviceId(),testPlan.getTime());
        testOrderService.add(testOrderAddDTO);
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
