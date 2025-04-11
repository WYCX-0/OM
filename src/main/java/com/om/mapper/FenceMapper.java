package com.om.mapper;

import com.om.pojo.entity.Fence;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface FenceMapper {

    /**
     * 添加围栏
     * @param fence
     */
    @Insert("insert into fence(center_lat,center_lng,radius) values(#{centerLat},#{centerLng},#{radius})")
    void add(Fence fence);

    /**
     * 根据围栏信息查询围栏
     * @param fence
     * @return
     */
    @Select("select * from fence where center_lat=#{centerLat} and center_lng=#{centerLng} and radius=#{radius}")
    Fence getByFence(Fence fence);
}
