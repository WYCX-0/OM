package com.om.controller.admin;

import com.om.jwt.JwtClaimsConstant;
import com.om.jwt.JwtProperties;
import com.om.jwt.JwtUtil;
import com.om.pojo.entity.Admin;
import com.om.pojo.result.Result;
import com.om.pojo.vo.AdminVO;
import com.om.service.AdminService;
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
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;
    @Autowired
    private JwtProperties jwtProperties;

    /**
     * 管理员登录
     * @param admin
     * @return
     */
    @PostMapping("/login")
    public Result<AdminVO> login(@RequestBody Admin admin) {
        log.info("管理员登录: {}", admin);
        String password = admin.getPassword();
        admin = adminService.login(admin);
        if (admin == null) {
            return Result.error("用户名或密码错误");
        }
        Map<String, Object> claims = new HashMap<>();
        claims.put(JwtClaimsConstant.ADMIN_ID, admin.getId());
        String token = JwtUtil.creatJWT(jwtProperties.getAdminSecretKey(), jwtProperties.getAdminTtl(), claims);
        AdminVO adminLoginVO = new AdminVO(admin.getId(),admin.getUsername(), password,token);
        return Result.success(adminLoginVO);
    }

    /**
     * 管理员退出登录
     * @return
     */
    @PostMapping("/logout")
    public Result<String> logout() {
        return Result.success();
    }

    /**
     * 修改密码
     * @param admin
     * @return
     */
    @PostMapping("/password")
    public Result<String> updatePassword(@RequestBody Admin admin) {
        log.info("修改密码: {}", admin);
        adminService.updatePassword(admin);
        return Result.success();
    }
}
