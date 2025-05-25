package com.om.service.impl;

import com.om.mapper.BaoyangOrderMapper;
import com.om.mapper.FailMapper;
import com.om.mapper.RTestOrderMapper;
import com.om.mapper.TestOrderMapper;
import com.om.pojo.vo.RandomVO;
import com.om.service.MyService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class MyServiceImpl implements MyService {

    @Autowired
    private FailMapper  failMapper;
    @Autowired
    private TestOrderMapper  testOrderMapper;
    @Autowired
    private RTestOrderMapper  rTestOrderMapper;
    @Autowired
    private BaoyangOrderMapper  baoyangOrderMapper;

    @Override
    public RandomVO getRandom(Long id) {
        Integer fail1 =failMapper.getFail1(id);
        Integer fail3=failMapper.getFail3(id);
        Integer failTotal=failMapper.getFailCount(id);

        Integer test1 =testOrderMapper.getFail1(id);
        Integer test3=testOrderMapper.getFail3(id);
        Integer testTotal=testOrderMapper.getFailCount(id);

        Integer rTest1 =rTestOrderMapper.getFail1(id);
        Integer rTest3=rTestOrderMapper.getFail3(id);
        Integer rTestTotal=rTestOrderMapper.getFailCount(id);

        Integer bao1=baoyangOrderMapper.getFail1(id);
        Integer bao3=baoyangOrderMapper.getFail3(id);
        Integer baoTotal=baoyangOrderMapper.getFailCount(id);


        RandomVO randomVO = new RandomVO();
        randomVO.setId(id);
        randomVO.setNo(rTest1+bao1+fail1+test1);
        randomVO.setYes(rTest3+bao3+fail3+test3);
        randomVO.setTotal(rTestTotal+baoTotal+failTotal+testTotal);
        return randomVO;


    }
}
