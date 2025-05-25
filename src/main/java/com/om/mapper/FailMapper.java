package com.om.mapper;

import com.github.pagehelper.Page;
import com.om.pojo.dto.FailPageDTO;
import com.om.pojo.entity.Fail;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.MapKey;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

@Mapper
public interface FailMapper {

    /**
     * 添加故障信息
     * @param fail
     */
    @Insert("insert into fail(detail, device_id, engineer_id, before_url, create_time, status) values(#{detail}, #{deviceId}, #{engineerId}, #{beforeUrl}, #{createTime}, #{status})")
    void add(Fail fail);

    /**
     * 根据id获取故障信息
     * @param id
     * @return
     */
    @Select("select * from fail where id = #{id}")
    Fail getById(Integer id);

    /**
     * 更新故障信息
     * @param fail
     */
    void update(Fail fail);

    /**
     * 获取故障信息列表
     * @param failPageDTO
     * @return
     */
    Page<Fail> list(FailPageDTO failPageDTO);

    /**
     * 获取故障信息列表
     * @param engineerId
     * @return
     */
    @Select("select * from fail where engineer_id = #{engineerId} and status!=0 order by status asc")
    List<Fail> getFail(long engineerId);

    /**
     * 根据beforeUrl获取故障信息
     * @param beforeUrl
     * @return
     */
    @Select("select * from fail where before_url = #{beforeUrl}")
    Fail getByBeforeUrl(String beforeUrl);

    /**
     * 根据status获取故障信息
     * @param fail
     * @return
     */
    @Select("select * from fail where status =#{status} and engineer_id=#{engineerId} ")
    Fail getByStatus(Fail fail);

    /**
     * 获取故障信息列表
     * @return
     */
    @Select("SELECT d.id AS device_id, COALESCE(f.count, 0) AS fault_count " +
            "FROM device d " +
            "LEFT JOIN (SELECT device_id, COUNT(*) AS count FROM fail GROUP BY device_id) f " +
            "ON d.id = f.device_id " +
            "ORDER BY fault_count DESC")
    List<Map<String, Object>> collect();

    /**
     * 统计每个工程师的故障数量
     * @return
     */
    @Select("SELECT e.id AS engineer_id, COALESCE(f.count, 0) AS fault_count " +
            "FROM engineer e " +
            "LEFT JOIN (SELECT engineer_id, COUNT(*) AS count FROM fail GROUP BY engineer_id) f " +
            "ON e.id = f.engineer_id " +
            "ORDER BY fault_count DESC")
    List<Map<String, Object>> summary();

    @Select("SELECT COUNT(*) AS fail1 FROM fail WHERE status = 1 and engineer_id=#{engineerId}")
    Integer getFail1(Long engineerId);

    @Select("SELECT COUNT(*) AS fail3 FROM fail WHERE status = 3 and engineer_id=#{engineerId}")
    Integer getFail3(Long engineerId);

    @Select("SELECT COUNT(*) AS failt FROM fail WHERE status !=0 and engineer_id=#{engineerId}")
    Integer getFailCount(Long engineerId);

}
