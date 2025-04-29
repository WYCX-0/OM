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
@RequestMapping("/engineer/rtestOrder")
public class RTestOrderController {

    @Autowired
    private TestOrderService testOrderService;
    @Autowired
    private FailService failService;
    @Autowired
    private RTestOrderService rtestOrderService;
    @Autowired
    private BaoyangOrderService baoyangOrderService;
    /**
     * 获取所有巡检订单
     * @return
     */
    @GetMapping("/getRTestOrder")
    public Result<List<RTestOrder>> getRTestOrder() {
        log.info("获取所有巡检订单");
        return Result.success(rtestOrderService.getRTestOrder());
    }

    /**
     * 获取巡检订单
     * @return
     */
    @GetMapping("/getById/{id}")
    public Result<RTestOrder> getById(@PathVariable Integer id) {
        log.info("获取巡检订单");
        return Result.success(rtestOrderService.getById(id));
    }

    /**
     * 处理巡检订单
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
        rtestOrderService.deal(id);
        return Result.success();
    }

    /**
     * 完成测试订单
     * @return
     */
    @PostMapping("/finish/{id}")
    public Result<String> finish(@PathVariable Integer id,@RequestParam String finishUrl,@RequestParam Integer current) {
        log.info("完成测试订单: {}", id);
        rtestOrderService.finish(id,finishUrl,current);
        return Result.success();
    }
}
