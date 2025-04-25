package com.om.controller.engineer;

import com.om.pojo.entity.Spare;
import com.om.pojo.result.Result;
import com.om.service.SpareService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/engineer/spare")
public class SpareController {

    @Autowired
    private SpareService spareService;

    /**
     * 添加备件
     * @param spare
     * @return
     */
    @PostMapping("/add")
    public Result<String> add(@RequestBody Spare spare){
        log.info("添加备件: {}", spare);
        spareService.add(spare);
        return Result.success();
    }
}
