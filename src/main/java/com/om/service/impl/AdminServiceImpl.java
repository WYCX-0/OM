package com.om.service.impl;

import com.om.mapper.AdminMapper;
import com.om.pojo.entity.Admin;
import com.om.service.AdminService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

@Service
@Slf4j
public class AdminServiceImpl implements AdminService {

    @Autowired
    private AdminMapper adminMapper;

    /**
     * 管理员登录
     * @param admin 管理员登录信息
     * @return
     */
    @Override
    public Admin login(Admin admin) {
        String username = admin.getUsername();
        String password = admin.getPassword();
        log.info("加密前的密码：{}",password);
        admin = adminMapper.getByUsername(username);
        if (admin == null) {
            return null;
        }
        password= DigestUtils.md5DigestAsHex(password.getBytes());
        log.info("加密后的密码：{}",password);
        if (!password.equals(admin.getPassword())) {
            return null;
        }
        return admin;
    }

    /**
     * 修改密码
     * @param admin
     */
    @Override
    public void updatePassword(Admin admin) {
        String password = admin.getPassword();
        log.info("加密前的密码：{}",password);
        password= DigestUtils.md5DigestAsHex(password.getBytes());
        log.info("加密后的密码：{}",password);
        admin.setPassword(password);
        adminMapper.updatePassword(admin);
    }
}
