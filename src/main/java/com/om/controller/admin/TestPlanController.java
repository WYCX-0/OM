package com.om.controller.admin;

import com.om.pojo.dto.FailAddDTO;
import com.om.pojo.dto.FailPageDTO;
import com.om.pojo.dto.TestPlanAddDTO;
import com.om.pojo.dto.TestPlanPageDTO;
import com.om.pojo.entity.Fail;
import com.om.pojo.entity.TestPlan;
import com.om.pojo.result.PageResult;
import com.om.pojo.result.Result;
import com.om.service.TestPlanService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController("/adminTestPlanController")
@RequestMapping("/admin/testPlan")
public class TestPlanController {

    @Autowired
    private TestPlanService testPlanService;

    /**
     * 添加添加检测计划
     * @param testPlanAddDTO
     * @return
     */
    @PostMapping("/add")
    public Result<String> add(@RequestBody TestPlanAddDTO testPlanAddDTO){
        log.info("添加检测计划: {}", testPlanAddDTO);
        TestPlan testPlan=testPlanService.getByDeviceId(testPlanAddDTO.getDeviceId());
        if(testPlan!=null){
            return Result.error("该设备已有检测计划");
        }
        testPlanService.add(testPlanAddDTO);
        return Result.success();
    }

    /**
     * 更改检测计划状态
     * @param status
     * @param id
     * @return
     */
    @PostMapping("/{status}")
    public Result<String> status(@PathVariable Integer status,@RequestParam long id){
        log.info("更改检测计划状态:{}", id);
        testPlanService.status(status,id);
        return Result.success();
    }

    /**
     * 更改故障
     * @param testPlan
     * @return
     */
    @PostMapping("/update")
    public Result<String> delete(@RequestBody TestPlan testPlan){
        log.info("更改检测计划:{}", testPlan);
        testPlanService.update(testPlan);
        return Result.success();
    }

    /**
     * 分页查询故障
     * @param
     * @return
     */
    @PostMapping("/list")
    public Result<PageResult> list(@RequestBody TestPlanPageDTO testPlanPageDTO){
        log.info("查询检测计划：{}", testPlanPageDTO);
        PageResult pageResult=testPlanService.list(testPlanPageDTO);
        return Result.success(pageResult);
    }
}
