import { useState, useMemo, useRef, useEffect } from “react”;  
  
const INITIAL_BATCHES = [  
{ id: 1, name: “Morning Batch”, subject: “Mathematics”, time: “7:00 AM – 9:00 AM”, fees: 1200 },  
{ id: 2, name: “Evening Batch”, subject: “Physics”, time: “5:00 PM – 7:00 PM”, fees: 1500 },  
{ id: 3, name: “Weekend Batch”, subject: “Chemistry”, time: “Sat–Sun 10:00 AM”, fees: 1800 },  
];  
  
const INITIAL_STUDENTS = {  
1: [  
{ id: 1, name: “Rahul Sharma”, phone: “9876543210”, fees: 1200, status: “Paid” },  
{ id: 2, name: “Priya Verma”, phone: “9123456789”, fees: 1200, status: “Partial” },  
{ id: 3, name: “Amit Singh”, phone: “9988776655”, fees: 1200, status: “Unpaid” },  
{ id: 4, name: “Sneha Patel”, phone: “9876001234”, fees: 1200, status: “Paid” },  
],  
2: [  
{ id: 5, name: “Rohan Gupta”, phone: “9001122334”, fees: 1500, status: “Paid” },  
{ id: 6, name: “Divya Nair”, phone: “9123001122”, fees: 1500, status: “Unpaid” },  
],  
3: [  
{ id: 7, name: “Karan Mehta”, phone: “9988001122”, fees: 1800, status: “Partial” },  
],  
};  
  
const INITIAL_EVENTS = [  
{ id: 1, title: “Math Olympiad Prep”, date: “2025-05-10”, type: “Event” },  
{ id: 2, title: “Eid Holiday”, date: “2025-05-11”, type: “Holiday” },  
{ id: 3, title: “Fee Due Reminder”, date: “2025-05-15”, type: “Fee Reminder” },  
{ id: 4, title: “Physics Test”, date: “2025-05-20”, type: “Event” },  
];  
  
const statusColor = {  
Paid: “bg-emerald-50 text-emerald-600 border border-emerald-200”,  
Partial: “bg-amber-50 text-amber-600 border border-amber-200”,  
Unpaid: “bg-rose-50 text-rose-600 border border-rose-200”,  
};  
  
const eventTypeColor = {  
Event: “bg-indigo-50 text-indigo-600 border border-indigo-200”,  
Holiday: “bg-orange-50 text-orange-600 border border-orange-200”,  
“Fee Reminder”: “bg-teal-50 text-teal-600 border border-teal-200”,  
};  
  
function formatWAUrl(phone, msg) {  
const cleaned = phone.replace(/\D/g, “”);  
const encoded = encodeURIComponent(msg);  
return `https://wa.me/${cleaned}?text=${encoded}`;  
}  
  
// **───────────────────────────** MODAL **───────────────────────────**  
function Modal({ title, onClose, children }) {  
return (  
<div className=“fixed inset-0 z-50 flex items-end justify-center” style={{ background: “rgba(15,23,42,0.45)”, backdropFilter: “blur(4px)” }}>  
<div className=“w-full max-w-lg bg-white rounded-t-3xl shadow-2xl animate-slideUp” style={{ maxHeight: “88vh”, overflowY: “auto” }}>  
<div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">  
<span className=“text-lg font-semibold text-slate-800” style={{ fontFamily: “‘DM Sans’, sans-serif” }}>{title}</span>  
<button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors text-xl">×</button>  
</div>  
<div className="px-5 pt-4 pb-8">{children}</div>  
</div>  
</div>  
);  
}  
  
function Field({ label, type = “text”, value, onChange, placeholder, options }) {  
return (  
<div className="mb-4">  
<label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>  
{options ? (  
<select value={value} onChange={e => onChange(e.target.value)}  
className=“w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300”>  
{options.map(o => <option key={o}>{o}</option>)}  
</select>  
) : (  
<input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}  
className=“w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300” />  
)}  
</div>  
);  
}  
  
