package com.om.mapper;

import com.github.pagehelper.Page;
import com.om.pojo.dto.SparePageDTO;
import com.om.pojo.entity.Spare;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SpareMapper {

    /**
     * 添加备件
     * @param spare
     */
    @Insert("insert into spare(engineer_id, detail, create_time, fail_id) values(#{engineerId}, #{detail}, #{createTime}, #{failId})")
    void add(Spare spare);

    /**
     * 分页查询备件
     * @param sparePageDTO
     * @return
     */
    Page<Spare> list(SparePageDTO sparePageDTO);
}
