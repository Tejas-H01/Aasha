import { useState, useEffect } from "react";
import extractStructuredData from '../utils/structuredProcessor';
import calculateRisk from '../utils/riskEngine';
import { saveRecord, getAllRecords } from "../indexeddb/db";
import { syncPendingRecords } from "../sync/syncEngine";

function AshaPage() {

  const [language, setLanguage] = useState('en');
  const [rawText, setRawText] = useState('');
  const [extracted, setExtracted] = useState(null);
  const [risk, setRisk] = useState(null);

  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [patientType, setPatientType] = useState("adult");

  const [networkStatus, setNetworkStatus] = useState("offline");
  const [pendingCount, setPendingCount] = useState(0);

  const checkInternetConnection = async () => {
    try {
      await fetch("https://www.google.com/generate_204", {
        method: "GET",
        mode: "no-cors",
        cache: "no-store"
      });
      setNetworkStatus("online");
      return true;
    } catch {
      setNetworkStatus("offline");
      return false;
    }
  };

  const updatePendingCount = async () => {
    const records = await getAllRecords();
    const pending = records.filter(r => r.syncStatus === "pending");
    setPendingCount(pending.length);
  };

  useEffect(() => {

    updatePendingCount();

    const initConnectivity = async () => {
      const isOnline = await checkInternetConnection();
      if (isOnline) {
        syncPendingRecords();
      }
    };

    initConnectivity();

    const handleOnline = async () => {
      await checkInternetConnection();
      syncPendingRecords();
      updatePendingCount();
    };

    const handleOffline = async () => {
      await checkInternetConnection();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };

  }, []);

  const handleProcessInput = async () => {

    if (!rawText.trim()) {
      alert("Please enter or record an observation.");
      return;
    }

    if (!patientName.trim() || !age) {
      alert("Please enter patient name and age.");
      return;
    }

    const result = extractStructuredData(rawText, language);
    setExtracted(result);

    const riskResult = calculateRisk(result);
    setRisk(riskResult);

    const record = {
      id: Date.now().toString(),
      patientName,
      age,
      phone,
      patientType,
      rawText: rawText,
      language: language,
      structured: result,
      createdAt: Date.now(),
      syncStatus: "pending"
    };

    await saveRecord(record);

    updatePendingCount();
  };

  const riskLabel = (risk || "").toString().toLowerCase();
  const riskBg = riskLabel.includes("high")
    ? "#fdecea"
    : riskLabel.includes("medium")
      ? "#fff4e5"
      : riskLabel.includes("low")
        ? "#eaf8ee"
        : "#f2f4f8";
  const riskColor = riskLabel.includes("high")
    ? "#d93025"
    : riskLabel.includes("medium")
      ? "#ef8f00"
      : riskLabel.includes("low")
        ? "#2e7d32"
        : "#3d4752";

  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "32px 20px 40px",
        background: "#f5f6fa",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          fontFamily: "'Poppins', 'Nunito Sans', sans-serif",
          color: "#242b33"
        }}
      >
        <style>{`
          .asha-form-field::placeholder {
            color: #999;
          }
        `}</style>
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
            padding: "20px 24px",
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "32px",
                fontWeight: "600",
                lineHeight: 1.2
              }}
            >
              ASHA Dashboard
            </h1>
            <p style={{ margin: "6px 0 0", color: "#6d7680", fontSize: 14 }}>
              AI-powered community health worker assistant
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div
              style={{
                padding: "8px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: "600",
                background: networkStatus === "offline" ? "#fdeaea" : "#eaf7ef",
                color: networkStatus === "offline" ? "#d93025" : "#2e7d32"
              }}
            >
              {networkStatus === "offline" ? "Offline" : "Online"}
            </div>
            <div
              style={{
                padding: "8px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: "500",
                background: "#f3f5f8",
                color: "#4b5560"
              }}
            >
              Pending sync: {pendingCount}
            </div>
          </div>
        </div>

        {/* NETWORK STATUS */}

        <div style={{ width: "100%", marginBottom: 12 }}>

          {networkStatus === "offline" && (
            <div style={{
              background: "#fdeaea",
              color: "#b3261e",
              padding: 12,
              borderRadius: 10,
              marginBottom: 10,
              textAlign: "center",
              fontWeight: "500"
            }}>
              Offline mode. {pendingCount} records pending sync.
            </div>
          )}

          {networkStatus === "online" && pendingCount > 0 && (
            <div style={{
              background: "#eaf7ef",
              color: "#1f7a3d",
              padding: 12,
              borderRadius: 10,
              marginBottom: 10,
              textAlign: "center",
              fontWeight: "500"
            }}>
              Online. Syncing {pendingCount} pending records.
            </div>
          )}

        </div>

        {/* MAIN GRID */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginTop: 8,
            alignItems: "start"
          }}
        >

          {/* LEFT PANEL */}

          <div style={{
            background: "#ffffff",
            padding: 24,
            borderRadius: "12px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.08)"
          }}>

            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginTop: 0,
                marginBottom: 16,
                color: "#1f2933"
              }}
            >
              Basic Details
            </h3>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 14, color: "#555", fontWeight: "500" }}>Language</label>
              <br />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  marginTop: 8,
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                  background: "#fafafa",
                  color: "#2c3640"
                }}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="mr">Marathi</option>
              </select>
            </div>

            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginTop: 4,
                marginBottom: 14,
                color: "#1f2933"
              }}
            >
              Patient Information
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                width: "100%",
                maxWidth: "900px",
                margin: "0 auto",
                justifyContent: "center"
              }}
            >

              <input
                className="asha-form-field"
                type="text"
                value={patientName}
                onChange={(e)=>setPatientName(e.target.value)}
                placeholder="Patient Name"
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                  background: "#ffffff",
                  color: "#333"
                }}
              />

              <input
                className="asha-form-field"
                type="number"
                value={age}
                onChange={(e)=>setAge(e.target.value)}
                placeholder="Age"
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                  background: "#ffffff",
                  color: "#333"
                }}
              />

              <input
                className="asha-form-field"
                type="text"
                value={phone}
                onChange={(e)=>setPhone(e.target.value)}
                placeholder="Phone"
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                  background: "#ffffff",
                  color: "#333",
                  gridColumn: "span 2"
                }}
              />

            </div>

            <div style={{ marginTop: 20 }}>

              <label style={{ fontSize: 14, color: "#555", fontWeight: "500" }}>Visit Type</label>

              <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>

                <button
                  onClick={()=>setPatientType("pregnant")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "20px",
                    border: "none",
                    background: patientType === "pregnant" ? "#4CAF50" : "#f0f0f0",
                    color: patientType === "pregnant" ? "white" : "#333",
                    cursor: "pointer",
                    fontWeight: "500"
                  }}
                >
                  Pregnant
                </button>

                <button
                  onClick={()=>setPatientType("child")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "20px",
                    border: "none",
                    background: patientType === "child" ? "#4CAF50" : "#f0f0f0",
                    color: patientType === "child" ? "white" : "#333",
                    cursor: "pointer",
                    fontWeight: "500"
                  }}
                >
                  Child
                </button>

                <button
                  onClick={()=>setPatientType("adult")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "20px",
                    border: "none",
                    background: patientType === "adult" ? "#4CAF50" : "#f0f0f0",
                    color: patientType === "adult" ? "white" : "#333",
                    cursor: "pointer",
                    fontWeight: "500"
                  }}
                >
                  Adult
                </button>

                <button
                  onClick={()=>setPatientType("elder")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "20px",
                    border: "none",
                    background: patientType === "elder" ? "#4CAF50" : "#f0f0f0",
                    color: patientType === "elder" ? "white" : "#333",
                    cursor: "pointer",
                    fontWeight: "500"
                  }}
                >
                  Elder
                </button>

              </div>

            </div>

            <div style={{ marginTop: 24 }}>

              <label style={{ fontSize: 14, color: "#555", fontWeight: "500" }}>Observations (Voice / Text)</label>

              <textarea
                className="asha-form-field"
                rows={6}
                style={{
                  width:"100%",
                  marginTop:8,
                  padding:"10px",
                  borderRadius:"8px",
                  border: "1px solid #e0e0e0",
                  background: "#ffffff",
                  color: "#333",
                  boxSizing: "border-box"
                }}
                value={rawText}
                onChange={(e)=>setRawText(e.target.value)}
                placeholder="Paste or dictate observations..."
              />

            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>

              <button
                onClick={handleProcessInput}
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#4CAF50",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                Process Input
              </button>

              <button
                style={{
                  padding: "10px 16px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#e0e0e0",
                  color: "#333",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
                onClick={syncPendingRecords}
              >
                Force Sync
              </button>

            </div>

          </div>


          {/* RIGHT PANEL */}

          <div style={{
            background:"#ffffff",
            padding:24,
            borderRadius:"12px",
            height:"fit-content",
            boxShadow: "0 6px 20px rgba(0,0,0,0.08)"
          }}>

            <h3
              style={{
                marginTop: 0,
                marginBottom: 12,
                fontSize: "18px",
                fontWeight: "600",
                color: "#1f2933"
              }}
            >
              Risk Result
            </h3>

            {risk ? (
              <div style={{
                marginTop:10,
                padding:14,
                background: riskBg,
                borderRadius:8,
                fontWeight:"600",
                color: riskColor,
                border: `1px solid ${riskColor}22`
              }}>
                {risk}
              </div>
            ) : (
              <p style={{ color: "#6d7680", margin: 0 }}>No risk calculated yet.</p>
            )}

          </div>

        </div>


        {/* STRUCTURED PREVIEW */}

        <section
          style={{
            marginTop: 24,
            width:"100%"
          }}
        >

          <div
            style={{
              background:"#ffffff",
              padding:24,
              borderRadius:"12px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.08)"
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginTop: 0,
                marginBottom: 14,
                color: "#1f2933"
              }}
            >
              Structured Preview
            </h2>

            {extracted ? (

              <div style={{
                background:"#fafafa",
                padding:20,
                borderRadius:10,
                marginTop:12,
                border: "1px solid #eceff3",
                color: "#2f3741"
              }}>

                <p style={{ margin: "0 0 10px" }}><strong>Pregnancy Month:</strong> {extracted.pregnancyMonth ?? "N/A"}</p>
                <p style={{ margin: "0 0 10px" }}><strong>Fever Days:</strong> {extracted.feverDays ?? "N/A"}</p>
                <p style={{ margin: "0 0 10px" }}><strong>High BP:</strong> {extracted.highBP ? "Yes" : "No"}</p>
                <p style={{ margin: "0 0 10px" }}><strong>Swelling:</strong> {extracted.swelling ? "Yes" : "No"}</p>

                <div>

                  <strong>Symptoms:</strong>

                  {extracted.symptoms && extracted.symptoms.length > 0 ? (

                    <ul style={{ marginTop: 8, marginBottom: 0 }}>
                      {extracted.symptoms.map((s,i)=>(
                        <li key={i}>{s}</li>
                      ))}
                    </ul>

                  ) : (

                    <span> None</span>

                  )}

                </div>

              </div>

            ) : (

              <p style={{ color: "#6d7680", margin: 0 }}>No structured data yet.</p>

            )}
          </div>

        </section>

      </div>
    </div>

  );
}

export default AshaPage;
