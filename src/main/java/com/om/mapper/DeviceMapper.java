package com.om.mapper;

import com.github.pagehelper.Page;
import com.om.pojo.dto.DevicePageDTO;
import com.om.pojo.entity.Device;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface DeviceMapper {

    /**
     * 添加设备
     * @param device
     */@Insert("insert into device(name,address,type,fence_id,create_time,status) values(#{name},#{address},#{type},#{fenceId},#{createTime},#{status})")
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
    Page<Device> list(DevicePageDTO devicePageDTO);

    /**
     * 查询所有设备
     * @return
     */
    @Select("select * from device")
    List<Device> get();

    /**
     * 查询消防设备
     * @return
     */
    @Select("select * from device where type=4")
    List<Device> get4();
}
