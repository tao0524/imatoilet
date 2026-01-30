package com.imatoilet.backend;

import org.springframework.boot.CommandLineRunner;

/**
 * 初期データ投入用のクラスです。
 * PostgreSQL の実データ（つくばのデータ）を表示させるため、機能を完全に停止しています。
 */
// @Component 
public class DataLoader implements CommandLineRunner {

    // 警告を消すため、使用していないリポジトリの宣言もコメントアウトしました
    // private final ToiletRepository repository;

    // コンストラクタも現在は不要なためコメントアウトしています
    /*
    public DataLoader(ToiletRepository repository) {
        this.repository = repository;
    }
    */

    @Override
    public void run(String... args) throws Exception {
        // 現在は何もしない設定です
    }
}
