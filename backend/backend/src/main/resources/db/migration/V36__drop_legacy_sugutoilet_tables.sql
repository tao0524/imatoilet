-- V36: Imatoilet / SuguToilet Backend・DB分離完了後、
--      旧Imatoilet DBに残ったSuguToilet専用テーブルを削除する

DROP TABLE toilet_feedback;
DROP TABLE toilet_edits;
DROP TABLE toilet_reports;
DROP TABLE user_achievements;
DROP TABLE user_inventory;
DROP TABLE user_quest_progress;
DROP TABLE battle_results;
DROP TABLE daily_quests;
DROP TABLE users;
