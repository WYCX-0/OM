package com.om.controller.admin;

import com.om.pojo.dto.DevicePageDTO;
import com.om.pojo.entity.Device;
import com.om.pojo.result.PageResult;
import com.om.pojo.result.Result;
import com.om.service.DeviceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@RestController("/adminDeviceController")
@RequestMapping("/admin/device")
public class DeviceController {

    @Autowired
    private DeviceService deviceService;


    /**
     * 添加设备
     * @param device
     * @return
     */
    @PostMapping("/add")
    public Result<String> add(@RequestBody Device device){
        log.info("添加设备: {}", device);
        Device device1=deviceService.getByName(device.getName());
        if(device1!=null){
            return Result.error("设备名已存在");
        }
        deviceService.add(device);
        return Result.success();
    }

    /**
     * 删除设备
     * @param id
     * @return
     */
    @DeleteMapping("/delete/{id}")
    public Result<String> delete(@PathVariable Integer id){
        log.info("删除设备: {}", id);
        Device device=new Device();
        device.setId(id);
        device.setStatus(0);
        device.setDeleteTime(LocalDateTime.now());
        deviceService.update(device);
        return Result.success();
    }

    /**
     * 更新设备
     * @param device
     * @return
     */
    @PostMapping("/update")
    public Result<String> update(@RequestBody Device device){
        log.info("更新设备: {}", device);
        deviceService.update(device);
        return Result.success();
    }

    /**
     * 查询设备分页
     * @param devicePageDTO
     * @return
     */
    @PostMapping("/list")
    public Result<PageResult> list(@RequestBody DevicePageDTO devicePageDTO){
        log.info("分页查询设备: {}", devicePageDTO);
        PageResult pageResult = deviceService.list(devicePageDTO);
        return Result.success(pageResult);
    }

    /**
     * 只查询未删除的设备
     * @return
     */
    @GetMapping("/zai")
    public Result<List<Device>> zai(){
        log.info("查询设备");
        List<Device> devices = deviceService.zai();
        return Result.success(devices);
    }

    /**
     * 查询设备
     * @return
     */
    @GetMapping("/get")
    public Result<List<Device>> get(){
        log.info("查询设备");
        List<Device> devices = deviceService.get();
        return Result.success(devices);
    }

    /**
     * 只查询消防设备
     * @return
     */
    @GetMapping("/get4")
    public Result<List<Device>> get4(){
        log.info("查询设备");
        List<Device> devices = deviceService.get4();
        return Result.success(devices);
    }

    /**
     *查询设备电子围栏
     * @param id
     * @return
     */
    @GetMapping("/get4/{id}")
    public Result<Device> get4ById(@PathVariable Integer id){
        log.info("查询设备电子围栏：{}",id);
        Device device = deviceService.get4ById(id);
        return Result.success(device);
    }


}
