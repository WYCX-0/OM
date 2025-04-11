package com.om.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.om.context.BaseContext;
import com.om.mapper.EngineerMapper;
import com.om.mapper.FailMapper;
import com.om.pojo.dto.FailAddDTO;
import com.om.pojo.dto.FailPageDTO;
import com.om.pojo.entity.Engineer;
import com.om.pojo.entity.Fail;
import com.om.pojo.result.PageResult;
import com.om.service.FailService;
import com.om.websocket.WebSocketServer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class FailServiceImpl implements FailService {

    @Autowired
    private FailMapper failMapper;
    @Autowired
    private EngineerMapper engineerMapper;
    @Autowired
    private WebSocketServer webSocketServer;

    /**
     * 添加故障
     * @param failAdminDTO
     */
    @Override
    public void add(FailAddDTO failAdminDTO) {
        Fail fail=new Fail();
        fail.setDetail(failAdminDTO.getDetail());
        fail.setDeviceId(failAdminDTO.getDeviceId());
        fail.setBeforeUrl(failAdminDTO.getBeforeUrl());
        fail.setCreateTime(LocalDateTime.now());
        fail.setStatus(1);

        //随机选择一个工程师
        Engineer engineer = engineerMapper.getRandom();
        fail.setEngineerId(engineer.getId());
        failMapper.add(fail);
        Fail fail1 = failMapper.getByBeforeUrl(fail.getBeforeUrl());

        String message=fail1.getId()+","+engineer.getId();
        String role="admin";
        long sid=BaseContext.getCurrentId();
        String sid1=String.valueOf(sid);
        webSocketServer.onMessage(message,role,sid1);
    }

    /**
     * 根据id获取故障
     * @param id
     * @return
     */
    @Override
    public Fail getById(Integer id) {
        return failMapper.getById(id);
    }

    /**
     * 处理故障
     * @param id
     */
    @Override
    public void deal(Integer id) {
        Fail fail = failMapper.getById(id);
        fail.setStatus(2);
        fail.setDealTime(LocalDateTime.now());
        failMapper.update(fail);
    }

    /**
     * 删除故障
     * @param fail
     */
    @Override
    public void delete(Fail fail) {
        fail.setStatus(0);
        fail.setDeleteTime(LocalDateTime.now());
        failMapper.update(fail);
    }

    /**
     * 分页查询故障
     * @param failPageDTO
     * @return
     */
    @Override
    public PageResult list(FailPageDTO failPageDTO) {
        PageHelper.startPage(failPageDTO.getPage(), failPageDTO.getPageSize());
        Page<Fail> page=failMapper.list(failPageDTO);
        long total = page.getTotal();
        List<Fail> records = page.getResult();
        return new PageResult(total, records);
    }

    /**
     * 完成故障
     * @param finishUrl
     */
    @Override
    public void finish(Integer id,String finishUrl) {
        Fail fail=new Fail();
        fail.setId(id);
        fail.setFinishUrl(finishUrl);
        fail.setStatus(3);
        fail.setFinishTime(LocalDateTime.now());
        failMapper.update(fail);

        String message=fail.getId()+","+fail.getEngineerId();
        String role="engineer";
        long sid=BaseContext.getCurrentId();
        String sid1=String.valueOf(sid);
        webSocketServer.onMessage(message,role,sid1);
    }

    /**
     * 获取所有故障
     * @return
     */
    @Override
    public List<Fail> getFail() {
        long engineerId= BaseContext.getCurrentId();
        return failMapper.getFail(engineerId);
    }

    /**
     * 获取所有故障
     * @return
     */
    @Override
    public Fail getByStatus(Long currentId) {
        Fail fail=new Fail();
        fail.setStatus(2);
        fail.setEngineerId(currentId);
        Fail fail1=failMapper.getByStatus(fail);
        return fail1;
    }

}
