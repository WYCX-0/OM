package com.om.mapper;

import com.github.pagehelper.Page;
import com.om.pojo.dto.BaoyangOrderPageDTO;
import com.om.pojo.dto.TestOrderPageDTO;
import com.om.pojo.entity.BaoyangOrder;
import com.om.pojo.entity.TestOrder;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;


@Mapper
public interface BaoyangOrderMapper {

    /**
     * 添加测试订单
     * @param baoyangOrder
     */
    @Insert("insert into baoyang_order(device_id,engineer_id,create_time,deal_time,finish_time,delete_time,status,time,finish_url) values(#{deviceId},#{engineerId},#{createTime},#{dealTime},#{finishTime},#{deleteTime},#{status},#{time},#{finishUrl})")
    void add(BaoyangOrder baoyangOrder);

    /**
     * 根据id查询测试订单
     * @param id
     * @return
     */
    @Select("select * from baoyang_order where id = #{id}")
    BaoyangOrder getById(Integer id);

    /**
     * 修改测试订单
     * @param baoyangOrder
     */
    void update(BaoyangOrder baoyangOrder);

    /**
     * 分页查询测试订单
     * @param baoyangOrderPageDTO
     * @return
     */
    Page<BaoyangOrder> list(BaoyangOrderPageDTO baoyangOrderPageDTO);

    /**
     * 根据工程师id查询测试订单
     * @param engineerId
     * @return
     */
    @Select("select * from baoyang_order where engineer_id = #{engineerId}")
    List<BaoyangOrder> getBaoyangOrder(long engineerId);

    @Select("select * from baoyang_order where status = 2 and engineer_id=#{engineerId}")
    BaoyangOrder getByStatus(long engineerId);
}

