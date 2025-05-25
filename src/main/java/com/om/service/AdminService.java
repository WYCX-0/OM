package com.om.service;

import com.om.pojo.entity.Admin;

public interface AdminService {

    /**
     * 管理员登录
     * @param admin
     * @return
     */
    Admin login(Admin admin);

    /**
     * 修改密码
     * @param admin
     */
    void updatePassword(Admin admin);
}
