package com.imatoilet.backend;

import com.imatoilet.backend.dto.MigrationRequestDto;
import com.imatoilet.backend.dto.UserResponseDto;
import com.imatoilet.backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponseDto getMe(String firebaseUid) {
        User user = userRepository.findById(firebaseUid)
                .orElseThrow(() -> new ResourceNotFoundException("ユーザー", "id", firebaseUid));
        return new UserResponseDto(
                user.getTotalExp(),
                user.getLevel(),
                user.getContributionCount(),
                user.getNickname()
        );
    }

    @Transactional
    public UserResponseDto migrateLocalData(String firebaseUid, MigrationRequestDto request) {
        User user = userRepository.findById(firebaseUid)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setId(firebaseUid);
                    return userRepository.save(newUser);
                });

        // サーバー側にすでにEXPがある場合は上書きしない（二重移行防止）
        if (user.getTotalExp() > 0) {
            return new UserResponseDto(
                    user.getTotalExp(),
                    user.getLevel(),
                    user.getContributionCount(),
                    user.getNickname()
            );
        }

        user.setTotalExp(request.getTotalExp());
        user.setLevel(request.getLevel());
        user.setContributionCount(request.getContributionCount());
        userRepository.save(user);

        return new UserResponseDto(
                user.getTotalExp(),
                user.getLevel(),
                user.getContributionCount(),
                user.getNickname()
        );
    }
}
