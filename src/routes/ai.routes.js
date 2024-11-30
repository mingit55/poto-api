const express = require('express');
const router = express.Router();
const ai = require('../ai');
const { LOCATION_MAP } = require('../constant/ai');

router.post('/request', async (req, res) => {
  const time = req.body.time || 'everytime';
  const locationType = req.body.locationType || 'anywhere';
  const locationDetail = req.body.locationDetail || '';
  const region = req.body.region || 'in korea';

  const result = await ai.generateContent({
    time,
    locationType,
    locationDetail,
    region,
  });

  const responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!responseText) {
    res.json({
      success: false,
      message:
        '검색 조건에 해당하는 촬영지를 찾을 수 없습니다.\n촬영 요건을 변경해 보세요.',
    });
    return;
  }

  let payload;
  try {
    let jsonText = responseText.replace('```json', '').replace('```', '');
    payload = JSON.parse(jsonText);

  } catch (err) {
    res.json({
      success: false,
      message: '올바른 검색 결과를 찾을 수 없습니다.',
    });
    return;
  }

  res.json({
    success: true,
    data: payload,
  });
});

router.get('/category', async (req, res) => {
  const locationType = req.query.locationType;

  if (!LOCATION_MAP[locationType]) {
    res.json({
      success: false,
      message: '올바른 촬영 장소가 아닙니다.',
    });
    return;
  }

  res.json({
    success: true,
    data: LOCATION_MAP[locationType],
  });
});

module.exports = router;
