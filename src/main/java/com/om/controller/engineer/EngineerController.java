package com.om.controller.engineer;

import com.om.jwt.JwtClaimsConstant;
import com.om.jwt.JwtProperties;
import com.om.jwt.JwtUtil;
import com.om.pojo.dto.EngineerLoginDTO;
import com.om.pojo.entity.Engineer;
import com.om.pojo.result.Result;
import com.om.pojo.vo.EngineerLoginVO;
import com.om.service.EngineerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/engineer")
public class EngineerController {

    @Autowired
    private EngineerService engineerService;
    @Autowired
    private JwtProperties jwtProperties;

    /**
     * 工程师登录
     * @param engineerLoginDTO
     * @return
     */
    @PostMapping("/login")
    public Result<EngineerLoginVO> login(@RequestBody EngineerLoginDTO engineerLoginDTO) {
        log.info("工程师登录: {}", engineerLoginDTO);
        Engineer engineer =engineerService.login(engineerLoginDTO);
        if (engineer == null) {
            return Result.error("用户名或密码错误");
        }
        if(engineer.getStatus()==0){
            return Result.error("抱歉，您已离职");
        }
        Map<String, Object> claims = new HashMap<>();
        claims.put(JwtClaimsConstant.ENGINEER_ID, engineer.getId());
        String token = JwtUtil.creatJWT(jwtProperties.getEngineerSecretKey(), jwtProperties.getEngineerTtl(), claims);
        EngineerLoginVO engineerLoginVO = new EngineerLoginVO(engineer.getId(),engineer.getName(), token);
        return Result.success(engineerLoginVO);
    }

    /**
     * 工程师退出
     * @return
     */
    @PostMapping("/logout")
    public Result<String> logout() {
        return Result.success();
    }
}
