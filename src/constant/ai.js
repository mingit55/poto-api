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
      [
        {
          "location_name": "여의도 공원",
          "location_address": "서울 영등포구 여의도동 여의공원로 68",
          "description": "여의도 공원은 멋진 야경을 선사합니다. 강변 산책로는 특히 일몰 사진을 찍기에 완벽한 아름다운 곳입니다. "
        }
        ... (And two other things)
      ]
      
      Additional Considerations:
        Flexibility: The model should be able to handle various user queries, such as \"quiet cafe for reading\" or \"dog-friendly park.\"
        Contextual Understanding: The model should understand the nuances of different locations and times of day.
        Data: The model requires a large dataset of locations, weather information, and user preferences to provide accurate recommendations.
        Real-time Updates: The model should be able to access up-to-date weather and location data.
        Evaluation: A rating system can be implemented to gather user feedback and improve the model\'s recommendations over time.

     Error Guide:
        If an error occurs, fill each item with null and print it out.
        If the correct address cannot be retrieved, remove it from the array.
      
      Key points:
        Clear and concise instructions.
        Specific examples of input and output.
        Consideration for various user queries and edge cases.
        Suggestions for data, model training, and evaluation.`
  .replaceAll('\t', '')
  .replaceAll('\n', '');

exports.LOCATION_MAP = {
  Indoor: [
    { name: '빈티지 스타일 카페', value: 'Vintage style cafe' },
    { name: '모던 스타일 카페', value: 'Modern style cafe' },
    { name: '테마 카페', value: 'Themed cafe' },
    { name: '미술관', value: 'Art museum' },
    { name: '과학관', value: 'Science Museum' },
    { name: '역사 박물관', value: 'History Museu' },
    { name: '쇼핑몰', value: 'Shopping mall' },
    { name: '컨셉 스토어', value: 'Concept Store' },
    { name: '도심 전망 라운지', value: 'City view lounge' },
    { name: '호텔 라운지', value: 'Hotel lounge' },
    { name: '도서관', value: 'Library' },
    { name: '실내 정원', value: 'Indoor garden' },
  ],
  Outdoor: [
    { name: '도시 공원', value: 'an urban park' },
    { name: '식물원', value: 'a botanical garden' },
    { name: '자연 생태 공원', value: 'a natural ecological park' },
    {
      name: '고궁 및 전통 건축물',
      value: 'Old Palace and Traditional Buildings',
    },
    { name: '유명 랜드마크', value: 'a famous landmark' },
    { name: '유적지', value: 'Historical site' },
    { name: '바닷가', value: 'the beach' },
    { name: '강변 산책로', value: 'a riverside promenade' },
    { name: '호수 근처', value: 'near a lake' },
    { name: '등산로', value: 'a hiking trail' },
    { name: '야생화 군락지', value: 'a wildflower colony' },
    { name: '폭포 및 계곡', value: 'Waterfalls and valleys' },
    { name: '전망대', value: 'Observatory' },
    { name: '농장 및 목장', value: 'Farms and Ranchs' },
    { name: '캠핑장', value: 'Campground' },
    { name: '유원지', value: 'Amusement park' },
  ],
  Studio: [
    { name: '빈티지 테마', value: 'a vintage theme' },
    { name: '미니멀리즘 테마', value: 'minimalist theme' },
    { name: '판타지 테마', value: 'fantasy theme' },
    { name: '제품 촬영용', value: 'For product shooting' },
    { name: '패션 촬영용', value: 'For fashion shoots' },
    { name: '아티스트 작업실', value: "an artist's studio" },
    { name: '크로마키', value: 'Chroma key' },
    { name: '자연광', value: 'natural light' },
    { name: '댄스 및 퍼포먼스', value: 'Dance and Performance' },
    { name: '유튜브 및 스트리밍', value: 'YouTube and Streaming' },
    { name: '영화 및 영상 제작', value: 'Film and video production' },
  ],
};
