function normalizeText(rawText, language) {
  let text = rawText.toLowerCase();
  // normalize Hindi/Marathi numerals to English digits
  const digitMap = [
    [/०/g, '0'],
    [/१/g, '1'],
    [/२/g, '2'],
    [/३/g, '3'],
    [/४/g, '4'],
    [/५/g, '5'],
    [/६/g, '6'],
    [/७/g, '7'],
    [/८/g, '8'],
    [/९/g, '9'],
  ];
  digitMap.forEach(([pat, rep]) => {
    text = text.replace(pat, rep);
  });

  if (language === 'hi') {
    // Hindi replacements
    const map = [
      [/ताप/g, 'fever'],
      [/बुखार/g, 'fever'],
      [/([३3])\s*दिन/g, ' $1 days'],
      [/([२2])\s*दिन/g, ' $1 days'],
      [/उच्च\s*रक्तचाप/g, 'high bp'],
      [/बीपी\s*जास्त/g, 'high bp'],
      [/ब्लड\s*प्रेशर\s*जास्त/g, 'high bp'],
      [/सूजन/g, 'swelling'],
      [/पैर\s*में\s*सूजन/g, 'swelling in legs'],
      [/सिर\s*दर्द/g, 'headache'],
      [/चक्कर/g, 'dizziness'],
      [/धुंधला\s*दिखना/g, 'blurred vision'],
      [/पेट\s*दर्द/g, 'abdominal pain'],
      [/रक्तस्राव/g, 'bleeding'],
      [/खून\s*आना/g, 'bleeding'],
      [/महीना/g, 'month'],
      [/गर्भवती/g, 'pregnant'],
    ];
    map.forEach(([pat, rep]) => {
      text = text.replace(pat, rep);
    });
  } else if (language === 'mr') {
    // Marathi replacements
    const map = [
      [/ताप/g, 'fever'],
      [/([३3])\s*दिवस/g, ' $1 days'],
      [/([२2])\s*दिवस/g, ' $1 days'],
      [/बीपी\s*जास्त/g, 'high bp'],
      [/रक्तदाब\s*जास्त/g, 'high bp'],
      [/सुज/g, 'swelling'],
      [/सूज/g, 'swelling'],
      [/पाय\s*सूज/g, 'swelling in legs'],
      [/डोकेदुखी/g, 'headache'],
      [/गरगरणे/g, 'dizziness'],
      [/धूसर\s*दिसणे/g, 'blurred vision'],
      [/पोट\s*दुखणे/g, 'abdominal pain'],
      [/रक्तस्राव/g, 'bleeding'],
      [/महिना/g, 'month'],
      [/गरोदर/g, 'pregnant'],
    ];
    map.forEach(([pat, rep]) => {
      text = text.replace(pat, rep);
    });
  }
  return text;
}

export function extractStructuredData(rawText, language) {
  if (!rawText || !rawText.trim()) {
    return {
      pregnancyMonth: null,
      symptoms: [],
      highBP: false,
      swelling: false,
      feverDays: null,
    };
  }

  const normalized = normalizeText(rawText, language);
  const text = normalized.toLowerCase();

  let pregnancyMonth = null;
  let feverDays = null;
  let highBP = false;
  let swelling = false;
  const symptoms = [];

  // Detect pregnancy month patterns like "5 months", "5 month pregnant", "month 5"
  const monthPattern1 = text.match(/(\d{1,2})\s*(?:months?|month)\b/);
  const monthPattern2 = text.match(/\bmonth\s*(?:is\s*)?:?\s*(\d{1,2})\b/);
  if (monthPattern1) {
    pregnancyMonth = parseInt(monthPattern1[1], 10);
  } else if (monthPattern2) {
    pregnancyMonth = parseInt(monthPattern2[1], 10);
  }

  // Detect fever days: "fever 3 days", "fever since 3 days", "fever for 2 days"
  const feverPattern = text.match(/fever(?:\s*(?:for|since))?\s*(\d{1,3})\s*day[s]?\b/i);
  const feverPatternAlt = text.match(/fever.*?(\d{1,3})\s*day[s]?\b/i);
  if (feverPattern) {
    feverDays = parseInt(feverPattern[1], 10);
    symptoms.push('Fever');
  } else if (feverPatternAlt) {
    feverDays = parseInt(feverPatternAlt[1], 10);
    symptoms.push('Fever');
  } else if (text.includes('fever')) {
    symptoms.push('Fever');
  }

  // High BP detection
  if (text.includes('bp high') || text.includes('high bp')) {
    highBP = true;
    symptoms.push('High BP');
  }

  // Swelling detection
  if (text.includes('swelling')) {
    swelling = true;
    symptoms.push('Swelling');
  }

  const uniqueSymptoms = Array.from(new Set(symptoms));

  return {
    pregnancyMonth,
    symptoms: uniqueSymptoms,
    highBP,
    swelling,
    feverDays,
  };
}

export default extractStructuredData;
