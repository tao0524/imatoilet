package com.imatoilet.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/toilets")
// 変更: プロパティ値から許可オリジンを読み込む
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class ToiletApiController {

    @Autowired
    private ToiletRepository toiletRepository;

    @GetMapping
    public List<Toilet> getAllToilets() {
        return toiletRepository.findAll();
    }

    @PostMapping
    public Toilet createToilet(@RequestBody Toilet toilet) {
        return toiletRepository.save(toilet);
    }

    @DeleteMapping("/{id}")
    public void deleteToilet(@PathVariable Long id) {
        toiletRepository.deleteById(id);
    }
}