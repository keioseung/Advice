from fastapi import FastAPI, HTTPException, Depends, status, Request, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import os
import uuid
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
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://advice-app-frontend.vercel.app",
        "https://mmo-production-34bc.up.railway.app",
        "https://advice-production-d210.up.railway.app",
        "*"  # 모든 origin 허용 (개발용)
    ],
    allow_origin_regex="https://.*\\.up\\.railway\\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Preflight OPTIONS 핸들러 (모든 경로)
@app.options("/{rest_of_path:path}")
async def preflight_handler(request: Request, rest_of_path: str):
    return JSONResponse(status_code=200, content={})

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
    user_id: str  # id와 동일한 값
    user_type: str
    name: str
    father_id: Optional[str] = None
    created_at: str
    updated_at: str

class AdviceCreate(BaseModel):
    category: str
    target_age: int
    content: str
    media_url: Optional[str] = None
    media_type: Optional[str] = None
    unlockType: Optional[str] = 'age'
    password: Optional[str] = None

class AdviceResponse(BaseModel):
    id: str
    author_id: str
    category: str
    target_age: int
    content: str
    media_url: Optional[str] = None
    media_type: Optional[str] = None
    unlock_type: Optional[str] = 'age'
    password: Optional[str] = None
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
    response = supabase.table("users").select("*").eq("id", token_data.user_id).execute()
    
    if not response.data:
        raise credentials_exception
    
    user_data = response.data[0]
    # user_id 필드 추가 (id와 동일한 값)
    user_data["user_id"] = user_data["id"]
    return UserResponse(**user_data)

# API 엔드포인트
@app.get("/")
async def root():
    return {"message": "애비의 조언 API에 오신 것을 환영합니다! 👨‍👦"}

@app.post("/auth/register", response_model=Token)
async def register(user: UserCreate):
    # 기존 사용자 확인
    response = supabase.table("users").select("*").eq("id", user.user_id).execute()
    if response.data:
        raise HTTPException(status_code=400, detail="이미 존재하는 사용자 ID입니다")
    
    # 자녀인 경우 아버지 ID 확인
    if user.user_type == "child" and user.father_id:
        father_response = supabase.table("users").select("*").eq("id", user.father_id).eq("user_type", "father").execute()
        if not father_response.data:
            raise HTTPException(status_code=400, detail="존재하지 않는 아버지 ID입니다")
    
    # 비밀번호 해시화
    hashed_password = get_password_hash(user.password)
    
    # 사용자 생성
    user_data = {
        "id": user.user_id,
        "password_hash": hashed_password,
        "user_type": user.user_type,
        "name": user.name,
        "father_id": user.father_id
    }
    
    response = supabase.table("users").insert(user_data).execute()
    
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
    response = supabase.table("users").select("*").eq("id", user_credentials.user_id).execute()
    
    if not response.data:
        raise HTTPException(status_code=401, detail="잘못된 사용자 ID 또는 비밀번호입니다")
    
    user_data = response.data[0]
    
    # 비밀번호 확인
    if not verify_password(user_credentials.password, user_data["password_hash"]):
        raise HTTPException(status_code=401, detail="잘못된 사용자 ID 또는 비밀번호입니다")
    
    # 토큰 생성
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_data["id"]}, expires_delta=access_token_expires
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
        "media_url": advice.media_url,
        "media_type": advice.media_type,
        "unlock_type": advice.unlockType,
        "password": advice.password,
        "is_read": False,
        "is_favorite": False
    }
    print(f"Creating advice with data: {advice_data}")  # 디버깅용 로그
    try:
        response = supabase.table("advices").insert(advice_data).execute()
        print(f"Supabase response: {response}")  # 디버깅용 로그
        print(f"Response data: {response.data}")  # 디버깅용 로그
        
        # Supabase 응답 구조 확인
        if hasattr(response, 'error') and response.error:
            print(f"Supabase error: {response.error}")  # 디버깅용 로그
            raise HTTPException(status_code=500, detail=f"Supabase 오류: {response.error}")
        
        # 응답에 오류가 있는지 확인 (다른 방식)
        if hasattr(response, 'data') and response.data is None:
            print(f"No data in response")  # 디버깅용 로그
            raise HTTPException(status_code=500, detail="조언 생성에 실패했습니다")
            
        if not response.data or len(response.data) == 0:
            print(f"Empty data in response")  # 디버깅용 로그
            raise HTTPException(status_code=500, detail="조언 생성에 실패했습니다")
            
        return AdviceResponse(**response.data[0])
    except Exception as e:
        print(f"Exception during advice creation: {str(e)}")  # 디버깅용 로그
        raise HTTPException(status_code=500, detail=f"조언 생성 중 오류 발생: {str(e)}")

