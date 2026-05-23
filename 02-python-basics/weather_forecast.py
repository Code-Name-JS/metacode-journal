def weather_forecast(fine_dust, UV_rays):
    forecast = []
	
    fine_dust = fine_dust.strip()
    UV_rays = UV_rays.strip()

	# 1) 미세먼지 관련
    if fine_dust in ["좋음", "보통"]:
        forecast.append("마스크를 착용하지 않으셔도 됩니다.")
    elif fine_dust in ["나쁨", "매우나쁨"]:
        forecast.append("마스크를 착용해야 합니다.")
    else:
        forecast.append("미세먼지 입력값을 확인해주세요. (좋음/보통/나쁨/매우나쁨)")


	# 2) 자외선 관련
    if UV_rays in ["약함", "보통"]:
        forecast.append("선크림을 바르지 않아도 됩니다.")
    elif UV_rays in ["강함", "매우강함", "위험"]:
        forecast.append("선크림을 발라야 합니다.")
    else:
        forecast.append("자외선 입력값을 확인해주세요. (약함/보통/강함/매우강함/위험)")

    return forecast

# 실행방법
fine_dust = input("미세먼지 상황을 입력하세요 (좋음/보통/나쁨/매우나쁨) : ")
UV_rays = input("자외선 강도를 입력하세요 (약함/보통/강함/매우강함/위험) : ")

result = weather_forecast(fine_dust, UV_rays)

print("\n[오늘의 날씨 준비 가이드]")
for line in result:
    print("-", line)