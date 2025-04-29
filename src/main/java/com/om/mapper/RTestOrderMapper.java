package com.om.mapper;

import com.github.pagehelper.Page;
import com.om.pojo.dto.RTestOrderPageDTO;

import com.om.pojo.entity.RTestOrder;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;





@Mapper
public interface RTestOrderMapper {

    /**
     * 添加测试订单
     * @param rtestOrder
     */
    @Insert("insert into rtest_order(device_id,engineer_id,create_time,deal_time,finish_time,delete_time,status,time,finish_url) values(#{deviceId},#{engineerId},#{createTime},#{dealTime},#{finishTime},#{deleteTime},#{status},#{time},#{finishUrl})")
    void add(RTestOrder rtestOrder);

    /**
     * 根据id查询测试订单
     * @param id
     * @return
     */
    @Select("select * from rtest_order where id = #{id}")
    RTestOrder getById(Integer id);

    /**
     * 修改测试订单
     * @param rtestOrder
     */
    void update(RTestOrder rtestOrder);

    /**
     * 分页查询测试订单
     * @param rtestOrderPageDTO
     * @return
     */
    Page<RTestOrder> list(RTestOrderPageDTO rtestOrderPageDTO);

    /**
     * 根据工程师id查询测试订单
     * @param engineerId
     * @return
     */
    @Select("select * from rtest_order where engineer_id = #{engineerId}")
    List<RTestOrder> getRTestOrder(long engineerId);

    @Select("select * from rtest_order where status = 2 and engineer_id=#{engineerId}")
    RTestOrder getByStatus(long engineerId);
}
