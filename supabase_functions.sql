-- Supabase 함수들 생성

-- 1. 사용자 존재 확인 함수
CREATE OR REPLACE FUNCTION check_user_exists(user_id_param VARCHAR(50))
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM advice_app.users 
        WHERE user_id = user_id_param
    );
END;
$$;

-- 2. 아버지 존재 확인 함수
CREATE OR REPLACE FUNCTION check_father_exists(father_id_param VARCHAR(50))
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM advice_app.users 
        WHERE user_id = father_id_param AND user_type = 'father'
    );
END;
$$;

-- 3. 사용자 생성 함수
CREATE OR REPLACE FUNCTION create_user(
    user_id_param VARCHAR(50),
    password_hash_param VARCHAR(255),
    user_type_param VARCHAR(20),
    name_param VARCHAR(100),
    father_id_param VARCHAR(50) DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id UUID;
    result JSON;
BEGIN
    INSERT INTO advice_app.users (
        user_id, 
        password_hash, 
        user_type, 
        name, 
        father_id
    ) VALUES (
        user_id_param,
        password_hash_param,
        user_type_param,
        name_param,
        father_id_param
    ) RETURNING id INTO new_user_id;
    
    SELECT json_build_object(
        'id', id,
        'user_id', user_id,
        'user_type', user_type,
        'name', name,
        'father_id', father_id,
        'created_at', created_at,
        'updated_at', updated_at
    ) INTO result
    FROM advice_app.users
    WHERE id = new_user_id;
    
    RETURN result;
END;
$$;

-- 4. 사용자 조회 함수 (로그인용)
CREATE OR REPLACE FUNCTION get_user_by_id(user_id_param VARCHAR(50))
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'id', id,
        'user_id', user_id,
        'password_hash', password_hash,
        'user_type', user_type,
        'name', name,
        'father_id', father_id,
        'created_at', created_at,
        'updated_at', updated_at
    ) INTO result
    FROM advice_app.users
    WHERE user_id = user_id_param;
    
    RETURN result;
END;
$$;

-- 권한 설정
GRANT EXECUTE ON FUNCTION check_user_exists(VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION check_father_exists(VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION create_user(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION get_user_by_id(VARCHAR) TO anon; 