@app.get("/advices", response_model=List[AdviceResponse])
async def get_advices(
    current_user: UserResponse = Depends(get_current_user),
    category: Optional[str] = None,
    target_age: Optional[int] = None
):
    try:
        print(f"Fetching advices for user: {current_user.user_id}, type: {current_user.user_type}, father_id: {current_user.father_id}")  # 디버깅용 로그
        
        # Supabase 쿼리 빌더 수정
        if current_user.user_type == "father":
            response = supabase.table("advices").select("*").eq("author_id", current_user.user_id)
        else:
            response = supabase.table("advices").select("*").eq("author_id", current_user.father_id)
        
        if category:
            response = response.eq("category", category)
        if target_age:
            response = response.eq("target_age", target_age)
        
        print(f"Executing query for user_type: {current_user.user_type}")  # 디버깅용 로그
        response = response.order("created_at", desc=True).execute()
        print(f"Advices response: {response.data}")  # 디버깅용 로그
        print(f"Number of advices found: {len(response.data) if response.data else 0}")  # 디버깅용 로그
        
        if not response.data:
            return []
        
        # 각 advice 데이터 검증
        advices = []
        for advice in response.data:
            try:
                advice_response = AdviceResponse(**advice)
                advices.append(advice_response)
            except Exception as e:
                print(f"Error parsing advice {advice.get('id', 'unknown')}: {e}")  # 디버깅용 로그
                continue
        
        return advices
        
    except Exception as e:
        print(f"Error in get_advices: {e}")  # 디버깅용 로그
        import traceback
        print(f"Traceback: {traceback.format_exc()}")  # 디버깅용 로그
        raise HTTPException(status_code=500, detail=f"조언을 가져오는 중 오류 발생: {str(e)}")

@app.get("/advices/{advice_id}", response_model=AdviceResponse)
async def get_advice(
    advice_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    response = supabase.table("advices").select("*").eq("id", advice_id).execute()
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
    response = supabase.table("advices").select("*").eq("id", advice_id).execute()
    
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
    update_response = supabase.table("advices").update({"is_read": True}).eq("id", advice_id).execute()
    
    if not update_response.data:
        raise HTTPException(status_code=500, detail="상태 업데이트에 실패했습니다")
    
    return {"message": "조언을 읽음으로 표시했습니다"}

@app.post("/upload-media")
async def upload_media(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(get_current_user)
):
    # 파일 타입 검증
    if not file.content_type.startswith(('image/', 'video/')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미지 또는 영상 파일만 업로드 가능합니다."
        )
    
    # 파일 크기 제한 (10MB)
    if file.size and file.size > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="파일 크기는 10MB 이하여야 합니다."
        )
    
    try:
        # 파일 내용 읽기
        file_content = await file.read()
        
        # 파일명 생성 (UUID + 원본 확장자)
        file_extension = os.path.splitext(file.filename)[1]
        file_name = f"{uuid.uuid4()}{file_extension}"
        
        # Supabase Storage에 업로드
        bucket_name = "advice-media"
        
        try:
            # 버킷 존재 확인 및 생성
            try:
                supabase.storage.get_bucket(bucket_name)
            except:
                # 버킷이 없으면 생성
                supabase.storage.create_bucket(bucket_name, {"public": True})
                print(f"Created bucket: {bucket_name}")
            
            # 파일 업로드
            response = supabase.storage.from_(bucket_name).upload(
                file_name, 
                file_content,
                {"content-type": file.content_type}
            )
            
            # 공개 URL 생성
            media_url = supabase.storage.from_(bucket_name).get_public_url(file_name)
            media_type = "image" if file.content_type.startswith("image/") else "video"
            
            print(f"File uploaded successfully: {media_url}")
            
            return {
                "url": media_url,
                "type": media_type
            }
            
        except Exception as upload_error:
            print(f"Upload error: {upload_error}")
            # 업로드 실패 시 임시 URL 반환 (개발용)
            media_type = "image" if file.content_type.startswith("image/") else "video"
            temp_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/{bucket_name}/{file_name}"
            return {
                "url": temp_url,
                "type": media_type
            }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"파일 업로드에 실패했습니다: {str(e)}"
        )

