package com.om.mapper;

import com.github.pagehelper.Page;
import com.om.pojo.dto.TestPlanPageDTO;
import com.om.pojo.entity.TestPlan;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface TestPlanMapper {

    /**
     * 添加测试计划
     * @param testPlan
     */
    @Insert("insert into test_plan(device_id,  create_time,frequency, time, status) values(#{deviceId},  #{createTime}, #{frequency}, #{time}, #{status})")
    void add(TestPlan testPlan);


    /**
     * 更新测试计划
     * @param testPlan
     */
    void update(TestPlan testPlan);

    /**
     * 查询测试计划
     * @param testPlanPageDTO
     * @return
     */
    Page<TestPlan> list(TestPlanPageDTO testPlanPageDTO);

    /**
     * 根据设备id查询测试计划
     * @param deviceId
     * @return
     */
    @Select("select * from test_plan where device_id = #{deviceId}")
    TestPlan getByDeviceId(long deviceId);

    /**
     * 查询所有计划
     * @param now
     * @return
     */
    List<TestPlan> findPlansToNext(LocalDateTime now);

    /**
     * 根据id查询测试计划
     * @param id
     * @return
     */
    @Select("select * from test_plan where id = #{id}")
    TestPlan getById(long id);
}
