# Fixed sections for main.py

# Section 1: Fix for get_advices function around line 339
                        # 다시 공백 제거
                        cleaned_url = cleaned_url.strip()
                        
                        # 슬래시 정리 (4개가 되지 않도록)
                        if '/advice-media/' in cleaned_url:
                            # 먼저 모든 슬래시를 1개로 정리
                            cleaned_url = cleaned_url.replace('/advice-media//', '/advice-media/')
                            # 그 다음 2개로 변경
                            cleaned_url = cleaned_url.replace('/advice-media/', '/advice-media//')
                            print(f"Fixed URL to proper double slash format: {cleaned_url}")
                        
                        if cleaned_url != original_url:

# Section 2: Fix for get_advice function around line 365
    response = supabase.table("advices").select("*").eq("id", advice_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="조언을 찾을 수 없습니다")
    advice = response.data[0]
    
    # media_url 정리 (슬래시 2개 형식으로 수정)
    if advice.get('media_url'):
        original_url = advice['media_url']
        cleaned_url = original_url.strip()
        # 세미콜론 제거
        while cleaned_url.endswith(';'):
            cleaned_url = cleaned_url[:-1]
        cleaned_url = cleaned_url.strip()
        
        # 슬래시 정리 (4개가 되지 않도록)
        if '/advice-media/' in cleaned_url:
            # 먼저 모든 슬래시를 1개로 정리
            cleaned_url = cleaned_url.replace('/advice-media//', '/advice-media/')
            # 그 다음 2개로 변경
            cleaned_url = cleaned_url.replace('/advice-media/', '/advice-media//')
            print(f"Fixed URL to proper double slash format: {cleaned_url}")
        
        advice['media_url'] = cleaned_url 