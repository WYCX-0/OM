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

/**
 * 管理员身份验证拦截器
 */
@Component
@Slf4j
public class JwtAdmin implements HandlerInterceptor {

    @Autowired
    private JwtProperties jwtProperties;

    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }
        // 从请求头中获取 token
        String tokenHeader = request.getHeader(jwtProperties.getAdminTokenName());
        log.info("jwt校验: {}", tokenHeader);
        if (tokenHeader == null ) {
            log.error("未获取到 token");
            response.setStatus(401);
            return false;
        }
        if(!tokenHeader.startsWith("Bearer ")){
            log.error("token格式错误");
            response.setStatus(401);
            return false;
        }

        String token = tokenHeader.replace("Bearer ", "");

        try {
            log.info("jwt校验: {}", token);
            Claims claims = JwtUtil.parseJWT(jwtProperties.getAdminSecretKey(), token);
            Long adminId = Long.valueOf(claims.get(JwtClaimsConstant.ADMIN_ID).toString());
            log.info("管理员: {}", adminId);
            BaseContext.setCurrentId(adminId);
            return true;
        } catch (Exception e) {
            log.error("jwt校验失败", e);
            response.setStatus(401);
            return false;
        }
    }
}