// **───────────────────────────** DASHBOARD **───────────────────────────**  
function Dashboard({ batches, studentMap, events }) {  
const allStudents = Object.values(studentMap).flat();  
const paid = allStudents.filter(s => s.status === “Paid”).reduce((a, s) => a + s.fees, 0);  
const pending = allStudents.filter(s => s.status !== “Paid”).reduce((a, s) => a + s.fees, 0);  
  
const stats = [  
{ label: “Students”, value: allStudents.length, icon: “👨‍🎓”, color: “from-indigo-500 to-indigo-400”, light: “bg-indigo-50” },  
{ label: “Batches”, value: batches.length, icon: “📚”, color: “from-violet-500 to-violet-400”, light: “bg-violet-50” },  
{ label: “Collected”, value: `₹${paid.toLocaleString()}`, icon: “💳”, color: “from-emerald-500 to-emerald-400”, light: “bg-emerald-50” },  
{ label: “Pending”, value: `₹${pending.toLocaleString()}`, icon: “⏳”, color: “from-amber-500 to-amber-400”, light: “bg-amber-50” },  
];  
  
const recent = [  
…allStudents.filter(s => s.status === “Paid”).slice(-3).map(s => ({ icon: “✅”, text: `${s.name} paid ₹${s.fees}`, sub: “Fee received” })),  
…allStudents.filter(s => s.status === “Unpaid”).slice(-2).map(s => ({ icon: “🔔”, text: `${s.name} fee pending`, sub: “Reminder due” })),  
].slice(0, 5);  
  
return (  
<div className="px-4 py-5 space-y-6">  
<div>  
<p className="text-xs text-slate-400 font-medium uppercase tracking-widest mb-1">Overview</p>  
<h2 className=“text-2xl font-bold text-slate-800” style={{ fontFamily: “‘DM Sans’, sans-serif” }}>Dashboard</h2>  
</div>  
  
```  
  <div className="grid grid-cols-2 gap-3">  
    {stats.map(s => (  
      <div key={s.label} className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>  
        <div className={`w-10 h-10 rounded-xl ${s.light} flex items-center justify-center text-xl mb-3`}>{s.icon}</div>  
        <div className="text-xl font-bold text-slate-800" style={{ fontFamily: "'DM Sans', sans-serif" }}>{s.value}</div>  
        <div className="text-xs text-slate-400 mt-0.5 font-medium">{s.label}</div>  
      </div>  
    ))}  
  </div>  
  
  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>  
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Payment Breakdown</p>  
    <div className="flex gap-1 rounded-full overflow-hidden h-3 mb-3">  
      <div className="bg-emerald-400 transition-all" style={{ width: `${paid + pending > 0 ? (paid / (paid + pending)) * 100 : 0}%` }} />  
      <div className="bg-rose-300 flex-1" />  
    </div>  
    <div className="flex items-center gap-4 text-xs text-slate-500">  
      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />Collected ₹{paid.toLocaleString()}</span>  
      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-300 inline-block" />Pending ₹{pending.toLocaleString()}</span>  
    </div>  
  </div>  
  
  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>  
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Recent Activity</p>  
    <div className="space-y-3">  
      {recent.length === 0 && <p className="text-sm text-slate-400">No recent activity.</p>}  
      {recent.map((r, i) => (  
        <div key={i} className="flex items-center gap-3">  
          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-base flex-shrink-0">{r.icon}</div>  
          <div>  
            <p className="text-sm font-medium text-slate-700">{r.text}</p>  
            <p className="text-xs text-slate-400">{r.sub}</p>  
          </div>  
        </div>  
      ))}  
    </div>  
  </div>  
  
  <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>  
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Upcoming Events</p>  
    <div className="space-y-2">  
      {events.slice(0, 3).map(ev => (  
        <div key={ev.id} className="flex items-center justify-between">  
          <div className="flex items-center gap-2">  
            <span className="text-sm">📅</span>  
            <span className="text-sm font-medium text-slate-700">{ev.title}</span>  
          </div>  
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${eventTypeColor[ev.type]}`}>{ev.type}</span>  
        </div>  
      ))}  
    </div>  
  </div>  
