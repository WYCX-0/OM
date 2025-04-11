package com.om.mapper;

import com.github.pagehelper.Page;
import com.om.pojo.dto.FailPageDTO;
import com.om.pojo.entity.Fail;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

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
    @Select("select * from fail where engineer_id = #{engineerId}")
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
}
