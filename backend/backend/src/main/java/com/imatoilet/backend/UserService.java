package com.imatoilet.backend;

import com.imatoilet.backend.dto.EquipmentRequestDto;
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
        return toDto(user);
    }

    @Transactional
    public UserResponseDto migrateLocalData(String firebaseUid, MigrationRequestDto request) {
        User user = userRepository.findById(firebaseUid)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setId(firebaseUid);
                    return userRepository.save(newUser);
                });

        if (user.getTotalExp() > 0) {
            return toDto(user);
        }

        user.setTotalExp(request.getTotalExp());
        user.setLevel(request.getLevel());
        user.setContributionCount(request.getContributionCount());
        userRepository.save(user);

        return toDto(user);
    }

    @Transactional
    public UserResponseDto updateEquipment(String firebaseUid, EquipmentRequestDto request) {
        User user = userRepository.findById(firebaseUid)
                .orElseThrow(() -> new ResourceNotFoundException("ユーザー", "id", firebaseUid));

        if (request.getEquippedHead() != null) {
            EquipmentItem item = validateEquipment(request.getEquippedHead(), EquipmentSlot.HEAD, user.getLevel());
            user.setEquippedHead(item.name());
        }
        if (request.getEquippedRightHand() != null) {
            EquipmentItem item = validateEquipment(request.getEquippedRightHand(), EquipmentSlot.RIGHT_HAND, user.getLevel());
            user.setEquippedRightHand(item.name());
        }
        if (request.getEquippedAura() != null) {
            EquipmentItem item = validateEquipment(request.getEquippedAura(), EquipmentSlot.AURA, user.getLevel());
            user.setEquippedAura(item.name());
        }

        userRepository.save(user);
        return toDto(user);
    }

    private EquipmentItem validateEquipment(String itemName, EquipmentSlot expectedSlot, int userLevel) {
        EquipmentItem item = EquipmentItem.fromName(itemName);
        if (item == null) {
            throw new IllegalArgumentException("不明な装備: " + itemName);
        }
        if (item.getSlot() != expectedSlot) {
            throw new IllegalArgumentException(
                    item.getDisplayName() + " は " + expectedSlot.name() + " スロットに装備できません");
        }
        if (userLevel < item.getRequiredLevel()) {
            throw new IllegalArgumentException(
                    item.getDisplayName() + " にはレベル " + item.getRequiredLevel() + " が必要です（現在Lv." + userLevel + "）");
        }
        return item;
    }

    private UserResponseDto toDto(User user) {
        return new UserResponseDto(
                user.getTotalExp(),
                user.getLevel(),
                user.getContributionCount(),
                user.getNickname(),
                user.getEquippedHead(),
                user.getEquippedRightHand(),
                user.getEquippedAura()
        );
    }
}
