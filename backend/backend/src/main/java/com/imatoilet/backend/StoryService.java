package com.imatoilet.backend;

import com.imatoilet.backend.dto.StoryProgressRequestDto;
import com.imatoilet.backend.dto.StoryProgressResponseDto;
import com.imatoilet.backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@Transactional(readOnly = true)
public class StoryService {

    private static final Map<String, String> DOOR_GRANT_MAP = Map.of(
        "2-5", "star4_nature",  // 第1章シーン6: おおぬまのあるじ
        "3-4", "star4_steel"    // 第2章シーン5: はいきょのばんにん
    );

    private final UserRepository userRepository;

    public StoryService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public StoryProgressResponseDto advanceStory(String firebaseUid, StoryProgressRequestDto dto) {
        User user = userRepository.findById(firebaseUid)
                .orElseThrow(() -> new ResourceNotFoundException("ユーザー", "id", firebaseUid));

        int currentChapter = user.getStoryChapter();
        int currentScene = user.getStoryScene();
        int newChapter = dto.getChapter();
        int newScene = dto.getScene();

        if (newChapter < currentChapter
                || (newChapter == currentChapter && newScene <= currentScene)) {
            throw new IllegalArgumentException("後退はできません");
        }

        if (newChapter == currentChapter) {
            if (newScene != currentScene + 1) {
                throw new IllegalArgumentException("シーンは1つずつ進行してください");
            }
        } else {
            if (newChapter != currentChapter + 1 || newScene != 0) {
                throw new IllegalArgumentException("チャプター移行時は次のチャプターのscene=0を指定してください");
            }
        }

        user.setStoryChapter(newChapter);
        user.setStoryScene(newScene);

        String doorKey = newChapter + "-" + newScene;
        String doorEnemyId = DOOR_GRANT_MAP.get(doorKey);
        if (doorEnemyId != null) {
            user.setHeldDoorEnemyId(doorEnemyId);
        }

        userRepository.save(user);

        return new StoryProgressResponseDto(user.getStoryChapter(), user.getStoryScene());
    }
}
