package com.om.service;

import com.om.pojo.dto.FailAddDTO;
import com.om.pojo.dto.FailPageDTO;
import com.om.pojo.entity.Fail;
import com.om.pojo.result.PageResult;

import java.util.List;
import java.util.Map;

public interface FailService {

    /**
     * 新增故障
     * @param failAdminDTO
     */
    void add(FailAddDTO failAdminDTO);

    /**
     * 根据id获取故障
     * @param id
     * @return
     */
    Fail getById(Integer id);

    /**
     * 处理故障
     * @param id
     */
    void deal(Integer id);

    /**
     * 删除故障
     * @param fail
     */
    void delete(Fail fail);

    /**
     * 分页查询故障
     * @param failPageDTO
     * @return
     */
    PageResult list(FailPageDTO failPageDTO);

    /**
     * 完成故障
     * @param finishUrl
     */
    void finish(Integer id,String finishUrl);

    /**
     * 获取所有故障
     * @return
     */
    List<Fail> getFail();

    /**
     * 根据状态获取故障
     * @param currentId
     */
    Fail getByStatus(Long currentId);

    /**
     * 获取收藏
     * @return
     */
    Map<Long, Integer> collect();
}
