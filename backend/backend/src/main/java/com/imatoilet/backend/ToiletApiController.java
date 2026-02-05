package com.imatoilet.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid; // ★追加：バリデーション機能を使うためのインポート
import java.util.List;

@RestController
@RequestMapping("/api/toilets")
// 環境変数またはデフォルト値から許可オリジンを読み込む設定
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class ToiletApiController {

    @Autowired
    private ToiletRepository toiletRepository;

    @GetMapping
    public List<Toilet> getAllToilets() {
        return toiletRepository.findAll();
    }

    // ★修正：@Valid を追加することで、Toilet.java に書いたルールでチェックを実行します
    @PostMapping
    public Toilet createToilet(@RequestBody @Valid Toilet toilet) {
        return toiletRepository.save(toilet);
    }

    @DeleteMapping("/{id}")
    public void deleteToilet(@PathVariable Long id) {
        toiletRepository.deleteById(id);
    }
}