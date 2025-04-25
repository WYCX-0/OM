package com.om.controller;

import com.om.pojo.result.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping
public class UploadController {

    private static final  String UPLOAD_URL = "src/main/resources/static";

    @PostMapping("/upload")
    public Result<String> upload(@RequestParam("file") MultipartFile file) throws IOException {
        log.info("上传文件: {}", file);

        //生成唯一文件名
        String fileName = file.getOriginalFilename();
        String fileEx= fileName.substring(fileName.lastIndexOf("."));
        String uniqueFilename = UUID.randomUUID() + fileEx;

        Path filePath = Paths.get(UPLOAD_URL).resolve(uniqueFilename);
        Files.copy(file.getInputStream(), filePath);

        String fileUrl = "http://192.168.47.195:9090/" + uniqueFilename;
        return Result.success(fileUrl);
    }
}
