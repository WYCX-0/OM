package com.om.controller.admin;

import com.om.pojo.entity.Fence;
import com.om.pojo.result.Result;
import com.om.service.FenceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/admin/fence")
public class FenceController {

    @Autowired
    private FenceService fenceService;

    /**
     * 新增
     * @param fence
     * @return
     */
    @PostMapping("/add")
    public Result<String> add(Fence fence) {
        String result =fenceService.add(fence);
        return Result.success(result);
    }
}
