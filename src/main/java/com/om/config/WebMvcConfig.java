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

    @Override
    protected void addInterceptors(InterceptorRegistry registry) {
        log.info("注册工程师端拦截器...");
        registry.addInterceptor(jwtEngineer)
                .addPathPatterns("/engineer/**")
                .excludePathPatterns("/engineer/login","/upload/**");

        log.info("注册管理端拦截器...");
        registry.addInterceptor(jwtAdmin)
                .addPathPatterns("/admin/**")
                .excludePathPatterns("/admin/login","/upload/**");

    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 处理上传文件的静态资源映射
        registry.addResourceHandler("/upload/**")
                .addResourceLocations("classpath:/static/upload/");

        // 保留默认静态资源处理
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");

    }
}