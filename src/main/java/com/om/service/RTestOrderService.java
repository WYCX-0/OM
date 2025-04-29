package com.om.service;

import com.om.pojo.dto.RTestOrderAddDTO;
import com.om.pojo.dto.RTestOrderPageDTO;


import com.om.pojo.entity.RTestOrder;

import com.om.pojo.result.PageResult;

import java.util.List;



public interface RTestOrderService {

    /**
     * 添加测试订单
     * @param rtestOrderAddDTO
     */
    void add(RTestOrderAddDTO rtestOrderAddDTO);

    /**
     * 根据id获取测试订单
     * @param id
     * @return
     */
    RTestOrder getById(Integer id);

    /**
     * 删除测试订单
     * @param rtestOrder
     */
    void delete(RTestOrder rtestOrder);

    /**
     * 分页查询测试订单
     * @param rtestOrderPageDTO
     * @return
     */
    PageResult list(RTestOrderPageDTO rtestOrderPageDTO);

    /**
     * 获取所有测试订单
     * @return
     */
    List<RTestOrder> getRTestOrder();

    /**
     * 根据状态获取
     * @param currentId
     * @return
     */
    RTestOrder getByStatus(long currentId);

    /**
     * 处理测试订单
     * @param id
     */
    void deal(Integer id);

    /**
     * 完成测试订单
     * @param id
     * @param finishUrl
     * @param current
     */
    void finish(Integer id, String finishUrl, Integer current);
}
