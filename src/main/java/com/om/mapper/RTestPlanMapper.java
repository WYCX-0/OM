package com.om.mapper;

import com.github.pagehelper.Page;
import com.om.pojo.dto.RTestPlanPageDTO;

import com.om.pojo.entity.RTestPlan;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;



@Mapper
public interface RTestPlanMapper {

    /**
     * 添加测试计划
     * @param rtestPlan
     */
    @Insert("insert into rtest_plan(device_id,  create_time,frequency, time, status) values(#{deviceId},  #{createTime}, #{frequency}, #{time}, #{status})")
    void add(RTestPlan rtestPlan);


    /**
     * 更新测试计划
     * @param rtestPlan
     */
    void update(RTestPlan rtestPlan);

    /**
     * 查询测试计划
     * @param rtestPlanPageDTO
     * @return
     */
    Page<RTestPlan> list(RTestPlanPageDTO rtestPlanPageDTO);

    /**
     * 根据设备id查询测试计划
     * @param deviceId
     * @return
     */
    @Select("select * from rtest_plan where device_id = #{deviceId}")
    RTestPlan getByDeviceId(long deviceId);

    /**
     * 查询所有计划
     * @param now
     * @return
     */
    List<RTestPlan> findPlansToNext(LocalDateTime now);

    /**
     * 根据id查询测试计划
     * @param id
     * @return
     */
    @Select("select * from rtest_plan where id = #{id}")
    RTestPlan getById(long id);
}
