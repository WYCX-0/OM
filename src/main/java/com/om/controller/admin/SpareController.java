package com.om.controller.admin;

import com.om.pojo.dto.SparePageDTO;
import com.om.pojo.result.PageResult;
import com.om.pojo.result.Result;
import com.om.service.SpareService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController("/adminSpareController")
@RequestMapping("/admin/spare")
public class SpareController {

    @Autowired
    private SpareService spareService;

    /**
     * 分页查询
     * @param sparePageDTO
     * @return
     */
    @PostMapping("/list")
    public Result<PageResult> list(@RequestBody SparePageDTO sparePageDTO) {
        log.info("分页查询备件: {}", sparePageDTO);
        return Result.success(spareService.list(sparePageDTO));
    }
}
