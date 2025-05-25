package com.om.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.om.mapper.EngineerMapper;
import com.om.pojo.dto.EngineerLoginDTO;
import com.om.pojo.dto.EngineerPageDTO;
import com.om.pojo.entity.Engineer;
import com.om.pojo.result.PageResult;
import com.om.pojo.vo.EngineerGetVO;
import com.om.service.EngineerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class EngineerServiceImpl implements EngineerService {

    @Autowired
    private EngineerMapper engineerMapper;

    /**
     * 工程师登录
     * @param engineerLoginDTO
     * @return
     */
    @Override
    public Engineer login(EngineerLoginDTO engineerLoginDTO) {
        String engineerNo = engineerLoginDTO.getEngineerNo();
        String password = engineerLoginDTO.getPassword();
        Engineer engineer = engineerMapper.getByEngineerNo(engineerNo);
        if (engineer == null) {
            return null;
        }
        password = DigestUtils.md5DigestAsHex(password.getBytes());
        if (!password.equals(engineer.getPassword())) {
            return null;
        }
        return engineer;
    }

    /**
     * 添加工程师
     * @param engineer
     */
    @Override
    public void add(Engineer engineer) {
        engineer.setCreateTime(LocalDateTime.now());
        String password = DigestUtils.md5DigestAsHex(engineer.getPassword().getBytes());
        engineer.setPassword(password);
        engineer.setStatus(1);
        engineerMapper.add(engineer);
    }


    /**
     * 更新工程师
     * @param engineer
     */
    @Override
    public void update(Engineer engineer) {
        engineerMapper.update(engineer);
    }

    /**
     * 查询工程师列表
     * @param engineerPageDTO
     * @return
     */
    @Override
    public PageResult list(EngineerPageDTO engineerPageDTO) {
        PageHelper.startPage(engineerPageDTO.getPage(), engineerPageDTO.getPageSize());
        Page<Engineer> page=engineerMapper.list(engineerPageDTO);
        long total = page.getTotal();
        List<Engineer> records = page.getResult();
        return new PageResult(total, records);
    }

    /**
     * 查询所有工程师
     * @return
     */
    @Override
    public List<EngineerGetVO> get(){
        List<Engineer> engineers=engineerMapper.get();
        return engineers.stream().map(engineer -> new EngineerGetVO(engineer.getId(), engineer.getName())).toList();
    }

    /**
     * 获取单个工程师信息
     * @param id
     * @return
     */
    @Override
    public Engineer info(Long id) {
        return engineerMapper.getById(id);
    }
}
