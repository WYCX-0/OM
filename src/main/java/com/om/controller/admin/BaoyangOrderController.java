package com.om.controller.admin;

import com.om.pojo.dto.BaoyangOrderAddDTO;
import com.om.pojo.dto.BaoyangOrderPageDTO;

import com.om.pojo.entity.BaoyangOrder;

import com.om.pojo.result.PageResult;
import com.om.pojo.result.Result;
import com.om.service.BaoyangOrderService;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;






@Slf4j
@RestController("/adminBaoyangOrderController")
@RequestMapping("/admin/baoyangOrder")
public class BaoyangOrderController {

    @Autowired
    private BaoyangOrderService baoyangOrderService;

    /**
     * 获取测试订单
     * @return
     */
    @GetMapping("/getById/{id}")
    public Result<BaoyangOrder> getById(@PathVariable Integer id) {
        log.info("获取测试订单");
        return Result.success( baoyangOrderService.getById(id));
    }

    /**
     * 添加测试订单
     * @param baoyangOrderAddDTO
     * @return
     */
    @PostMapping("/add")
    public Result<String> add(@RequestBody BaoyangOrderAddDTO baoyangOrderAddDTO) {
        log.info("添加测试订单: {}", baoyangOrderAddDTO);
        baoyangOrderService.add(baoyangOrderAddDTO);
        return Result.success();
    }

    /**
     * 删除测试订单
     * @param id
     * @return
     */
    @PostMapping("/delete/{id}")
    public Result<String> delete(@PathVariable Integer id) {
        log.info("删除测试订单: {}", id);
        BaoyangOrder baoyangOrder = baoyangOrderService.getById(id);
        if (!baoyangOrder.getStatus().equals(1)) {
            return Result.error("该订单正在处理中，无法删除");
        }
        baoyangOrderService.delete(baoyangOrder);
        return Result.success();
    }

    /**
     * 查询测试订单
     * @param baoyangOrderPageDTO
     * @return
     */
    @PostMapping("/list")
    public Result<PageResult> list(@RequestBody BaoyangOrderPageDTO baoyangOrderPageDTO) {
        log.info("查询测试订单: {}", baoyangOrderPageDTO);
        PageResult pageResult = baoyangOrderService.list(baoyangOrderPageDTO);
        return Result.success(pageResult);
    }
}

