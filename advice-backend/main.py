from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import os
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from supabase import create_client, Client
from dotenv import load_dotenv
from config import settings

load_dotenv()

app = FastAPI(
    title="애비의 조언 API",
    description="미래의 나, 그리고 우리 아이를 위한 특별한 메시지 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://advice-app-frontend.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase 설정
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

# 보안 설정
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Pydantic 모델
class UserCreate(BaseModel):
    user_id: str
    password: str
    user_type: str
    name: str
    father_id: Optional[str] = None

class UserLogin(BaseModel):
    user_id: str
    password: str

class UserResponse(BaseModel):
    id: str
    user_id: str
    user_type: str
    name: str
    father_id: Optional[str] = None
    created_at: str
    updated_at: str

class AdviceCreate(BaseModel):
    category: str
    target_age: int
    content: str

class AdviceResponse(BaseModel):
    id: str
    author_id: str
    category: str
    target_age: int
    content: str
    is_read: bool
    is_favorite: bool
    created_at: str
    updated_at: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[str] = None

# 유틸리티 함수
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserResponse:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception
    
    # Supabase에서 사용자 정보 조회
    response = supabase.table("advice_app.users").select("*").eq("user_id", token_data.user_id).execute()
    
    if not response.data:
        raise credentials_exception
    
    user_data = response.data[0]
    return UserResponse(**user_data)

# API 엔드포인트
@app.get("/")
async def root():
    return {"message": "애비의 조언 API에 오신 것을 환영합니다! 👨‍👦"}

@app.post("/auth/register", response_model=Token)
async def register(user: UserCreate):
    # 기존 사용자 확인
    response = supabase.table("advice_app.users").select("*").eq("user_id", user.user_id).execute()
    if response.data:
        raise HTTPException(status_code=400, detail="이미 존재하는 사용자 ID입니다")
    
    # 자녀인 경우 아버지 ID 확인
    if user.user_type == "child" and user.father_id:
        father_response = supabase.table("advice_app.users").select("*").eq("user_id", user.father_id).eq("user_type", "father").execute()
        if not father_response.data:
            raise HTTPException(status_code=400, detail="존재하지 않는 아버지 ID입니다")
    
    # 비밀번호 해시화
    hashed_password = get_password_hash(user.password)
    
    # 사용자 생성
    user_data = {
        "user_id": user.user_id,
        "password_hash": hashed_password,
        "user_type": user.user_type,
        "name": user.name,
        "father_id": user.father_id
    }
    
    response = supabase.table("advice_app.users").insert(user_data).execute()
    
    if not response.data:
        raise HTTPException(status_code=500, detail="사용자 생성에 실패했습니다")
    
    # 토큰 생성
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.user_id}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin):
    # 사용자 조회
    response = supabase.table("advice_app.users").select("*").eq("user_id", user_credentials.user_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=401, detail="잘못된 사용자 ID 또는 비밀번호입니다")
    
    user_data = response.data[0]
    
    # 비밀번호 확인
    if not verify_password(user_credentials.password, user_data["password_hash"]):
        raise HTTPException(status_code=401, detail="잘못된 사용자 ID 또는 비밀번호입니다")
    
    # 토큰 생성
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_data["user_id"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserResponse = Depends(get_current_user)):
    return current_user

