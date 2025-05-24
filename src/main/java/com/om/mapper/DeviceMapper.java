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
     */@Insert("insert into device(name,address,type,create_time,status,radius,center_lat,center_lng) values(#{name},#{address},#{type},#{createTime},#{status},#{radius},#{centerLat},#{centerLng})")
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

    /**
     * 根据设备名称查询设备
     * @param name
     * @return
     */
    @Select("select * from device where name=#{name}")
    Device getByName(String name);

    /**
     * 根据设备id查询设备
     * @param id
     * @return
     */
    @Select("select * from device where id=#{id}")
    Device get4ById(Integer id);

    /**
     * 查询在用的设备
     * @return
     */
    @Select("select * from device where status=1")
    List<Device> zai();
}
