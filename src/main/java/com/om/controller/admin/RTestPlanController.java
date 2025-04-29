package com.om.controller.admin;

import com.om.pojo.dto.RTestPlanAddDTO;
import com.om.pojo.dto.RTestPlanPageDTO;

import com.om.pojo.entity.RTestPlan;

import com.om.pojo.result.PageResult;
import com.om.pojo.result.Result;
import com.om.service.RTestPlanService;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;



@Slf4j
@RestController("/adminRTestPlanController")
@RequestMapping("/admin/rtestPlan")
public class RTestPlanController {

    @Autowired
    private RTestPlanService rtestPlanService;

    /**
     * 添加添加检测计划
     * @param rtestPlanAddDTO
     * @return
     */
    @PostMapping("/add")
    public Result<String> add(@RequestBody RTestPlanAddDTO rtestPlanAddDTO){
        log.info("添加检测计划: {}", rtestPlanAddDTO);
        RTestPlan rtestPlan=rtestPlanService.getByDeviceId(rtestPlanAddDTO.getDeviceId());
        if(rtestPlan!=null){
            return Result.error("该设备已有检测计划");
        }
        rtestPlanService.add(rtestPlanAddDTO);
        return Result.success();
    }

    /**
     * 更改检测计划状态
     * @param status
     * @param id
     * @return
     */
    @PostMapping("/{status}")
    public Result<String> status(@PathVariable Integer status, @RequestParam long id){
        log.info("更改检测计划状态:{}", id);
        rtestPlanService.status(status,id);
        return Result.success();
    }

    /**
     * 更改故障
     * @param rtestPlan
     * @return
     */
    @PostMapping("/update")
    public Result<String> delete(@RequestBody RTestPlan rtestPlan){
        log.info("更改检测计划:{}", rtestPlan);
        rtestPlanService.update(rtestPlan);
        return Result.success();
    }

    /**
     * 分页查询故障
     * @param
     * @return
     */
    @PostMapping("/list")
    public Result<PageResult> list(@RequestBody RTestPlanPageDTO rtestPlanPageDTO){
        log.info("查询检测计划：{}", rtestPlanPageDTO);
        PageResult pageResult=rtestPlanService.list(rtestPlanPageDTO);
        return Result.success(pageResult);
    }
}
