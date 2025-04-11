package com.om.service.impl;

import com.om.mapper.FenceMapper;
import com.om.pojo.entity.Fence;
import com.om.service.FenceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class FenceServiceImpl implements FenceService {

    @Autowired
    private FenceMapper fenceMapper;

    /**
     * 新增围栏
     * @param fence
     * @return
     */
    @Override
    public String add(Fence fence) {
        fenceMapper.add(fence);
        Fence fence1 = fenceMapper.getByFence(fence);
        String result = String.valueOf(fence1.getId());
        return result;
    }
}
