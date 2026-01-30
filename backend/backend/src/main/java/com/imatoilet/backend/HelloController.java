package com.imatoilet.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class HelloController {

    @Autowired
    private ToiletRepository repository;

    // 1. 一覧画面を表示する
    @GetMapping("/")
    public String showToiletList(Model model) {
        model.addAttribute("toilets", repository.findAll());
        return "toilet-list";
    }

 // ★変更後：空っぽのデータを「toilet」という名前で渡す
    @GetMapping("/new")
    public String showAddForm(Model model) {
        model.addAttribute("toilet", new Toilet());
        return "toilet-form";
    }

    // ★追加：指定したIDのデータを検索して渡す（編集用）
    @GetMapping("/edit/{id}")
    public String showEditForm(@PathVariable Long id, Model model) {
        Toilet t = repository.findById(id).get(); // IDで検索
        model.addAttribute("toilet", t);          // 見つかったデータを渡す
        return "toilet-form";                     // 同じフォーム画面を使う
    }

    // 3. フォームから送られてきたデータを保存する（新機能！）
    @PostMapping("/save")
    public String saveToilet(@ModelAttribute Toilet toilet) {
        repository.save(toilet); // データベースに保存！
        return "redirect:/";     // 保存したら一覧画面に戻る
    }
    
 // 4. 指定したIDのトイレを削除する（新機能！）
    @GetMapping("/delete/{id}")
    public String deleteToilet(@PathVariable Long id) {
        repository.deleteById(id); // 指定されたIDのデータを削除する
        return "redirect:/";       // 一覧画面に戻る
    }
}
