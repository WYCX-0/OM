package com.om.service;

import com.om.pojo.dto.TestOrderAddDTO;
import com.om.pojo.dto.TestOrderPageDTO;
import com.om.pojo.entity.TestOrder;
import com.om.pojo.result.PageResult;

import java.util.List;

public interface TestOrderService {

    /**
     * 添加测试订单
     * @param testOrderAddDTO
     */
    void add(TestOrderAddDTO testOrderAddDTO);

    /**
     * 根据id获取测试订单
     * @param id
     * @return
     */
    TestOrder getById(Integer id);

    /**
     * 删除测试订单
     * @param testOrder
     */
    void delete(TestOrder testOrder);

    /**
     * 分页查询测试订单
     * @param testOrderPageDTO
     * @return
     */
    PageResult list(TestOrderPageDTO testOrderPageDTO);

    /**
     * 获取所有测试订单
     * @return
     */
    List<TestOrder> getTestOrder();

    /**
     * 根据状态获取
     * @param currentId
     * @return
     */
    TestOrder getByStatus(long currentId);

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
