package com.om.service;

import com.om.pojo.dto.SparePageDTO;
import com.om.pojo.entity.Spare;
import com.om.pojo.result.PageResult;

public interface SpareService {

    /**
     * 添加备件
     * @param spare
     */
    void add(Spare spare);

    /**
     * 获取备件列表
     * @param sparePageDTO
     * @return
     */
    PageResult list(SparePageDTO sparePageDTO);
}
