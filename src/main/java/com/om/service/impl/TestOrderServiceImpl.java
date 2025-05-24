package com.om.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.om.context.BaseContext;
import com.om.mapper.EngineerMapper;
import com.om.mapper.TestOrderMapper;
import com.om.pojo.dto.TestOrderAddDTO;
import com.om.pojo.dto.TestOrderPageDTO;
import com.om.pojo.entity.Engineer;
import com.om.pojo.entity.TestOrder;
import com.om.pojo.result.PageResult;
import com.om.service.TestOrderService;
import com.om.websocket.WebSocketServer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class TestOrderServiceImpl implements TestOrderService {

    @Autowired
    private TestOrderMapper testOrderMapper;
    @Autowired
    private EngineerMapper engineerMapper;
    @Autowired
    private WebSocketServer webSocketServer;

    /**
     * 添加测试订单
     * @param testOrderAddDTO
     */
    @Override
    public void add(TestOrderAddDTO testOrderAddDTO) {
        TestOrder testOrder=new TestOrder();
        testOrder.setDeviceId(testOrderAddDTO.getDeviceId());
        testOrder.setTime(testOrderAddDTO.getTime());
        testOrder.setCreateTime(LocalDateTime.now());
        testOrder.setStatus(1);

        Engineer engineer = engineerMapper.getRandom();
        testOrder.setEngineerId(engineer.getId());
        testOrderMapper.add(testOrder);

        String message=testOrder.getId()+","+engineer.getId();
        String role="admin";
        webSocketServer.onMessage(message,role);
    }

    /**
     * 根据id查询测试订单
     * @param id
     * @return
     */
    @Override
    public TestOrder getById(Integer id) {
        return testOrderMapper.getById(id);
    }

    /**
     * 根据id删除测试订单
     * @param testOrder
     */
    @Override
    public void delete(TestOrder testOrder) {
        testOrder.setDeleteTime(LocalDateTime.now());
        testOrder.setStatus(0);
        testOrderMapper.update(testOrder);
    }

    /**
     * 分页查询测试订单
     * @param testOrderPageDTO
     * @return
     */
    @Override
    public PageResult list(TestOrderPageDTO testOrderPageDTO) {
        PageHelper.startPage(testOrderPageDTO.getPage(), testOrderPageDTO.getPageSize());
        Page<TestOrder> page=testOrderMapper.list(testOrderPageDTO);
        long total = page.getTotal();
        List<TestOrder> records = page.getResult();
        return new PageResult(total, records);
    }

    /**
     * 获取所有测试订单
     * @return
     */
    @Override
    public List<TestOrder> getTestOrder() {
        long engineerId= BaseContext.getCurrentId();
        return testOrderMapper.getTestOrder(engineerId);
    }

    /**
     * 根据状态获取测试订单
     * @return
     */
    @Override
    public TestOrder getByStatus(long currentId) {
        TestOrder testOrder=testOrderMapper.getByStatus(currentId);
        return testOrder;
    }

    /**
     * 处理测试订单
     * @param id
     */
    @Override
    public void deal(Integer id) {
        TestOrder testOrder=testOrderMapper.getById(id);
        testOrder.setStatus(2);
        testOrder.setDealTime(LocalDateTime.now());
        testOrderMapper.update(testOrder);
    }

    /**
     * 完成测试订单
     * @param id
     * @param finishUrl
     * @param current
     */
    @Override
    public void finish(Integer id, String finishUrl, Integer current) {
        TestOrder testOrder=new TestOrder();
        testOrder.setId(id);
        testOrder.setStatus(3);
        testOrder.setFinishUrl(finishUrl);
        testOrder.setFinishTime(LocalDateTime.now());
        testOrder.setCurrent(current);
        testOrderMapper.update(testOrder);

        String message=testOrder.getId()+","+testOrder.getEngineerId();
        String role="engineer";
        webSocketServer.onMessage(message,role);
    }
}
