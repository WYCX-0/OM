package com.om.controller.admin;

import com.om.pojo.dto.BaoyangPlanAddDTO;
import com.om.pojo.dto.BaoyangPlanPageDTO;

import com.om.pojo.entity.BaoyangPlan;

import com.om.pojo.result.PageResult;
import com.om.pojo.result.Result;
import com.om.service.BaoyangPlanService;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;



@Slf4j
@RestController("/adminBaoyangPlanController")
@RequestMapping("/admin/baoyangPlan")
public class BaoyangPlanController {

    @Autowired
    private BaoyangPlanService baoyangPlanService;

    /**
     * 添加添加检测计划
     * @param baoyangPlanAddDTO
     * @return
     */
    @PostMapping("/add")
    public Result<String> add(@RequestBody BaoyangPlanAddDTO baoyangPlanAddDTO){
        log.info("添加检测计划: {}", baoyangPlanAddDTO);
        BaoyangPlan baoyangPlan=baoyangPlanService.getByDeviceId(baoyangPlanAddDTO.getDeviceId());
        if(baoyangPlan!=null){
            return Result.error("该设备已有检测计划");
        }
        baoyangPlanService.add(baoyangPlanAddDTO);
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
        baoyangPlanService.status(status,id);
        return Result.success();
    }

    /**
     * 更改故障
     * @param baoyangPlan
     * @return
     */
    @PostMapping("/update")
    public Result<String> delete(@RequestBody BaoyangPlan baoyangPlan){
        log.info("更改检测计划:{}", baoyangPlan);
        baoyangPlanService.update(baoyangPlan);
        return Result.success();
    }

    /**
     * 分页查询故障
     * @param
     * @return
     */
    @PostMapping("/list")
    public Result<PageResult> list(@RequestBody BaoyangPlanPageDTO baoyangPlanPageDTO){
        log.info("查询检测计划：{}", baoyangPlanPageDTO);
        PageResult pageResult=baoyangPlanService.list(baoyangPlanPageDTO);
        return Result.success(pageResult);
    }
}
