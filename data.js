/* =========================================================
   PHARMAPATH — EDIT THIS FILE TO UPDATE PRICES & CONTENT
   Open in Notepad, change values, save, re-upload this one file.
   price: number in ₹  |  price: null  -> shows "Price on request"
   mrp: earlier genuine price (shown struck out) — remove if not genuine
   ========================================================= */
window.LAB = {
  name: "Pharmapath Pathology Lab",
  whatsapp: "919172899472",          // country code + number, no spaces
  phoneDisplay: "+91 91728 99472",
  address: "Jay Corner Building, Ghule Vasti, Manjari BK, Pune – 412307",
  hours: "Open 24 hours",            // confirm with client
  mapsQuery: "Pharmapath Pathology Lab, Jay Corner Building, Ghule Vasti, Manjari BK, Pune 412307"
};

window.PACKAGES = [
  {id:"basic",    name:"Basic Health Package",     who:"Yearly routine check",          price:499,  tests:["CBC","Blood Sugar (Fasting)","Urine Routine","Serum Creatinine","Total Cholesterol"], fasting:true},
  {id:"diabetes", name:"Diabetes Care Package",    who:"Sugar monitoring",              price:699,  tests:["HbA1c","Fasting Blood Sugar","Post Lunch Blood Sugar","Urine Routine"], fasting:true},
  {id:"heart",    name:"Heart Care Package",       who:"Recommended after 40",          price:899,  tests:["ECG","Lipid Profile","Blood Sugar (Fasting)","Serum Creatinine","CBC"], fasting:true},
  {id:"women",    name:"Women Health Package",     who:"Thyroid, anaemia and sugar",    price:999,  tests:["CBC","Thyroid Profile (TSH)","Blood Sugar","Urine Routine","Hemoglobin"]},
  {id:"senior",   name:"Senior Citizen Package",   who:"For parents and elders",        price:1199, tests:["CBC","Blood Sugar (Fasting + PP)","Lipid Profile","LFT","KFT","Urine Routine"], fasting:true},
  {id:"fullbody", name:"Full Body Checkup (C Pro)",who:"Complete body checkup",         price:1499, mrp:5400, tag:"Most booked", tests:["CBC","HbA1c","Lipid Profile","Liver Function Test (LFT)","Kidney Function Test (KFT)","Thyroid Profile","Urine Routine"], fasting:true},
  {id:"gym",      name:"Gym Fitness Package",      who:"For gym-goers and athletes",    price:null, tag:"Coming soon", tests:["Tests to be announced — ask on WhatsApp"]}
];

/* cat: blood | sugar | organ | hormone | urine | heart */
window.TESTS = [
  {n:"Complete Blood Count (CBC)", cat:"blood", fasting:false, price:null},
  {n:"Hemoglobin (Hb)", cat:"blood", fasting:false, price:null},
  {n:"ESR", cat:"blood", fasting:false, price:null},
  {n:"Blood Group & Rh", cat:"blood", fasting:false, price:null},
  {n:"Malaria Antigen", cat:"blood", fasting:false, price:null},
  {n:"Dengue NS1 / IgG / IgM", cat:"blood", fasting:false, price:null},
  {n:"Widal (Typhoid)", cat:"blood", fasting:false, price:null},
  {n:"Blood Sugar – Fasting", cat:"sugar", fasting:true, price:null},
  {n:"Blood Sugar – Post Lunch (PP)", cat:"sugar", fasting:false, price:null},
  {n:"Blood Sugar – Random", cat:"sugar", fasting:false, price:null},
  {n:"HbA1c", cat:"sugar", fasting:false, price:null},
  {n:"Lipid Profile", cat:"heart", fasting:true, price:null},
  {n:"ECG", cat:"heart", fasting:false, price:null},
  {n:"Liver Function Test (LFT)", cat:"organ", fasting:true, price:null},
  {n:"Kidney Function Test (KFT)", cat:"organ", fasting:false, price:null},
  {n:"Serum Creatinine", cat:"organ", fasting:false, price:null},
  {n:"Uric Acid", cat:"organ", fasting:false, price:null},
  {n:"Thyroid Profile (T3, T4, TSH)", cat:"hormone", fasting:false, price:null},
  {n:"Vitamin D3", cat:"hormone", fasting:false, price:null},
  {n:"Vitamin B12", cat:"hormone", fasting:false, price:null},
  {n:"Urine Routine", cat:"urine", fasting:false, price:null}
];

window.HOMECARE = ["Injection at home","Dressing","Saline / IV drip","Nurse visit","BP check","Sugar check"];
