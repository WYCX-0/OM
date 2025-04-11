package com.om.mapper;

import com.github.pagehelper.Page;
import com.om.pojo.dto.TestOrderPageDTO;
import com.om.pojo.entity.TestOrder;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface TestOrderMapper {

    /**
     * 添加测试订单
     * @param testOrder
     */
    @Insert("insert into test_order(device_id,engineer_id,create_time,deal_time,finish_time,delete_time,status,time,finish_url) values(#{deviceId},#{engineerId},#{createTime},#{dealTime},#{finishTime},#{deleteTime},#{status},#{time},#{finishUrl})")
    void add(TestOrder testOrder);

    /**
     * 根据id查询测试订单
     * @param id
     * @return
     */
    @Select("select * from test_order where id = #{id}")
    TestOrder getById(Integer id);

    /**
     * 修改测试订单
     * @param testOrder
     */
    void update(TestOrder testOrder);

    /**
     * 分页查询测试订单
     * @param testOrderPageDTO
     * @return
     */
    Page<TestOrder> list(TestOrderPageDTO testOrderPageDTO);

    /**
     * 根据工程师id查询测试订单
     * @param engineerId
     * @return
     */
    @Select("select * from test_order where engineer_id = #{engineerId}")
    List<TestOrder> getTestOrder(long engineerId);

    @Select("select * from test_order where status = 2 and engineer_id=#{engineerId}")
    TestOrder getByStatus(long engineerId);
}
