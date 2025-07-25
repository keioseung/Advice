-- 테스트용 사용자 생성
INSERT INTO advice_app.users (user_id, password_hash, user_type, name, father_id) 
VALUES 
('testfather', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO6G', 'father', '테스트 아버지', NULL),
('testchild', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO6G', 'child', '테스트 자녀', 'testfather');

-- 비밀번호: testpw123 