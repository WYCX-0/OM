package com.om.service;

import com.om.pojo.dto.DevicePageDTO;
import com.om.pojo.entity.Device;
import com.om.pojo.result.PageResult;

import java.util.List;

public interface DeviceService {

    /**
     * 添加设备
     * @param device
     */
    void add(Device device);


    /**
     * 更新设备
     * @param device
     */
    void update(Device device);

    /**
     * 分页查询设备
     * @param devicePageDTO
     * @return
     */
    PageResult list(DevicePageDTO devicePageDTO);

    /**
     * 查询所有设备
     * @return
     */
    List<Device> get();

    /**
     * 只查询消防设备
     * @return
     */
    List<Device> get4();
}
