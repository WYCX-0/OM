package com.om.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.om.context.BaseContext;
import com.om.mapper.EngineerMapper;
import com.om.mapper.RTestOrderMapper;

import com.om.pojo.dto.RTestOrderAddDTO;
import com.om.pojo.dto.RTestOrderPageDTO;

import com.om.pojo.entity.Engineer;
import com.om.pojo.entity.RTestOrder;

import com.om.pojo.result.PageResult;
import com.om.service.RTestOrderService;

import com.om.websocket.WebSocketServer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;




@Slf4j
@Service
public class RTestOrderServiceImpl implements RTestOrderService {

    @Autowired
    private RTestOrderMapper rtestOrderMapper;
    @Autowired
    private EngineerMapper engineerMapper;
    @Autowired
    private WebSocketServer webSocketServer;

    /**
     * 添加测试订单
     * @param rtestOrderAddDTO
     */
    @Override
    public void add(RTestOrderAddDTO rtestOrderAddDTO) {
        RTestOrder rtestOrder=new RTestOrder();
        rtestOrder.setDeviceId(rtestOrderAddDTO.getDeviceId());
        rtestOrder.setTime(rtestOrderAddDTO.getTime());
        rtestOrder.setCreateTime(LocalDateTime.now());
        rtestOrder.setStatus(1);

        Engineer engineer = engineerMapper.getRandom();
        rtestOrder.setEngineerId(engineer.getId());
        rtestOrderMapper.add(rtestOrder);

        String message=rtestOrder.getId()+","+engineer.getId();
        String role="admin";
        String sid1="1";
        webSocketServer.onMessage(message,role,sid1);
    }

    /**
     * 根据id查询测试订单
     * @param id
     * @return
     */
    @Override
    public RTestOrder getById(Integer id) {
        return rtestOrderMapper.getById(id);
    }

    /**
     * 根据id删除测试订单
     * @param rtestOrder
     */
    @Override
    public void delete(RTestOrder rtestOrder) {
        rtestOrder.setDeleteTime(LocalDateTime.now());
        rtestOrder.setStatus(0);
        rtestOrderMapper.update(rtestOrder);
    }

    /**
     * 分页查询测试订单
     * @param rtestOrderPageDTO
     * @return
     */
    @Override
    public PageResult list(RTestOrderPageDTO rtestOrderPageDTO) {
        PageHelper.startPage(rtestOrderPageDTO.getPage(), rtestOrderPageDTO.getPageSize());
        Page<RTestOrder> page=rtestOrderMapper.list(rtestOrderPageDTO);
        long total = page.getTotal();
        List<RTestOrder> records = page.getResult();
        return new PageResult(total, records);
    }

    /**
     * 获取所有测试订单
     * @return
     */
    @Override
    public List<RTestOrder> getRTestOrder() {
        long engineerId= BaseContext.getCurrentId();
        return rtestOrderMapper.getRTestOrder(engineerId);
    }

    /**
     * 根据状态获取测试订单
     * @return
     */
    @Override
    public RTestOrder getByStatus(long currentId) {
        RTestOrder rtestOrder=rtestOrderMapper.getByStatus(currentId);
        return rtestOrder;
    }

    /**
     * 处理测试订单
     * @param id
     */
    @Override
    public void deal(Integer id) {
        RTestOrder rtestOrder=rtestOrderMapper.getById(id);
        rtestOrder.setStatus(2);
        rtestOrder.setDealTime(LocalDateTime.now());
        rtestOrderMapper.update(rtestOrder);
    }

    /**
     * 完成测试订单
     * @param id
     * @param finishUrl
     * @param current
     */
    @Override
    public void finish(Integer id, String finishUrl, Integer current) {
        RTestOrder rtestOrder=new RTestOrder();
        rtestOrder.setId(id);
        rtestOrder.setStatus(3);
        rtestOrder.setFinishUrl(finishUrl);
        rtestOrder.setFinishTime(LocalDateTime.now());
        rtestOrder.setCurrent(current);
        rtestOrderMapper.update(rtestOrder);

        String message=rtestOrder.getId()+","+rtestOrder.getEngineerId();
        String role="engineer";
        long sid=BaseContext.getCurrentId();
        String sid1=String.valueOf(sid);
        webSocketServer.onMessage(message,role,sid1);
    }
}
