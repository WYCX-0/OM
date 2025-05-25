package com.om.controller.engineer;

import com.om.pojo.entity.Engineer;
import com.om.pojo.result.Result;
import com.om.pojo.vo.RandomVO;
import com.om.service.EngineerService;
import com.om.service.MyService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Random;

@Slf4j
@RestController
@RequestMapping("/engineer/my")
public class MyController {

    @Autowired
    private EngineerService engineerService;
    @Autowired
    private MyService myService;

    /**
     * 获取工程师信息
     * @param id
     * @return
     */
    @GetMapping("/info/{id}")
    public Result<Engineer> info(@PathVariable Long id){
        log.info("获取工程师信息: {}", id);
        return Result.success(engineerService.info(id));
    }


    @GetMapping("/random/{id}")
    public Result<RandomVO> random(@PathVariable Long id){
        log.info("获取工程师信息: {}", id);
        return Result.success(myService.getRandom(id));
    }

}
