package com.om.controller.user;

import com.om.pojo.entity.Device;
import com.om.pojo.result.Result;
import com.om.service.DeviceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
@Slf4j
@RestController("/userDeviceController")
@RequestMapping("/user/device")
public class DeviceController {

    @Autowired
    private DeviceService deviceService;

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
}
