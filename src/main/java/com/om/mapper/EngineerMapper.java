package com.om.mapper;

import com.github.pagehelper.Page;
import com.om.pojo.dto.EngineerPageDTO;
import com.om.pojo.entity.Engineer;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface EngineerMapper {

    /**
     * 根据工程师工号查询工程师
     * @param engineerNo
     * @return
     */
    @Select("select * from engineer where engineer_no = #{engineerNo}")
    Engineer getByEngineerNo(String engineerNo);

    /**
     * 添加工程师
     * @param engineer
     */
    @Insert("insert into engineer(name, password, phone, engineer_no, create_time,status) values(#{name}, #{password}, #{phone}, #{engineerNo}, #{createTime},#{status})")
    void add(Engineer engineer);


    /**
     * 更新工程师
     * @param engineer
     */
    void update(Engineer engineer);

    /**
     * 查询工程师
     * @param engineerPageDTO
     * @return
     */
    Page<Engineer> list(EngineerPageDTO engineerPageDTO);

    /**
     * 随机获取一个工程师
     * @return
     */
    @Select("select * from engineer where status=1 order by rand() limit 1")
    Engineer getRandom();

    /**
     * 查询所有工程师
     */
    @Select("select * from engineer")
    List<Engineer> get();
}
