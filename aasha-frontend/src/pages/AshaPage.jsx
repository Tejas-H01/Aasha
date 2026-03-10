import { useState, useEffect } from "react";
import extractStructuredData from '../utils/structuredProcessor';
import calculateRisk from '../utils/riskEngine';
import { saveRecord } from "../indexeddb/db"; 
import { syncPendingRecords } from "../sync/syncEngine";

function AshaPage() {
  const [language, setLanguage] = useState('en');
  const [rawText, setRawText] = useState('');
  const [extracted, setExtracted] = useState(null);
  const [risk, setRisk] = useState(null);

  const handleProcess = () => {
    const trimmed = rawText.trim();
    const extractedData = { text: trimmed, language };
    setExtracted(extractedData);

    if (!trimmed) {
      setRisk(null);
      return;
    }

    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
    let computedRisk = 'Low';
    if (wordCount > 200) computedRisk = 'High';
    else if (wordCount > 50) computedRisk = 'Medium';
    setRisk(computedRisk);
  };

  // AUTO SYNC ON INTERNET RESTORE
  useEffect(() => {

    if (navigator.onLine) {
      console.log("Internet detected. Running initial sync...");
      syncPendingRecords();
    }

    const handleOnline = () => {
      console.log("Internet restored. Running sync...");
      syncPendingRecords();
    };

    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };

  }, []);

  const handleProcessInput = async () => {
    if (!rawText.trim()) {
      alert("Please enter or record an observation.");
      return;
    }

    const result = extractStructuredData(rawText, language);
    setExtracted(result);
    const riskResult = calculateRisk(result);
    setRisk(riskResult);

    const record = {
      id: Date.now().toString(),
      patientType: "general",
      rawText: rawText,
      language: language,
      structured: result,
      createdAt: Date.now(),
      syncStatus: "pending"
    };

    await saveRecord(record);
    console.log("Record saved offline");
  };

  return (
    <div style={{ maxWidth: 800, margin: '24px auto', padding: 16 }}>
      <h1>ASHA Dashboard</h1>

      <div style={{ margin: '12px 0' }}>
        <label htmlFor="language">Language: </label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en">English (en)</option>
          <option value="hi">Hindi (hi)</option>
          <option value="mr">Marathi (mr)</option>
        </select>
      </div>

      <div style={{ margin: '12px 0' }}>
        <label htmlFor="observations">Observations (Voice / Text)</label>
        <br />
        <textarea
          id="observations"
          rows={8}
          style={{ width: '100%', marginTop: 6 }}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste or dictate observations here..."
        />
      </div>

      <div style={{ margin: '12px 0' }}>
        <button onClick={handleProcessInput}>Process Input</button>
        <button onClick={syncPendingRecords}>Sync Now</button>
      </div>

      <section style={{ marginTop: 20 }}>
        <h2>Structured Preview</h2>
        {extracted ? (
          <div style={{ backgroundColor: '#1e1e1e', padding: '16px', borderRadius: '8px', marginTop: '10px', color: '#ffffff' }}>
            <p style={{ color: '#ffffff' }}><strong>Pregnancy Month:</strong> {extracted.pregnancyMonth ?? 'N/A'}</p>
            <p style={{ color: '#ffffff' }}><strong>Fever Days:</strong> {extracted.feverDays ?? 'N/A'}</p>
            <p style={{ color: '#ffffff' }}><strong>High BP:</strong> {extracted.highBP ? 'Yes' : 'No'}</p>
            <p style={{ color: '#ffffff' }}><strong>Swelling:</strong> {extracted.swelling ? 'Yes' : 'No'}</p>
            <div>
              <strong style={{ color: '#ffffff' }}>Symptoms:</strong>
              {extracted.symptoms && extracted.symptoms.length > 0 ? (
                <ul>
                  {extracted.symptoms.map((s, i) => (
                    <li key={i} style={{ color: '#ffffff' }}>{s}</li>
                  ))}
                </ul>
              ) : (
                <span style={{ color: '#ffffff' }}> None</span>
              )}
            </div>
          </div>
        ) : (
          <p>No structured data yet.</p>
        )}
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>Risk Result</h2>
        {risk !== null ? <p>{risk}</p> : <p>No risk calculated yet.</p>}
      </section>
    </div>
  );
}

export default AshaPage;
