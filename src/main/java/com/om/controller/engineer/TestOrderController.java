package com.om.controller.engineer;

import com.om.context.BaseContext;
import com.om.pojo.entity.BaoyangOrder;
import com.om.pojo.entity.Fail;
import com.om.pojo.entity.RTestOrder;
import com.om.pojo.entity.TestOrder;
import com.om.pojo.result.Result;
import com.om.service.BaoyangOrderService;
import com.om.service.FailService;
import com.om.service.RTestOrderService;
import com.om.service.TestOrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/engineer/testOrder")
public class TestOrderController {

    @Autowired
    private TestOrderService testOrderService;
    @Autowired
    private FailService failService;
    @Autowired
    private RTestOrderService rtestOrderService;
    @Autowired
    private BaoyangOrderService baoyangOrderService;
    /**
     * 获取所有测试订单
     * @return
     */
    @GetMapping("/getTestOrder")
    public Result<List<TestOrder>> getTestOrder() {
        log.info("获取所有测试订单");
        return Result.success(testOrderService.getTestOrder());
    }

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
     * 处理测试订单
     * @return
     */
    @PostMapping("/deal/{id}")
    public Result<String> deal(@PathVariable Integer id) {
        log.info("查询是否有处理中的工单");

        Fail fail=failService.getByStatus(BaseContext.getCurrentId());
        TestOrder testOrder=testOrderService.getByStatus(BaseContext.getCurrentId());
        RTestOrder rtestOrder=rtestOrderService.getByStatus(BaseContext.getCurrentId());
        BaoyangOrder baoyangOrder=baoyangOrderService.getByStatus(BaseContext.getCurrentId());

        if (fail!=null || testOrder!=null||rtestOrder!=null||baoyangOrder!=null){
            return Result.error("该工程师有正在处理中的故障");
        }
        log.info("处理测试订单: {}", id);
        testOrderService.deal(id);
        return Result.success();
    }

    /**
     * 完成测试订单
     * @return
     */
    @PostMapping("/finish/{id}")
    public Result<String> finish(@PathVariable Integer id,@RequestParam String finishUrl,@RequestParam Integer current) {
        log.info("完成测试订单: {}", id);
        testOrderService.finish(id,finishUrl,current);
        return Result.success();
    }
}
