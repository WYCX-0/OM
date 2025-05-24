package com.om.controller.admin;

import com.om.pojo.result.Result;
import com.om.pojo.vo.SummaryVO;
import com.om.service.CollectService;
import com.om.service.FailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/admin/tong")
public class CollectController {

    @Autowired
    private FailService failService;
    @Autowired
    private CollectService collectService;

    /**
     * 统计每个设备的故障数
     * @return
     */
    @GetMapping("/collect")
    public Result<Map<Long, Integer>> collect() {
        log.info("统计每个设备的故障数");
        return Result.success(failService.collect());
    }

    /**
     * 统计每个工程师的故障数
     * @return
     */
    @GetMapping("/summary")
    public Result<List<SummaryVO>> Summary() {
        return Result.success(collectService.Summary());
    }

}
