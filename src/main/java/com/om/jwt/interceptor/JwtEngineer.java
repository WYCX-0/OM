package com.om.jwt.interceptor;

import com.om.context.BaseContext;
import com.om.jwt.JwtClaimsConstant;
import com.om.jwt.JwtProperties;
import com.om.jwt.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Slf4j
@Component
public class JwtEngineer implements HandlerInterceptor {

    @Autowired
    private JwtProperties jwtProperties;

    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if(!(handler instanceof HandlerMethod)){
            return true;
        }

        String tokenHeader = request.getHeader(jwtProperties.getEngineerTokenName());
        String token = tokenHeader.replace("Bearer ", "");

        try{
            log.info("jwt校验: {}", token);
            Claims claims = JwtUtil.parseJWT(jwtProperties.getEngineerSecretKey(), token);
            Long engineerId = Long.valueOf(claims.get(JwtClaimsConstant.ENGINEER_ID).toString());
            log.info("工程师: {}", engineerId);
            BaseContext.setCurrentId(engineerId);
            return true;
        }catch (Exception e){
            log.error("jwt校验失败");
            response.setStatus(401);
            return false;
        }
    }
}
