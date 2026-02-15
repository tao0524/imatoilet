package com.imatoilet.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
@SuppressWarnings("null") // ★追加: IDEの厳格すぎるNull警告をこのクラス全体で抑制
public class HelloController {

    @Autowired
    private ToiletRepository repository;

    // 1. 一覧画面を表示する
    @GetMapping("/")
    public String showToiletList(Model model) {
        model.addAttribute("toilets", repository.findAll());
        return "toilet-list";
    }

    // 2. 新規登録画面
    @GetMapping("/new")
    public String showAddForm(Model model) {
        model.addAttribute("toilet", new Toilet());
        return "toilet-form";
    }

    // 3. 編集画面
    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable @NonNull Long id, Model model) {
        // IDが見つからない場合は例外を投げる
        Toilet t = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid toilet Id:" + id));
        
        model.addAttribute("toilet", t);
        return "toilet-form";
    }

    // 4. 保存処理
    @PostMapping("/save")
    // ★修正: 引数に @NonNull を追加して「nullではない」と明言する
    public String saveToilet(@ModelAttribute @NonNull Toilet toilet) {
        repository.save(toilet);
        return "redirect:/";
    }

    // 5. 削除処理
    @PostMapping("/delete/{id}")
    public String deleteToilet(@PathVariable @NonNull Long id) {
        repository.deleteById(id);
        return "redirect:/";
    }
}