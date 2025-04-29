package com.om.controller.admin;

import com.om.pojo.dto.RTestOrderAddDTO;
import com.om.pojo.dto.RTestOrderPageDTO;

import com.om.pojo.entity.RTestOrder;

import com.om.pojo.result.PageResult;
import com.om.pojo.result.Result;
import com.om.service.RTestOrderService;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;



@Slf4j
@RestController("/adminRTestOrderController")
@RequestMapping("/admin/rtestOrder")
public class RTestOrderController {

    @Autowired
    private RTestOrderService rtestOrderService;

    /**
     * 添加测试订单
     * @param rtestOrderAddDTO
     * @return
     */
    @PostMapping("/add")
    public Result<String> add(@RequestBody RTestOrderAddDTO rtestOrderAddDTO) {
        log.info("添加测试订单: {}", rtestOrderAddDTO);
        rtestOrderService.add(rtestOrderAddDTO);
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
        RTestOrder rtestOrder = rtestOrderService.getById(id);
        if (!rtestOrder.getStatus().equals(1)) {
            return Result.error("该订单正在处理中，无法删除");
        }
        rtestOrderService.delete(rtestOrder);
        return Result.success();
    }

    /**
     * 查询测试订单
     * @param rtestOrderPageDTO
     * @return
     */
    @PostMapping("/list")
    public Result<PageResult> list(@RequestBody RTestOrderPageDTO rtestOrderPageDTO) {
        log.info("查询测试订单: {}", rtestOrderPageDTO);
        PageResult pageResult = rtestOrderService.list(rtestOrderPageDTO);
        return Result.success(pageResult);
    }
}
