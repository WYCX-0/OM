package com.om.jwt;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "om.jwt")
@Data
public class JwtProperties {

    /**
     * 管理员token
     */
    private String adminSecretKey;
    private long adminTtl;
    private String adminTokenName;

    /**
     * 用户token
     */
    private String engineerSecretKey;
    private long engineerTtl;
    private String engineerTokenName;

}
