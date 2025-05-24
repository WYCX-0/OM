package com.om.controller.user;

import com.om.pojo.dto.FailAddDTO;
import com.om.pojo.result.Result;
import com.om.service.FailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController("/userFailController")
@RequestMapping("/user/fail")
public class FailController {

    @Autowired
    private FailService  failService;

    /**
     * 添加故障
     * @param failAdminDTO
     * @return
     */
    @PostMapping("/add")
    public Result<String> add(@RequestBody FailAddDTO failAdminDTO){
        log.info("添加故障: {}", failAdminDTO);
        failService.add(failAdminDTO);
        return Result.success();
    }
}