@app.post("/advices", response_model=AdviceResponse)
async def create_advice(
    advice: AdviceCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    if current_user.user_type != "father":
        raise HTTPException(status_code=403, detail="아버지만 조언을 작성할 수 있습니다")
    
    advice_data = {
        "author_id": current_user.user_id,
        "category": advice.category,
        "target_age": advice.target_age,
        "content": advice.content,
        "is_read": False,
        "is_favorite": False
    }
    
    response = supabase.table("advice_app.advices").insert(advice_data).execute()
    
    if not response.data:
        raise HTTPException(status_code=500, detail="조언 생성에 실패했습니다")
    
    return AdviceResponse(**response.data[0])

@app.get("/advices", response_model=List[AdviceResponse])
async def get_advices(
    current_user: UserResponse = Depends(get_current_user),
    category: Optional[str] = None,
    target_age: Optional[int] = None
):
    query = supabase.table("advice_app.advices")
    
    if current_user.user_type == "father":
        # 아버지는 자신이 작성한 조언만 조회
        query = query.eq("author_id", current_user.user_id)
    else:
        # 자녀는 아버지의 조언을 조회
        query = query.eq("author_id", current_user.father_id)
    
    if category:
        query = query.eq("category", category)
    
    if target_age:
        query = query.eq("target_age", target_age)
    
    response = query.order("created_at", desc=True).execute()
    
    return [AdviceResponse(**advice) for advice in response.data]

@app.get("/advices/{advice_id}", response_model=AdviceResponse)
async def get_advice(
    advice_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    response = supabase.table("advice_app.advices").select("*").eq("id", advice_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="조언을 찾을 수 없습니다")
    
    advice = response.data[0]
    
    # 권한 확인
    if current_user.user_type == "father":
        if advice["author_id"] != current_user.user_id:
            raise HTTPException(status_code=403, detail="접근 권한이 없습니다")
    else:
        if advice["author_id"] != current_user.father_id:
            raise HTTPException(status_code=403, detail="접근 권한이 없습니다")
    
    return AdviceResponse(**advice)

@app.put("/advices/{advice_id}/read")
async def mark_advice_as_read(
    advice_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    # 조언 조회
    response = supabase.table("advice_app.advices").select("*").eq("id", advice_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="조언을 찾을 수 없습니다")
    
    advice = response.data[0]
    
    # 권한 확인
    if current_user.user_type == "father":
        if advice["author_id"] != current_user.user_id:
            raise HTTPException(status_code=403, detail="접근 권한이 없습니다")
    else:
        if advice["author_id"] != current_user.father_id:
            raise HTTPException(status_code=403, detail="접근 권한이 없습니다")
    
    # 읽음 상태 업데이트
    update_response = supabase.table("advice_app.advices").update({"is_read": True}).eq("id", advice_id).execute()
    
    if not update_response.data:
        raise HTTPException(status_code=500, detail="상태 업데이트에 실패했습니다")
    
    return {"message": "조언을 읽음으로 표시했습니다"}

@app.put("/advices/{advice_id}/favorite")
async def toggle_advice_favorite(
    advice_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    # 조언 조회
    response = supabase.table("advice_app.advices").select("*").eq("id", advice_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="조언을 찾을 수 없습니다")
    
    advice = response.data[0]
    
    # 권한 확인 (자녀만 즐겨찾기 가능)
    if current_user.user_type != "child":
        raise HTTPException(status_code=403, detail="자녀만 즐겨찾기를 사용할 수 있습니다")
    
    if advice["author_id"] != current_user.father_id:
        raise HTTPException(status_code=403, detail="접근 권한이 없습니다")
    
    # 즐겨찾기 상태 토글
    new_favorite_state = not advice["is_favorite"]
    update_response = supabase.table("advice_app.advices").update({"is_favorite": new_favorite_state}).eq("id", advice_id).execute()
    
    if not update_response.data:
        raise HTTPException(status_code=500, detail="상태 업데이트에 실패했습니다")
    
    return {"message": f"즐겨찾기를 {'추가' if new_favorite_state else '제거'}했습니다"}

@app.get("/stats")
async def get_stats(current_user: UserResponse = Depends(get_current_user)):
    if current_user.user_type == "father":
        # 아버지 통계
        response = supabase.table("advice_app.advices").select("*").eq("author_id", current_user.user_id).execute()
        advices = response.data
        
        return {
            "total_advices": len(advices),
            "read_advices": len([a for a in advices if a["is_read"]]),
            "unread_advices": len([a for a in advices if not a["is_read"]])
        }
    else:
        # 자녀 통계
        response = supabase.table("advice_app.advices").select("*").eq("author_id", current_user.father_id).execute()
        advices = response.data
        
        # 현재 나이 (임시로 25세 설정)
        current_age = 25
        
        available_advices = [a for a in advices if a["target_age"] <= current_age]
        future_advices = [a for a in advices if a["target_age"] > current_age]
        favorite_advices = [a for a in advices if a["is_favorite"]]
        
        return {
            "available_advices": len(available_advices),
            "future_advices": len(future_advices),
            "favorite_advices": len(favorite_advices),
            "current_age": current_age
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001) 