package com.om.service.impl;

import com.om.mapper.BaoyangOrderMapper;
import com.om.mapper.FailMapper;
import com.om.mapper.RTestOrderMapper;
import com.om.mapper.TestOrderMapper;
import com.om.pojo.vo.SummaryVO;
import com.om.service.CollectService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Service
public class CollectServiceImpl implements CollectService {

    @Autowired
    private FailMapper failMapper;
    @Autowired
    private TestOrderMapper testOrderMapper;
    @Autowired
    private RTestOrderMapper rTestOrderMapper;
    @Autowired
    private BaoyangOrderMapper baoyangOrderMapper;


    @Override
    public List<SummaryVO> Summary() {
        // 获取各类工单统计数据
        List<Map<String, Object>> failList = failMapper.summary();
        List<Map<String, Object>> testList = testOrderMapper.summary();
        List<Map<String, Object>> rTestList = rTestOrderMapper.summary();
        List<Map<String, Object>> baoyangList = baoyangOrderMapper.summary();

        // 构建工程师ID到各类工单数量的映射
        Map<Long, Integer> failMap = buildCountMap(failList);
        Map<Long, Integer> testMap = buildCountMap(testList);
        Map<Long, Integer> rTestMap = buildCountMap(rTestList);
        Map<Long, Integer> baoyangMap = buildCountMap(baoyangList);

        // 合并所有工程师ID
        Map<Long, SummaryVO> resultMap = new HashMap<>();

        // 将fail统计结果放入resultMap
        failList.forEach(item -> {
            Long engineerId = ((Number) item.get("engineer_id")).longValue();
            int failCount = ((Number) item.get("fault_count")).intValue();
            resultMap.putIfAbsent(engineerId, new SummaryVO());
            resultMap.get(engineerId).setEngineerId(engineerId);
            resultMap.get(engineerId).setFailCount(failCount);
        });

        // 合并其他统计结果
        mergeCount(resultMap, testMap, SummaryVO::setTestCount);
        mergeCount(resultMap, rTestMap, SummaryVO::setRTestCount);
        mergeCount(resultMap, baoyangMap, SummaryVO::setBaoyangCount);

        // 计算总工单数并转换为列表
        return resultMap.values().stream()
                .peek(vo -> {
                    int total = 0;
                    if (vo.getFailCount() != null) total += vo.getFailCount();
                    if (vo.getTestCount() != null) total += vo.getTestCount();
                    if (vo.getRTestCount() != null) total += vo.getRTestCount();
                    if (vo.getBaoyangCount() != null) total += vo.getBaoyangCount();
                    vo.setTotalOrders(total);
                })
                .collect(Collectors.toList());
    }

    // 构建ID到数量的映射
    private Map<Long, Integer> buildCountMap(List<Map<String, Object>> list) {
        return list.stream()
                .collect(Collectors.toMap(
                        item -> ((Number) item.get("engineer_id")).longValue(),
                        item -> ((Number) item.get("fault_count")).intValue(),
                        (a, b) -> b // 如果有重复ID，使用后一个值
                ));
    }

    // 合并统计结果的函数式方法
    private void mergeCount(Map<Long, SummaryVO> resultMap,
                            Map<Long, Integer> countMap,
                            java.util.function.BiConsumer<SummaryVO, Integer> setter) {
        countMap.forEach((engineerId, count) -> {
            resultMap.putIfAbsent(engineerId, new SummaryVO());
            resultMap.get(engineerId).setEngineerId(engineerId);
            setter.accept(resultMap.get(engineerId), count);
        });
    }

}
