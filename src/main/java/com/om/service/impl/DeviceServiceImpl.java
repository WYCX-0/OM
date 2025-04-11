package com.om.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.om.mapper.DeviceMapper;
import com.om.pojo.dto.DevicePageDTO;
import com.om.pojo.entity.Device;
import com.om.pojo.result.PageResult;
import com.om.service.DeviceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class DeviceServiceImpl implements DeviceService {

    @Autowired
    private DeviceMapper deviceMapper;

    /**
     * 添加设备
     * @param device
     */
    @Override
    public void add(Device device){
        device.setCreateTime(LocalDateTime.now());
        device.setStatus(1);
        deviceMapper.add(device);
    }


    /**
     * 更新设备
     * @param device
     */
    @Override
    public void update(Device device) {
        deviceMapper.update(device);
    }

    /**
     * 分页查询设备
     * @param devicePageDTO
     * @return
     */
    @Override
    public PageResult list(DevicePageDTO devicePageDTO){
        PageHelper.startPage(devicePageDTO.getPage(), devicePageDTO.getPageSize());
        Page<Device> page=deviceMapper.list(devicePageDTO);
        long total = page.getTotal();
        List<Device> records = page.getResult();
        return new PageResult(total, records);
    }

    /**
     * 获取所有设备
     * @return
     */
    @Override
    public List<Device> get() {
        return deviceMapper.get();
    }

    /**
     * 只查询消防设备
     * @return
     */
    @Override
    public List<Device> get4() {
        return deviceMapper.get4();
    }
}
