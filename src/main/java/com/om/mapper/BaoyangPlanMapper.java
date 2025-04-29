package com.om.mapper;

import com.github.pagehelper.Page;
import com.om.pojo.dto.BaoyangPlanPageDTO;

import com.om.pojo.entity.BaoyangPlan;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;



@Mapper
public interface BaoyangPlanMapper {

    /**
     * 添加测试计划
     * @param baoyangPlan
     */
    @Insert("insert into baoyang_plan(device_id,  create_time,frequency, time, status) values(#{deviceId},  #{createTime}, #{frequency}, #{time}, #{status})")
    void add(BaoyangPlan baoyangPlan);


    /**
     * 更新测试计划
     * @param baoyangPlan
     */
    void update(BaoyangPlan baoyangPlan);

    /**
     * 查询测试计划
     * @param baoyangPlanPageDTO
     * @return
     */
    Page<BaoyangPlan> list(BaoyangPlanPageDTO baoyangPlanPageDTO);

    /**
     * 根据设备id查询测试计划
     * @param deviceId
     * @return
     */
    @Select("select * from baoyang_plan where device_id = #{deviceId}")
    BaoyangPlan getByDeviceId(long deviceId);

    /**
     * 查询所有计划
     * @param now
     * @return
     */
    List<BaoyangPlan> findPlansToNext(LocalDateTime now);

    /**
     * 根据id查询测试计划
     * @param id
     * @return
     */
    @Select("select * from baoyang_plan where id = #{id}")
    BaoyangPlan getById(long id);
}