@app.put("/advices/{advice_id}/favorite")
async def toggle_advice_favorite(
    advice_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    # 조언 조회
    response = supabase.table("advices").select("*").eq("id", advice_id).execute()
    
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
    update_response = supabase.table("advices").update({"is_favorite": new_favorite_state}).eq("id", advice_id).execute()
    
    if not update_response.data:
        raise HTTPException(status_code=500, detail="상태 업데이트에 실패했습니다")
    
    return {"message": f"즐겨찾기를 {'추가' if new_favorite_state else '제거'}했습니다"}

@app.put("/advices/{advice_id}")
async def update_advice(
    advice_id: str,
    advice_update: AdviceCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    # 아버지만 수정 가능
    if current_user.user_type != "father":
        raise HTTPException(status_code=403, detail="아버지만 조언을 수정할 수 있습니다")
    
    # 조언 조회
    response = supabase.table("advices").select("*").eq("id", advice_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="조언을 찾을 수 없습니다")
    advice = response.data[0]
    
    # 권한 확인
    if advice["author_id"] != current_user.user_id:
        raise HTTPException(status_code=403, detail="접근 권한이 없습니다")
    
    # 조언 업데이트
    update_data = {
        "category": advice_update.category,
        "target_age": advice_update.target_age,
        "content": advice_update.content,
        "media_url": advice_update.media_url,
        "media_type": advice_update.media_type,
        "unlock_type": advice_update.unlockType,
        "password": advice_update.password
    }
    
    try:
        response = supabase.table("advices").update(update_data).eq("id", advice_id).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="조언 수정에 실패했습니다")
        return AdviceResponse(**response.data[0])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"조언 수정 중 오류 발생: {str(e)}")

@app.delete("/advices/{advice_id}")
async def delete_advice(
    advice_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    # 아버지만 삭제 가능
    if current_user.user_type != "father":
        raise HTTPException(status_code=403, detail="아버지만 조언을 삭제할 수 있습니다")
    
    # 조언 조회
    response = supabase.table("advices").select("*").eq("id", advice_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="조언을 찾을 수 없습니다")
    advice = response.data[0]
    
    # 권한 확인
    if advice["author_id"] != current_user.user_id:
        raise HTTPException(status_code=403, detail="접근 권한이 없습니다")
    
    # 조언 삭제
    try:
        supabase.table("advices").delete().eq("id", advice_id).execute()
        return {"message": "조언이 성공적으로 삭제되었습니다"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"조언 삭제 중 오류 발생: {str(e)}")

@app.get("/stats")
async def get_stats(current_user: UserResponse = Depends(get_current_user)):
    if current_user.user_type == "father":
        # 아버지 통계
        response = supabase.table("advices").select("*").eq("author_id", current_user.user_id).execute()
        advices = response.data
        
        return {
            "total_advices": len(advices),
            "read_advices": len([a for a in advices if a["is_read"]]),
            "unread_advices": len([a for a in advices if not a["is_read"]])
        }
    else:
        # 자녀 통계
        response = supabase.table("advices").select("*").eq("author_id", current_user.father_id).execute()
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
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port) 