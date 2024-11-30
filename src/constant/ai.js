exports.POTO_GUIDE_LINE = `
      Prompt: Create a JSON-style response that recommends a photo location based on the criteria you provide.
      
      User Inputs:
        Time of day (morning, afternoon, evening, night)
        Location type (indoor, outdoor, studio)
        Specific location (e.g., cafe, exhibition for indoor locations)
        Region (Seoul, Gyeonggi-do, Gangwon-do, etc.)
      
      Expected Output:
        Create a response in the form of JSON that recommends a photo spot according to the criteria you provide. The results of the responses are translated into modern Korean.
      
      Example Input:
        Time of day: evening
        Location type: outdoor
        Specific location: park
        Region: Seoul
      
      Example Output:
      {
        "recommended_location": "Yeouido Park, Seoul",
        "suggested_visit_date": "Monday, 25th, 7 PM",
        "google_maps_url": "https://maps.app.goo.gl/abcdefg",
        "description": "Yeouido Park offers stunning night views. The riverside promenade is especially beautiful, perfect for capturing sunset photos. Monday, 25th is predicted to be clear, making it an ideal day for photography."
      }
      
      Additional Considerations:
        Flexibility: The model should be able to handle various user queries, such as \"quiet cafe for reading\" or \"dog-friendly park.\"
        Contextual Understanding: The model should understand the nuances of different locations and times of day.
        Data: The model requires a large dataset of locations, weather information, and user preferences to provide accurate recommendations.
        Real-time Updates: The model should be able to access up-to-date weather and location data.
        Evaluation: A rating system can be implemented to gather user feedback and improve the model\'s recommendations over time.

     Error Guide:
        If an error occurs, fill each item with null and print it out.
      
      Key points:
        Clear and concise instructions.
        Specific examples of input and output.
        Consideration for various user queries and edge cases.
        Suggestions for data, model training, and evaluation.`
  .replaceAll('\t', '')
  .replaceAll('\n', '');

exports.LOCATION_MAP = {
  실내: [
    '빈티지 스타일 카페',
    '모던 스타일 카페',
    '테마 카페',
    '미술관',
    '과학관',
    '역사 박물관',
    '쇼핑몰',
    '컨셉 스토어',
    '도심 전망 라운지',
    '호텔 라운지',
    '도서관',
    '실내 정원',
  ],
  야외: [
    '도시 공원',
    '식물원',
    '자연 생태 공원',
    '고궁 및 전통 건축물',
    '유명 랜드마크',
    '유적지',
    '바닷가',
    '강변 산책로',
    '호수 근처',
    '등산로',
    '야생화 군락지',
    '폭포 및 계곡',
    '전망대',
    '농장 및 목장',
    '캠핑장',
    '유원지',
  ],
  스튜디오: [
    '빈티지 테마',
    '미니멀리즘 테마',
    '판타지 테마',
    '제품 촬영용',
    '패션 촬영용',
    '아티스트 작업실',
    '크로마키',
    '자연광',
    '댄스 및 퍼포먼스',
    '유튜브 및 스트리밍',
    '영화 및 영상 제작',
  ],
};

