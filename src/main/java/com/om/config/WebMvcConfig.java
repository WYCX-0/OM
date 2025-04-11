package com.om.config;

import com.om.jwt.interceptor.JwtAdmin;
import com.om.jwt.interceptor.JwtEngineer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;

@Slf4j
@Configuration
public class WebMvcConfig extends WebMvcConfigurationSupport {

    @Autowired
    private JwtEngineer jwtEngineer;

    @Autowired
    private JwtAdmin jwtAdmin;

    /**
     * 修正拦截器注册逻辑
     */
    @Override
    protected void addInterceptors(InterceptorRegistry registry) {
        log.info("注册用户端拦截器...");
        registry.addInterceptor(jwtEngineer)
                .addPathPatterns("/engineer/**")
                .excludePathPatterns(
                        "/engineer/login"
                );

        log.info("注册管理端拦截器...");
        registry.addInterceptor(jwtAdmin)
                .addPathPatterns("/admin/**")
                .excludePathPatterns("/admin/login","/**");

    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("file:src/main/resources/static/");
    }

}