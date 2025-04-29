package com.om.service;

import com.om.pojo.dto.BaoyangOrderAddDTO;
import com.om.pojo.dto.BaoyangOrderPageDTO;

import com.om.pojo.entity.BaoyangOrder;

import com.om.pojo.result.PageResult;

import java.util.List;



public interface BaoyangOrderService {

    /**
     * 添加测试订单
     * @param baoyangOrderAddDTO
     */
    void add(BaoyangOrderAddDTO baoyangOrderAddDTO);

    /**
     * 根据id获取测试订单
     * @param id
     * @return
     */
    BaoyangOrder getById(Integer id);

    /**
     * 删除测试订单
     * @param baoyangOrder
     */
    void delete(BaoyangOrder baoyangOrder);

    /**
     * 分页查询测试订单
     * @param baoyangOrderPageDTO
     * @return
     */
    PageResult list(BaoyangOrderPageDTO baoyangOrderPageDTO);

    /**
     * 获取所有测试订单
     * @return
     */
    List<BaoyangOrder> getBaoyangOrder();

    /**
     * 根据状态获取
     * @param currentId
     * @return
     */
    BaoyangOrder getByStatus(long currentId);

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

