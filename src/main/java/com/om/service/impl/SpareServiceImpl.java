package com.om.service.impl;

import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import com.om.context.BaseContext;
import com.om.mapper.SpareMapper;
import com.om.pojo.dto.SparePageDTO;
import com.om.pojo.entity.Spare;
import com.om.pojo.result.PageResult;
import com.om.service.SpareService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class SpareServiceImpl implements SpareService {

    @Autowired
    private SpareMapper spareMapper;

    /**
     * 添加
     * @param spare
     */
    @Override
    public void add(Spare spare) {
        spare.setCreateTime(LocalDateTime.now());
        spare.setEngineerId(BaseContext.getCurrentId());
        spareMapper.add(spare);
    }

    /**
     * 分页查询
     * @param sparePageDTO
     * @return
     */
    @Override
    public PageResult list(SparePageDTO sparePageDTO) {
        PageHelper.startPage(sparePageDTO.getPage(), sparePageDTO.getPageSize());
        Page<Spare> page=spareMapper.list(sparePageDTO);
        long total = page.getTotal();
        List<Spare> records = page.getResult();
        return new PageResult(total, records);
    }
}