</div>  
```  
  
);  
}  
  
// **───────────────────────────** BATCHES **───────────────────────────**  
function Batches({ batches, setBatches, selectedBatch, setSelectedBatch }) {  
const [modal, setModal] = useState(null);  
const [form, setForm] = useState({ name: “”, subject: “”, time: “”, fees: “” });  
const [editId, setEditId] = useState(null);  
  
function openAdd() { setForm({ name: “”, subject: “”, time: “”, fees: “” }); setEditId(null); setModal(“form”); }  
function openEdit(b) { setForm({ name: b.name, subject: b.subject, time: b.time, fees: String(b.fees) }); setEditId(b.id); setModal(“form”); }  
  
function save() {  
if (!form.name.trim()) return;  
if (editId) {  
setBatches(prev => prev.map(b => b.id === editId ? { …b, …form, fees: Number(form.fees) } : b));  
} else {  
const id = Date.now();  
setBatches(prev => […prev, { id, …form, fees: Number(form.fees) }]);  
setSelectedBatch(id);  
}  
setModal(null);  
}  
  
function del(id) {  
setBatches(prev => prev.filter(b => b.id !== id));  
if (selectedBatch === id) setSelectedBatch(batches.find(b => b.id !== id)?.id || null);  
}  
  
return (  
<div className="px-4 py-5 space-y-5">  
<div className="flex items-center justify-between">  
<div>  
<p className="text-xs text-slate-400 font-medium uppercase tracking-widest mb-1">Manage</p>  
<h2 className=“text-2xl font-bold text-slate-800” style={{ fontFamily: “‘DM Sans’, sans-serif” }}>Batches</h2>  
</div>  
<button onClick={openAdd} className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:bg-indigo-700 active:scale-95 transition-all">  
<span className="text-base">**＋**</span> Add Batch  
</button>  
</div>  
  
```  
  <div className="space-y-3">  
    {batches.map(b => {  
      const active = selectedBatch === b.id;  
      return (  
        <div key={b.id} onClick={() => setSelectedBatch(b.id)}  
          className={`rounded-2xl p-4 border transition-all cursor-pointer ${active ? "border-indigo-300 bg-indigo-50 shadow-md" : "border-slate-100 bg-white shadow-sm"}`}  
          style={{ boxShadow: active ? "0 4px 20px rgba(99,102,241,0.15)" : "0 2px 12px rgba(0,0,0,0.06)" }}>  
          <div className="flex items-start justify-between gap-2">  
            <div className="flex-1 min-w-0">  
              <div className="flex items-center gap-2 mb-1">  
                <span className="text-base">📖</span>  
                <span className="font-bold text-slate-800 text-base truncate" style={{ fontFamily: "'DM Sans', sans-serif" }}>{b.name}</span>  
                {active && <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">Active</span>}  
              </div>  
              <p className="text-sm text-slate-500 mb-0.5">📚 {b.subject}</p>  
              <p className="text-sm text-slate-500 mb-0.5">🕐 {b.time}</p>  
              <p className="text-sm font-semibold text-indigo-600">₹{b.fees} / month</p>  
            </div>  
            <div className="flex flex-col gap-2 flex-shrink-0">  
              <button onClick={e => { e.stopPropagation(); openEdit(b); }}  
                className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors text-sm">✏️</button>  
              <button onClick={e => { e.stopPropagation(); del(b.id); }}  
                className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 hover:bg-rose-100 transition-colors text-sm">🗑️</button>  
            </div>  
          </div>  
        </div>  
      );  
    })}  
    {batches.length === 0 && (  
      <div className="text-center py-12 text-slate-400">  
        <div className="text-5xl mb-3">📚</div>  
        <p className="text-sm font-medium">No batches yet</p>  
        <p className="text-xs mt-1">Tap "Add Batch" to get started</p>  
      </div>  
    )}  
  </div>  
  
  {modal === "form" && (  
    <Modal title={editId ? "Edit Batch" : "Add Batch"} onClose={() => setModal(null)}>  
      <Field label="Batch Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Morning Batch" />  
      <Field label="Subject" value={form.subject} onChange={v => setForm(f => ({ ...f, subject: v }))} placeholder="e.g. Mathematics" />  
      <Field label="Time" value={form.time} onChange={v => setForm(f => ({ ...f, time: v }))} placeholder="e.g. 7:00 AM – 9:00 AM" />  
      <Field label="Fees (₹)" type="number" value={form.fees} onChange={v => setForm(f => ({ ...f, fees: v }))} placeholder="e.g. 1200" />  
      <button onClick={save} className="w-full mt-2 bg-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all">  
        {editId ? "Save Changes" : "Create Batch"}  
      </button>  
    </Modal>  
  )}  
</div>  
```  
  
);  
}  
  
// **───────────────────────────** STUDENTS **───────────────────────────**  
function Students({ batches, studentMap, setStudentMap, selectedBatch, setSelectedBatch }) {  
const [modal, setModal] = useState(null);  
const [form, setForm] = useState({ name: “”, phone: “”, fees: “”, status: “Unpaid” });  
const [editId, setEditId] = useState(null);  
const [search, setSearch] = useState(””);  
const fileRef = useRef(null);  
  
const batch = batches.find(b => b.id === selectedBatch);  
const students = studentMap[selectedBatch] || [];  
const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search));  
  
function openAdd() { setForm({ name: “”, phone: “”, fees: String(batch?.fees || “”), status: “Unpaid” }); setEditId(null); setModal(“form”); }  
function openEdit(s) { setForm({ name: s.name, phone: s.phone, fees: String(s.fees), status: s.status }); setEditId(s.id); setModal(“form”); }  
  
function save() {  
if (!form.name.trim()) return;  
setStudentMap(prev => {  
const list = prev[selectedBatch] || [];  
if (editId) return { …prev, [selectedBatch]: list.map(s => s.id === editId ? { …s, …form, fees: Number(form.fees) } : s) };  
return { …prev, [selectedBatch]: […list, { id: Date.now(), …form, fees: Number(form.fees) }] };  
});  
setModal(null);  
}  
  
function del(id) {  
setStudentMap(prev => ({ …prev, [selectedBatch]: (prev[selectedBatch] || []).filter(s => s.id !== id) }));  
}  
  
function markPaid(s) {  
setStudentMap(prev => ({ …prev, [selectedBatch]: (prev[selectedBatch] || []).map(x => x.id === s.id ? { …x, status: “Paid” } : x) }));  
window.open(formatWAUrl(s.phone, “Thank you for paying your fees. 🎉”), “_blank”);  
}  
  
function sendReminder(s) {  
window.open(formatWAUrl(s.phone, “Your Fee Payment Is Pending. Please pay at the earliest. 🙏”), “_blank”);  
}  
  
function handleCSV(e) {  
const file = e.target.files[0];  
if (!file) return;  
const reader = new FileReader();  
reader.onload = ev => {  
const lines = ev.target.result.trim().split(”\n”);  
const existing = studentMap[selectedBatch] || [];  
const phones = new Set(existing.map(s => s.phone));  
const newStudents = [];  
lines.slice(1).forEach(line => {  
const [name, phone, fees] = line.split(”,”).map(x => x?.trim());  
if (name && phone && !phones.has(phone)) {  
phones.add(phone);  
newStudents.push({ id: Date.now() + Math.random(), name, phone, fees: Number(fees) || 0, status: “Unpaid” });  
}  
});  
setStudentMap(prev => ({ …prev, [selectedBatch]: […existing, …newStudents] }));  
};  
reader.readAsText(file);  
e.target.value = “”;  
}  
  
if (!selectedBatch || !batch) {  
return (  
<div className="px-4 py-5">  
<p className="text-xs text-slate-400 font-medium uppercase tracking-widest mb-1">Students</p>  
<h2 className=“text-2xl font-bold text-slate-800 mb-6” style={{ fontFamily: “‘DM Sans’, sans-serif” }}>Select a Batch</h2>  
<div className="space-y-3">  
{batches.map(b => (  
<button key={b.id} onClick={() => setSelectedBatch(b.id)}  
className=“w-full text-left rounded-2xl bg-white border border-slate-100 p-4 shadow-sm hover:border-indigo-200 active:scale-[0.98] transition-all”  
style={{ boxShadow: “0 2px 12px rgba(0,0,0,0.06)” }}>  
<p className="font-bold text-slate-800">{b.name}</p>  
<p className="text-sm text-slate-500">{b.subject} • {b.time}</p>  
</button>  
))}  
</div>  
</div>  
);  
}  
  
return (  
<div className="px-4 py-5 space-y-4">  
<div className="flex items-start justify-between gap-2">  
<div>  
<p className="text-xs text-slate-400 font-medium uppercase tracking-widest mb-1">{batch.subject}</p>  
<h2 className=“text-2xl font-bold text-slate-800” style={{ fontFamily: “‘DM Sans’, sans-serif” }}>{batch.name}</h2>  
</div>  
<button onClick={openAdd} className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-semibold px-3.5 py-2.5 rounded-xl shadow-sm hover:bg-indigo-700 active:scale-95 transition-all">  
<span>**＋**</span> Add  
</button>  
</div>  
  
```  
  <div className="flex gap-2">  
    <div className="flex-1 relative">  
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>  
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students…"  
        className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300" />  
    </div>  
    <button onClick={() => fileRef.current?.click()}  
      className="flex items-center gap-1.5 bg-teal-50 text-teal-700 text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-teal-200 hover:bg-teal-100 active:scale-95 transition-all">  
      📁 CSV  
    </button>  
    <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />  
  </div>  
  
  <div className="flex gap-3 text-center">  
    {[["Paid", students.filter(s => s.status === "Paid").length, "text-emerald-600"],  
      ["Partial", students.filter(s => s.status === "Partial").length, "text-amber-600"],  
      ["Unpaid", students.filter(s => s.status === "Unpaid").length, "text-rose-600"]].map(([label, count, color]) => (  
      <div key={label} className="flex-1 bg-white rounded-xl border border-slate-100 py-3 shadow-sm">  
        <p className={`text-xl font-bold ${color}`} style={{ fontFamily: "'DM Sans', sans-serif" }}>{count}</p>  
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>  
      </div>  
    ))}  
  </div>  
  
  <div className="space-y-3">  
    {filtered.length === 0 && (  
      <div className="text-center py-10 text-slate-400">  
        <div className="text-5xl mb-3">👨‍🎓</div>  
        <p className="text-sm font-medium">{search ? "No students found" : "No students yet"}</p>  
      </div>  
    )}  
    {filtered.map(s => (  
      <div key={s.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>  
        <div className="flex items-start justify-between mb-3">  
          <div className="flex items-center gap-3">  
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-base flex-shrink-0">  
              {s.name[0].toUpperCase()}  
            </div>  
            <div>  
              <p className="font-bold text-slate-800" style={{ fontFamily: "'DM Sans', sans-serif" }}>{s.name}</p>  
              <p className="text-xs text-slate-400">📱 {s.phone}</p>  
            </div>  
          </div>  
          <div className="flex flex-col items-end gap-1.5">  
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColor[s.status]}`}>{s.status}</span>  
            <span className="text-sm font-bold text-slate-700">₹{s.fees}</span>  
          </div>  
        </div>  
        <div className="flex gap-2 pt-1 border-t border-slate-50">  
          <button onClick={() => openEdit(s)}  
            className="flex-1 py-2 rounded-xl bg-slate-50 text-slate-600 text-xs font-semibold hover:bg-slate-100 active:scale-95 transition-all border border-slate-100">  
            ✏️ Edit  
          </button>  
          {s.status !== "Paid" && (  
            <button onClick={() => markPaid(s)}  
              className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 active:scale-95 transition-all">  
              ✅ Mark Paid  
            </button>  
          )}  
          <button onClick={() => sendReminder(s)}  
            className="flex-1 py-2 rounded-xl bg-green-500 text-white text-xs font-semibold hover:bg-green-600 active:scale-95 transition-all">  
            💬 WhatsApp  
          </button>  
          <button onClick={() => del(s.id)}  
            className="w-9 py-2 rounded-xl bg-rose-50 text-rose-500 text-xs font-semibold hover:bg-rose-100 active:scale-95 transition-all border border-rose-100">  
            🗑️  
          </button>  
        </div>  
      </div>  
    ))}  
  </div>  
  
  {modal === "form" && (  
    <Modal title={editId ? "Edit Student" : "Add Student"} onClose={() => setModal(null)}>  
      <Field label="Full Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Rahul Sharma" />  
      <Field label="Phone Number" type="tel" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="e.g. 9876543210" />  
      <Field label="Fees (₹)" type="number" value={form.fees} onChange={v => setForm(f => ({ ...f, fees: v }))} placeholder="e.g. 1200" />  
      <Field label="Payment Status" value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} options={["Unpaid", "Partial", "Paid"]} />  
      <button onClick={save} className="w-full mt-2 bg-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all">  
        {editId ? "Save Changes" : "Add Student"}  
      </button>  
    </Modal>  
  )}  
</div>  
```  
  
);  
}  
  
// **───────────────────────────** CALENDAR **───────────────────────────**  
function Calendar({ events, setEvents }) {  
const [modal, setModal] = useState(false);  
const [form, setForm] = useState({ title: “”, date: “”, type: “Event” });  
  
function save() {  
if (!form.title.trim() || !form.date) return;  
setEvents(prev => […prev, { id: Date.now(), …form }].sort((a, b) => a.date.localeCompare(b.date)));  
setModal(false);  
setForm({ title: “”, date: “”, type: “Event” });  
}  
  
function del(id) { setEvents(prev => prev.filter(e => e.id !== id)); }  
  
const typeIcons = { Event: “🎯”, Holiday: “🏖️”, “Fee Reminder”: “💰” };  
  
return (  
<div className="px-4 py-5 space-y-5">  
<div className="flex items-center justify-between">  
<div>  
<p className="text-xs text-slate-400 font-medium uppercase tracking-widest mb-1">Schedule</p>  
<h2 className=“text-2xl font-bold text-slate-800” style={{ fontFamily: “‘DM Sans’, sans-serif” }}>Calendar</h2>  
</div>  
<button onClick={() => setModal(true)}  
className=“flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:bg-indigo-700 active:scale-95 transition-all”>  
<span>**＋**</span> Add  
</button>  
</div>  
  
```  
  <div className="space-y-3">  
    {events.length === 0 && (  
      <div className="text-center py-12 text-slate-400">  
        <div className="text-5xl mb-3">📅</div>  
        <p className="text-sm font-medium">No events yet</p>  
      </div>  
    )}  
    {events.map(ev => (  
      <div key={ev.id} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex items-center gap-3" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>  
        <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-xl flex-shrink-0">{typeIcons[ev.type]}</div>  
        <div className="flex-1 min-w-0">  
          <p className="font-bold text-slate-800 truncate" style={{ fontFamily: "'DM Sans', sans-serif" }}>{ev.title}</p>  
          <p className="text-xs text-slate-400 mt-0.5">📅 {new Date(ev.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>  
        </div>  
        <div className="flex flex-col items-end gap-2">  
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${eventTypeColor[ev.type]}`}>{ev.type}</span>  
          <button onClick={() => del(ev.id)} className="text-xs text-rose-400 hover:text-rose-600 transition-colors">🗑️</button>  
        </div>  
      </div>  
    ))}  
  </div>  
  
  {modal && (  
    <Modal title="Add Event" onClose={() => setModal(false)}>  
      <Field label="Title" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="e.g. Fee Due Reminder" />  
      <Field label="Date" type="date" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} />  
      <Field label="Type" value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))} options={["Event", "Holiday", "Fee Reminder"]} />  
      <button onClick={save} className="w-full mt-2 bg-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all">  
        Add to Calendar  
      </button>  
    </Modal>  
  )}  
