package com.om.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.om.context.BaseContext;
import com.om.mapper.BaoyangOrderMapper;
import com.om.mapper.EngineerMapper;

import com.om.pojo.dto.BaoyangOrderAddDTO;
import com.om.pojo.dto.BaoyangOrderPageDTO;

import com.om.pojo.entity.BaoyangOrder;
import com.om.pojo.entity.Engineer;

import com.om.pojo.result.PageResult;
import com.om.service.BaoyangOrderService;

import com.om.websocket.WebSocketServer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;





@Slf4j
@Service
public class BaoyangOrderServiceImpl implements BaoyangOrderService {

    @Autowired
    private BaoyangOrderMapper baoyangOrderMapper;
    @Autowired
    private EngineerMapper engineerMapper;
    @Autowired
    private WebSocketServer webSocketServer;

    /**
     * 添加测试订单
     * @param baoyangOrderAddDTO
     */
    @Override
    public void add(BaoyangOrderAddDTO baoyangOrderAddDTO) {
        BaoyangOrder baoyangOrder=new BaoyangOrder();
        baoyangOrder.setDeviceId(baoyangOrderAddDTO.getDeviceId());
        baoyangOrder.setTime(baoyangOrderAddDTO.getTime());
        baoyangOrder.setCreateTime(LocalDateTime.now());
        baoyangOrder.setStatus(1);

        Engineer engineer = engineerMapper.getRandom();
        baoyangOrder.setEngineerId(engineer.getId());
        baoyangOrderMapper.add(baoyangOrder);

        String message=baoyangOrder.getId()+","+engineer.getId();
        String role="admin";
        webSocketServer.onMessage(message,role);
    }

    /**
     * 根据id查询测试订单
     * @param id
     * @return
     */
    @Override
    public BaoyangOrder getById(Integer id) {
        return baoyangOrderMapper.getById(id);
    }

    /**
     * 根据id删除测试订单
     * @param baoyangOrder
     */
    @Override
    public void delete(BaoyangOrder baoyangOrder) {
        baoyangOrder.setDeleteTime(LocalDateTime.now());
        baoyangOrder.setStatus(0);
        baoyangOrderMapper.update(baoyangOrder);
    }

    /**
     * 分页查询测试订单
     * @param baoyangOrderPageDTO
     * @return
     */
    @Override
    public PageResult list(BaoyangOrderPageDTO baoyangOrderPageDTO) {
        PageHelper.startPage(baoyangOrderPageDTO.getPage(), baoyangOrderPageDTO.getPageSize());
        Page<BaoyangOrder> page=baoyangOrderMapper.list(baoyangOrderPageDTO);
        long total = page.getTotal();
        List<BaoyangOrder> records = page.getResult();
        return new PageResult(total, records);
    }

    /**
     * 获取所有测试订单
     * @return
     */
    @Override
    public List<BaoyangOrder> getBaoyangOrder() {
        long engineerId= BaseContext.getCurrentId();
        return baoyangOrderMapper.getBaoyangOrder(engineerId);
    }

    /**
     * 根据状态获取测试订单
     * @return
     */
    @Override
    public BaoyangOrder getByStatus(long currentId) {
        BaoyangOrder baoyangOrder=baoyangOrderMapper.getByStatus(currentId);
        return baoyangOrder;
    }

    /**
     * 处理测试订单
     * @param id
     */
    @Override
    public void deal(Integer id) {
        BaoyangOrder baoyangOrder=baoyangOrderMapper.getById(id);
        baoyangOrder.setStatus(2);
        baoyangOrder.setDealTime(LocalDateTime.now());
        baoyangOrderMapper.update(baoyangOrder);
    }

    /**
     * 完成测试订单
     * @param id
     * @param finishUrl
     * @param current
     */
    @Override
    public void finish(Integer id, String finishUrl, Integer current) {
        BaoyangOrder baoyangOrder=new BaoyangOrder();
        baoyangOrder.setId(id);
        baoyangOrder.setStatus(3);
        baoyangOrder.setFinishUrl(finishUrl);
        baoyangOrder.setFinishTime(LocalDateTime.now());
        baoyangOrder.setCurrent(current);
        baoyangOrderMapper.update(baoyangOrder);

        String message=baoyangOrder.getId()+","+baoyangOrder.getEngineerId();
        String role="engineer";
        webSocketServer.onMessage(message,role);
    }
}
