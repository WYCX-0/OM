package com.om.service;

import com.om.pojo.dto.EngineerLoginDTO;
import com.om.pojo.dto.EngineerPageDTO;
import com.om.pojo.entity.Engineer;
import com.om.pojo.result.PageResult;
import com.om.pojo.vo.EngineerGetVO;

import java.util.List;

public interface EngineerService {

    /**
     * 工程师登录
     * @param engineerLoginDTO
     */
    Engineer login(EngineerLoginDTO engineerLoginDTO);

    /**
     * 添加工程师
     * @param engineer
     */
    void add(Engineer engineer);


    /**
     * 更新工程师信息
     * @param engineer
     */
    void update(Engineer engineer);

    /**
     * 分页查询工程师
     * @param engineerPageDTO
     * @return
     */
    PageResult list(EngineerPageDTO engineerPageDTO);

    /**
     * 查询所有工程师
     * @return
     */
    List<EngineerGetVO> get();
}