</div>  
```  
  
);  
}  
  
// **───────────────────────────** ROOT **───────────────────────────**  
export default function App() {  
const [tab, setTab] = useState(“dashboard”);  
const [batches, setBatches] = useState(INITIAL_BATCHES);  
const [studentMap, setStudentMap] = useState(INITIAL_STUDENTS);  
const [selectedBatch, setSelectedBatch] = useState(1);  
const [events, setEvents] = useState(INITIAL_EVENTS);  
  
const tabs = [  
{ id: “dashboard”, label: “Home”, icon: “🏠” },  
{ id: “batches”, label: “Batches”, icon: “📚” },  
{ id: “students”, label: “Students”, icon: “👨‍🎓” },  
{ id: “calendar”, label: “Calendar”, icon: “📅” },  
];  
  
return (  
<div className=“min-h-screen bg-slate-50” style={{ fontFamily: “‘DM Sans’, sans-serif” }}>  
<style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } } .animate-slideUp { animation: slideUp 0.28s cubic-bezier(0.32,0.72,0,1); } * { -webkit-tap-highlight-color: transparent; } ::-webkit-scrollbar { display: none; }`}</style>  
  
```  
  {/* Header */}  
  <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3.5 flex items-center justify-between">  
    <div className="flex items-center gap-2.5">  
      <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-base font-bold">T</div>  
      <span className="text-base font-bold text-slate-800" style={{ letterSpacing: "-0.02em" }}>TuitionPro</span>  
    </div>  
    <div className="flex items-center gap-2">  
      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 text-sm">🔔</div>  
      <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">A</div>  
    </div>  
  </div>  
  
  {/* Content */}  
  <div className="pb-24 max-w-lg mx-auto">  
    {tab === "dashboard" && <Dashboard batches={batches} studentMap={studentMap} events={events} />}  
    {tab === "batches" && <Batches batches={batches} setBatches={setBatches} selectedBatch={selectedBatch} setSelectedBatch={setSelectedBatch} />}  
    {tab === "students" && <Students batches={batches} studentMap={studentMap} setStudentMap={setStudentMap} selectedBatch={selectedBatch} setSelectedBatch={setSelectedBatch} />}  
    {tab === "calendar" && <Calendar events={events} setEvents={setEvents} />}  
  </div>  
  
  {/* Bottom Nav */}  
  <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100" style={{ boxShadow: "0 -4px 24px rgba(0,0,0,0.08)" }}>  
    <div className="flex max-w-lg mx-auto">  
      {tabs.map(t => {  
        const active = tab === t.id;  
        return (  
          <button key={t.id} onClick={() => setTab(t.id)}  
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all active:scale-90 ${active ? "text-indigo-600" : "text-slate-400"}`}>  
            <span className={`text-xl transition-transform ${active ? "scale-110" : "scale-100"}`}>{t.icon}</span>  
            <span className={`text-[10px] font-semibold tracking-wide ${active ? "text-indigo-600" : "text-slate-400"}`}>{t.label}</span>  
            {active && <span className="w-1 h-1 rounded-full bg-indigo-600 absolute bottom-1.5" />}  
          </button>  
        );  
      })}  
    </div>  
  </div>  
</div>  
```  
  
);  
}  
