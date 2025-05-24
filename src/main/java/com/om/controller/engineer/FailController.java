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
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/engineer/fail")
public class FailController {

    @Autowired
    private FailService failService;
    @Autowired
    private TestOrderService testOrderService;
    @Autowired
    private RTestOrderService rtestOrderService;
    @Autowired
    private BaoyangOrderService baoyangOrderService;

    @PostMapping("/test")
    public Result test() {
        log.info("检查是否有正在处理中的工单");
        Fail fail = failService.getByStatus(BaseContext.getCurrentId());
        TestOrder testOrder = testOrderService.getByStatus(BaseContext.getCurrentId());
        RTestOrder rtestOrder = rtestOrderService.getByStatus(BaseContext.getCurrentId());
        BaoyangOrder baoyangOrder = baoyangOrderService.getByStatus(BaseContext.getCurrentId());

        if (fail != null) {
            // 返回一个包含工单类型和工单 ID 的对象
            return Result.success(Map.of("type", "repair", "id", fail.getId()));
        } else if (testOrder != null) {
            return Result.success(Map.of("type", "test", "id", testOrder.getId()));
        } else if (rtestOrder != null) {
            return Result.success(Map.of("type", "inspection", "id", rtestOrder.getId()));
        } else if (baoyangOrder != null) {
            return Result.success(Map.of("type", "maintenance", "id", baoyangOrder.getId()));
        }
        return Result.success();
    }





    /**
     * 获取该工程师故障列表
     * @return
     */
    @GetMapping("/getFail")
    public Result<List<Fail>> getFail(){
        log.info("获取该工程师故障列表");
        return Result.success(failService.getFail());
    }

    /**
     * 获取故障
     * @param id
     * @return
     */
    @GetMapping("/getById/{id}")
    public Result<Fail> getById(@PathVariable Integer id){
        log.info("获取故障: {}", id);
        return Result.success(failService.getById(id));
    }

    /**
     * 处理故障
     * @param id
     * @return
     */
    @PostMapping("/deal/{id}")
    public Result<String> deal(@PathVariable Integer id){
        log.info("查询该工程师是否由正在处理中的故障");
        Fail fail=failService.getByStatus(BaseContext.getCurrentId());
        TestOrder testOrder=testOrderService.getByStatus(BaseContext.getCurrentId());
        RTestOrder rtestOrder=rtestOrderService.getByStatus(BaseContext.getCurrentId());
        BaoyangOrder baoyangOrder=baoyangOrderService.getByStatus(BaseContext.getCurrentId());

        if (fail!=null || testOrder!=null||rtestOrder!=null||baoyangOrder!=null){
            return Result.error("该工程师有正在处理中的故障");
        }

        log.info("处理故障: {}", id);
        failService.deal(id);
        return Result.success();
    }

    /**
     * 完成故障
     * @param finishUrl
     * @return
     */
    @PostMapping("/finish/{id}")
    public Result<String> finish(@PathVariable Integer id,@RequestParam String finishUrl){
        log.info("完成故障: {}", id);
        failService.finish(id,finishUrl);
        return Result.success();
    }


}
