CREATE TABLE user_inventory (
    user_id VARCHAR(128) NOT NULL,
    material_key VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, material_key),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
