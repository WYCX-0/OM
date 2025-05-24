package com.om.controller.engineer;

import com.om.pojo.entity.Device;
import com.om.pojo.result.Result;
import com.om.service.DeviceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
@Slf4j
@RestController
@RequestMapping("/engineer/device")
public class DeviceController {

    @Autowired
    private DeviceService deviceService;

    @GetMapping("/get")
    public Result<List<Device>> get(){
        log.info("查询设备");
        List<Device> devices = deviceService.get();
        return Result.success(devices);
    }

    @GetMapping("/get4")
    public Result<List<Device>> get4(){
        log.info("查询消防设备");
        List<Device> devices = deviceService.get4();
        return Result.success(devices);
    }

    /**
     *查询设备电子围栏
     * @param id
     * @return
     */
    @GetMapping("/get/{id}")
    public Result<Device> get4ById(@PathVariable Integer id){
        log.info("查询设备电子围栏：{}",id);
        Device device = deviceService.get4ById(id);
        return Result.success(device);
    }
}
