package com.om.controller.admin;

import com.om.pojo.dto.TestOrderAddDTO;
import com.om.pojo.dto.TestOrderPageDTO;
import com.om.pojo.entity.TestOrder;
import com.om.pojo.result.PageResult;
import com.om.pojo.result.Result;
import com.om.service.TestOrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController("/adminTestOrderController")
@RequestMapping("/admin/testOrder")
public class TestOrderController {

    @Autowired
    private TestOrderService testOrderService;

    /**
     * 获取测试订单
     * @return
     */
    @GetMapping("/getById/{id}")
    public Result<TestOrder> getById(@PathVariable Integer id) {
        log.info("获取测试订单");
        return Result.success(testOrderService.getById(id));
    }

    /**
     * 添加测试订单
     * @param testOrderAddDTO
     * @return
     */
    @PostMapping("/add")
    public Result<String> add(@RequestBody TestOrderAddDTO testOrderAddDTO) {
        log.info("添加测试订单: {}", testOrderAddDTO);
        testOrderService.add(testOrderAddDTO);
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
        TestOrder testOrder = testOrderService.getById(id);
        if (!testOrder.getStatus().equals(1)) {
            return Result.error("该订单正在处理中，无法删除");
        }
        testOrderService.delete(testOrder);
        return Result.success();
    }

    /**
     * 查询测试订单
     * @param testOrderPageDTO
     * @return
     */
    @PostMapping("/list")
    public Result<PageResult> list(@RequestBody TestOrderPageDTO testOrderPageDTO) {
        log.info("查询测试订单: {}", testOrderPageDTO);
        PageResult pageResult = testOrderService.list(testOrderPageDTO);
        return Result.success(pageResult);
    }
}
