package com.om.mapper;

import com.github.pagehelper.Page;
import com.om.pojo.dto.BaoyangOrderPageDTO;
import com.om.pojo.dto.TestOrderPageDTO;
import com.om.pojo.entity.BaoyangOrder;
import com.om.pojo.entity.TestOrder;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.MapKey;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;


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
    @Select("select * from baoyang_order where engineer_id = #{engineerId} order by status asc")
    List<BaoyangOrder> getBaoyangOrder(long engineerId);

    @Select("select * from baoyang_order where status = 2 and engineer_id=#{engineerId}")
    BaoyangOrder getByStatus(long engineerId);

    /**
     * 查询所有工程师的测试订单数量
     * @return
     */
    @Select("SELECT e.id AS engineer_id, COALESCE(f.count, 0) AS fault_count " +
            "FROM engineer e " +
            "LEFT JOIN (SELECT engineer_id, COUNT(*) AS count FROM baoyang_order GROUP BY engineer_id) f " +
            "ON e.id = f.engineer_id " +
            "ORDER BY fault_count DESC")
    List<Map<String, Object>> summary();

    @Select("SELECT COUNT(*) AS bao1 FROM baoyang_order WHERE status = 1 and engineer_id=#{engineerId}")
    Integer getFail1(Long engineerId);

    @Select("SELECT COUNT(*) AS bao3 FROM baoyang_order WHERE status = 3 and engineer_id=#{engineerId}")
    Integer getFail3(Long engineerId);

    @Select("SELECT COUNT(*) AS baot FROM baoyang_order WHERE status !=0 and engineer_id=#{engineerId}")
    Integer getFailCount(Long engineerId);
}

