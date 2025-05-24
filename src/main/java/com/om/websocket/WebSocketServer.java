package com.om.websocket;

import jakarta.websocket.OnClose;
import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

/**
 * websocket服务端,用于与服务端通信
 */
@Component
@ServerEndpoint("/ws/{role}/{sid}")
public class WebSocketServer {

    // 存放管理端会话对象
    private static Map<String, Session> adminSessionMap = new HashMap<>();
    // 存放工程师端会话对象
    private static Map<String, Session> engineerSessionMap = new HashMap<>();

    @OnOpen
    public void onOpen(Session session, @PathParam("role") String role, @PathParam("sid") String sid) {
        if ("admin".equals(role)) {
            System.out.println("管理端:" + sid + "建立连接");
            adminSessionMap.put(sid, session);
        } else if ("engineer".equals(role)) {
            System.out.println("工程师端:" + sid + "建立连接");
            engineerSessionMap.put(sid, session);
        }
    }

    /**
     * 类似与controller
     */
    @OnMessage
    public void onMessage(String message, @PathParam("role") String role) {
        if ("admin".equals(role)) {
            System.out.println("管理端"+ "发送消息:" + message);
            String[] parts = message.split(",");
            if (parts.length == 2) {
                String orderId = parts[0];
                String engineerId = parts[1];
                sendMessageToEngineer(engineerId, "您有新工单：" + orderId);
            }

        } else if ("engineer".equals(role)) {
            System.out.println("工程师端发送消息  " + message);
            String[] parts = message.split(",");
            if (parts.length == 2) {
                String orderId = parts[0];
                sendMessageToAdmins("您的工单已完成：" + orderId);

            }


        }
    }

    /**
     * 关闭调用的方法
     */
    @OnClose
    public void onClose(@PathParam("role") String role, @PathParam("sid") String sid) {
        if ("admin".equals(role)) {
            System.out.println("管理端:" + sid + "断开连接");
            adminSessionMap.remove(sid);
        } else if ("engineer".equals(role)) {
            System.out.println("工程师端:" + sid + "断开连接");
            engineerSessionMap.remove(sid);
        }
    }

    /**
     * 向指定工程师发送消息
     */
    private void sendMessageToEngineer(String engineerId, String message) {
        Session session = engineerSessionMap.get(engineerId);
        if (session != null) {
            try {
                session.getBasicRemote().sendText(message);
                System.out.println("向工程师端:" + engineerId + "发送消息:" + message);
            } catch (Exception e) {
                System.out.println("向工程师端:" + engineerId + "发送消息失败");
                e.printStackTrace();
            }
        }
    }

    /**
     * 向管理端群发消息
     */
    public void sendMessageToAdmins(String message) {
        Collection<Session> sessions = adminSessionMap.values();
        System.out.println("向管理端群发消息:" + message);
        for (Session session : sessions) {
            try {
                session.getBasicRemote().sendText(message);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}