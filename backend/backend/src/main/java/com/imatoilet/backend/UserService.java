package com.imatoilet.backend;

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
}
