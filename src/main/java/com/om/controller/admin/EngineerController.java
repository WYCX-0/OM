package com.om.controller.admin;

import com.om.pojo.dto.EngineerPageDTO;
import com.om.pojo.entity.Engineer;
import com.om.pojo.result.PageResult;
import com.om.pojo.result.Result;
import com.om.pojo.vo.EngineerGetVO;
import com.om.service.EngineerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@RestController("/adminEngineerController")
@RequestMapping("/admin/engineer")
public class EngineerController {

    @Autowired
    private EngineerService engineerService;

    /**
     * 添加工程师
     * @param engineer
     * @return
     */
    @PostMapping("/add")
    public Result<String> add(@RequestBody Engineer engineer) {
        log.info("添加工程师: {}", engineer);
        engineerService.add(engineer);
        return Result.success();
    }

    /**
     * 删除工程师
     * @param id
     * @return
     */
    @DeleteMapping("/delete/{id}")
    public Result<String> delete(@PathVariable Integer id) {
        log.info("删除工程师: {}", id);
        Engineer engineer=new Engineer();
        engineer.setId(id);
        engineer.setStatus(0);
        engineer.setDeleteTime(LocalDateTime.now());
        engineerService.update(engineer);
        return Result.success();
    }

    /**
     * 更新工程师
     * @param engineer
     * @return
     */
    @PostMapping("/update")
    public Result<String> update(@RequestBody Engineer engineer) {
        log.info("更新工程师: {}", engineer);
        engineerService.update(engineer);
        return Result.success();
    }

    /**
     * 分页查询工程师
     * @param engineerPageDTO
     * @return
     */
    @PostMapping("/list")
    public Result<PageResult> list(@RequestBody EngineerPageDTO engineerPageDTO){
        log.info("查询工程师: {}", engineerPageDTO);
        PageResult pageResult = engineerService.list(engineerPageDTO);
        return Result.success(pageResult);
    }

    /**
     * 查询所有工程师
     * @return
     */
    @GetMapping("/get")
    public Result<List<EngineerGetVO>> get(){
        log.info("查询所有工程师");
        return Result.success(engineerService.get());
    }
}
