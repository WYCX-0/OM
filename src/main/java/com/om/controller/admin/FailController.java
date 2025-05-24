package com.om.controller.admin;

import com.om.pojo.dto.FailAddDTO;
import com.om.pojo.dto.FailPageDTO;
import com.om.pojo.entity.Fail;
import com.om.pojo.result.PageResult;
import com.om.pojo.result.Result;
import com.om.service.FailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController("/adminFailController")
@RequestMapping("/admin/fail")
public class FailController {

    @Autowired
    private FailService failService;

//    /**
//     * 添加故障
//     * @param failAdminDTO
//     * @return
//     */
//    @PostMapping("/add")
//    public Result<String> add(@RequestBody FailAddDTO failAdminDTO){
//        log.info("添加故障: {}", failAdminDTO);
//        failService.add(failAdminDTO);
//        return Result.success();
//    }


    /**
     * 删除故障
     * @param id
     * @return
     */
    @PostMapping("/delete/{id}")
    public Result<String> delete(@PathVariable Integer id){
        log.info("删除故障: {}", id);
        Fail fail=failService.getById(id);
        if (!fail.getStatus().equals(1)){
            return Result.error("该故障处理中，无法删除");
        }
        failService.delete(fail);
        return Result.success();
    }

    /**
     * 分页查询故障
     * @param failPageDTO
     * @return
     */
    @PostMapping("/list")
    public Result<PageResult> list(@RequestBody FailPageDTO failPageDTO){
        log.info("查询故障: {}", failPageDTO);
        PageResult pageResult=failService.list(failPageDTO);
        return Result.success(pageResult);
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

}
