package com.om.controller;

import com.om.pojo.result.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping
public class UploadController {

    // 相对路径，指向项目根目录下的static/upload目录
    private static final String UPLOAD_DIR = "target/classes/static/upload/";

    @PostMapping("/upload")
    public Result<String> upload(@RequestParam("file") MultipartFile file) throws IOException {
        log.info("上传文件: {}", file.getOriginalFilename());

        // 生成唯一文件名
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String uniqueFilename = UUID.randomUUID() + fileExtension;

        // 读取上传的图片
        BufferedImage image;
        try {
            image = ImageIO.read(file.getInputStream());
        } catch (Exception e) {
            log.error("读取图片失败", e);
            return Result.error("文件格式不支持");
        }
        if (image == null) {
            return Result.error("文件格式不支持");
        }

        // 添加时间水印
        BufferedImage watermarkedImage = addWatermark(image);

        // 检测图片是否模糊
        if (isImageBlur(watermarkedImage)) {
            return Result.error("图片模糊，请重新上传");
        }

        // 构建上传目录路径
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 保存带有时间戳的图片
        Path filePath = uploadPath.resolve(uniqueFilename);
        ImageIO.write(watermarkedImage, getFormatName(fileExtension), filePath.toFile());

        // 返回可直接访问的URL路径
        String fileUrl = "/upload/" + uniqueFilename;
        log.info("文件保存路径: {}", fileUrl);
        return Result.success(fileUrl);
    }

    // 获取图片格式名称
    private String getFormatName(String fileExtension) {
        // 这里可以根据实际需求进行格式转换
        return fileExtension.toLowerCase().replace(".", "");
    }

    // 添加时间水印
    private BufferedImage addWatermark(BufferedImage originalImage) {
        BufferedImage watermarkedImage = new BufferedImage(
                originalImage.getWidth(),
                originalImage.getHeight(),
                BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = watermarkedImage.createGraphics();
        g2d.drawImage(originalImage, 0, 0, null);

        // 设置水印样式
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date());

        // 增加字体大小和粗细
        g2d.setFont(new Font("SansSerif", Font.BOLD, 66)); // 原 16 → 24
        g2d.setColor(Color.BLACK); // 更明显的颜色

        g2d.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        // 计算水印位置
        FontMetrics metrics = g2d.getFontMetrics();
        int x = originalImage.getWidth() - metrics.stringWidth(timestamp) - 10; // 右侧
        int y = originalImage.getHeight() - metrics.getHeight() + metrics.getAscent(); // 底部

        // 添加半透明背景
        g2d.setColor(new Color(0, 0, 0, 180)); // 更深的背景
        g2d.fillRect(x - 8, y - metrics.getAscent(), metrics.stringWidth(timestamp) + 16, metrics.getHeight());

        // 绘制边框效果
        g2d.setColor(Color.BLACK);
        g2d.drawString(timestamp, x - 1, y);
        g2d.drawString(timestamp, x + 1, y);
        g2d.drawString(timestamp, x, y - 1);
        g2d.drawString(timestamp, x, y + 1);

        // 绘制实际文字
        g2d.setColor(Color.YELLOW);
        g2d.drawString(timestamp, x, y);

        g2d.dispose();
        return watermarkedImage;
    }

    // 检测图片模糊
    private boolean isImageBlur(BufferedImage image) {
        // 缩放图片加速处理
        BufferedImage resized = resizeImage(image, 400, 400);
        BufferedImage grayImage = convertToGrayscale(resized);
        double variance = computeLaplacianVariance(grayImage);
        return variance < 200; // 根据实际测试调整阈值
    }

    private BufferedImage resizeImage(BufferedImage src, int width, int height) {
        BufferedImage resized = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = resized.createGraphics();
        g.drawImage(src.getScaledInstance(width, height, Image.SCALE_SMOOTH), 0, 0, null);
        g.dispose();
        return resized;
    }

    private BufferedImage convertToGrayscale(BufferedImage src) {
        BufferedImage gray = new BufferedImage(
                src.getWidth(),
                src.getHeight(),
                BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D g = gray.createGraphics();
        g.drawImage(src, 0, 0, null);
        g.dispose();
        return gray;
    }

    private double computeLaplacianVariance(BufferedImage grayImage) {
        int[][] laplacianKernel = {{0, 1, 0}, {1, -4, 1}, {0, 1, 0}};
        double total = 0;
        int count = 0;

        for (int y = 1; y < grayImage.getHeight() - 1; y++) {
            for (int x = 1; x < grayImage.getWidth() - 1; x++) {
                double gradient = 0;
                for (int dy = -1; dy <= 1; dy++) {
                    for (int dx = -1; dx <= 1; dx++) {
                        int pixel = new Color(grayImage.getRGB(x + dx, y + dy)).getRed();
                        gradient += pixel * laplacianKernel[dy + 1][dx + 1];
                    }
                }
                total += gradient * gradient;
                count++;
            }
        }
        return total / count;
    }
}