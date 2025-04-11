package com.om.mapper;

import com.om.pojo.entity.Admin;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface AdminMapper {

    /**
     * 根据用户名查询管理员
     * @param username
     * @return
     */
    @Select("select * from admin where username = #{username}")
    Admin getByUsername(String username);
}
