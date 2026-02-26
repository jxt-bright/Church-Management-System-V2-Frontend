import { useState, useEffect, useRef } from "react";
import { RequireStrictAccess, RequireAccess } from '../components/RequireAccess.jsx';
import { useAuth } from '../context/AuthContext';
import dashboardService from "../services/dashboardService.js";
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";


const C = {
  bg: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)",
  surface: "#ffffff",
  border: "#e8e2d9",
  text: "#1c1a17",
  muted: "#8a8279",
  faint: "#f0ece5",
  sage: "#4a7c59",
  sageL: "#e8f2ec",
  sky: "#2e6da4",
  skyL: "#e4eef8",
  amber: "#c47c2b",
  amberL: "#fdf0e0",
  rose: "#b24b5a",
  roseL: "#fce8eb",
  violet: "#6b4fa0",
  violetL: "#f0ebfa",
  teal: "#2e8b80",
  tealL: "#e5f5f3",
};


function Counter({ to, prefix = "", suffix = "" }) {
  const [v, setV] = useState(0);
  const r = useRef();
  useEffect(() => {
    const s = Date.now(), d = 1300;
    const t = () => {
      const p = Math.min((Date.now() - s) / d, 1), e = 1 - Math.pow(1 - p, 4);
      setV(Math.floor(e * to));
      if (p < 1) r.current = requestAnimationFrame(t);
    };
    r.current = requestAnimationFrame(t);
    return () => cancelAnimationFrame(r.current);
  }, [to]);
  return <>{prefix}{v.toLocaleString()}{suffix}</>;
}

function Tip({ active, payload, label, prefix = "" }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: `1px solid ${C.border}`,
      borderRadius: 10, padding: "10px 14px", fontSize: 12,
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    }}>
      <div style={{ fontWeight: 700, color: C.text, marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: C.muted, marginBottom: 2 }}>
          <span style={{ color: p.color, fontWeight: 600 }}>{p.name}: </span>
          <span style={{ color: C.text, fontWeight: 600 }}>{prefix}{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ icon, label, value, change, accent, accentL, prefix = "", delay = 0 }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);
  const up = change >= 0;
  return (
    <div className="stat-card" style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 16, padding: "20px 22px",
      opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(12px)",
      transition: "opacity 0.5s ease, transform 0.5s ease",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 90, height: 90, borderRadius: "50%", background: accentL, opacity: 0.7 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: accentL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{icon}</div>
        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: up ? "#e8f5e9" : "#fce8eb", color: up ? "#2e7d32" : C.rose }}>
          {up ? "↑" : "↓"} {Math.abs(change)}%
        </span>
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color: C.text, fontFamily: "'Fraunces', serif", letterSpacing: "-0.02em", lineHeight: 1 }}>
        <Counter to={value} prefix={prefix} />
      </div>
      <div style={{ fontSize: 12, color: C.muted, marginTop: 6, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function Card({ title, icon, children, action, style = {}, bodyStyle = {} }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column", ...style }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text, fontFamily: "'Fraunces', serif" }}>{title}</span>
        </div>
        {action && <button style={{ fontSize: 11, fontWeight: 700, color: C.sage, background: "transparent", border: "none", cursor: "pointer", letterSpacing: "0.04em" }}>{action}</button>}
      </div>
      <div style={{ padding: "16px 20px", flex: 1, ...bodyStyle }}>{children}</div>
    </div>
  );
}

function ProgressBar({ pct, color }) {
  return (
    <div style={{ height: 6, background: C.faint, borderRadius: 3, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: color, transition: "width 0.8s ease" }} />
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("area");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const result = await dashboardService.getDashboardData(user);
        setData(result.data);
      } catch (err) {
        console.error("Dashboard Load Error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading || !data) return null;

  // Logic to slice data for responsiveness
  const getResponsiveData = (chartData) => {
    if (!chartData) return [];
    return isSmallScreen ? chartData.slice(-4) : chartData;
  };

  const totalDemo = data.demographics.reduce((a, b) => a + b.value, 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700;800;900&family=Outfit:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html,body,#root { height:100%; background:${C.bg}; }

        .responsive-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
        .responsive-grid-12 { display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px; margin-bottom: 16px; }
        .grid-span-8 { grid-column: span 8; }
        .grid-span-4 { grid-column: span 4; }

        @media (max-width: 1024px) {
          .responsive-grid-4 { grid-template-columns: repeat(2, 1fr); }
          .grid-span-8, .grid-span-4 { grid-column: span 12; }
        }

        @media (max-width: 640px) {
          .responsive-grid-4 { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Outfit', sans-serif", background: C.bg }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowX: "hidden" }}>
          <main style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>

            <div className="responsive-grid-4">
              <RequireAccess minStatus="manager">
                <StatCard icon="◎" label="Total Groups" value={data.stats.totalGroups} change={5.2} accent={C.amber} accentL={C.amberL} />
              </RequireAccess>

              <RequireAccess minStatus="groupAdmin">
                <StatCard icon="⛪" label="Total Churches" value={data.stats.totalChurches} change={2.1} accent={C.sky} accentL={C.skyL} />
              </RequireAccess>

              <RequireAccess minStatus="groupAdmin">
                <StatCard icon="👤" label="Total Users" value={data.stats.totalUsers} change={1.5} accent={C.violet} accentL={C.violetL} />
              </RequireAccess>

              <RequireAccess minStatus="churchAdmin">
                <StatCard icon="👥" label="Total Members" value={data.stats.totalMembers} change={8.7} accent={C.sage} accentL={C.sageL} />
              </RequireAccess>

              <RequireStrictAccess allowedStatuses={['groupPastor', 'groupAdmin', 'churchAdmin', 'churchPastor']}>
                <StatCard icon="🛠" label="Total Workers" value={data.stats.totalWorkers} change={3.2} accent={C.teal} accentL={C.tealL} />
              </RequireStrictAccess>

              <RequireStrictAccess allowedStatuses={['churchAdmin', 'churchPastor']}>
                <StatCard icon="🌱" label="New Comers" value={data.stats.newComers} change={12} accent={C.sky} accentL={C.skyL} />
                <StatCard icon="💰" label="Monthly Offering" value={data.stats.monthlyOffering} change={-3.1} prefix="GHS " accent={C.rose} accentL={C.roseL} />
              </RequireStrictAccess>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }}>
              <Card title="Attendance Overview" icon="📊" action="View Full Report" bodyStyle={{ padding: "16px 0 0 0" }}>
                <div style={{ display: "flex", gap: 6, padding: "0 20px", marginBottom: 16 }}>
                  {[{ key: "area", label: "Trend" }, { key: "bar", label: "Breakdown" }].map(t => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ padding: "5px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: activeTab === t.key ? C.sage : C.faint, color: activeTab === t.key ? "#fff" : C.muted, fontFamily: "'Outfit', sans-serif" }}>{t.label}</button>
                  ))}
                  <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
                    {[{ l: "Adults", c: C.sky }, { l: "Youths", c: C.sage }, { l: "Children", c: C.amber }].map(x => (
                      <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: x.c }} />
                        <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{x.l}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={340}>
                  {activeTab === "area" ? (
                    <AreaChart data={getResponsiveData(data.attendance)} margin={{ left: -10, right: 10 }}>
                      <defs>
                        {[["gA", C.sky], ["gY", C.sage], ["gC", C.amber]].map(([id, c]) => (
                          <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={c} stopOpacity={0.2} /><stop offset="95%" stopColor={c} stopOpacity={0} /></linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<Tip />} />
                      <Area type="monotone" dataKey="Adults" stroke={C.sky} strokeWidth={2} fill="url(#gA)" dot={false} />
                      <Area type="monotone" dataKey="Youths" stroke={C.sage} strokeWidth={2} fill="url(#gY)" dot={false} />
                      <Area type="monotone" dataKey="Children" stroke={C.amber} strokeWidth={2} fill="url(#gC)" dot={false} />
                    </AreaChart>
                  ) : (
                    <BarChart data={getResponsiveData(data.attendance)} barGap={3} barSize={8} margin={{ left: -10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<Tip />} />
                      <Bar dataKey="Adults" fill={C.sky} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Youths" fill={C.sage} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Children" fill={C.amber} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </Card>
            </div>

            <div className="responsive-grid-12">
              <div className="grid-span-8">
                <Card title="Pledge Fulfillment" icon="📌" action="View Pledges" bodyStyle={{ padding: "16px 0 0 0", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", gap: 12, padding: "0 20px", marginBottom: 12 }}>
                    {[{ l: "Pledged", c: C.violet }, { l: "Fulfilled", c: C.teal }].map(x => (
                      <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: x.c }} />
                        <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{x.l}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                      <BarChart data={getResponsiveData(data.pledgeData)} barGap={6} barSize={24} margin={{ left: -10, right: 10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                        <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                        <Tooltip content={<Tip prefix="GHS " />} />
                        <Bar dataKey="pledged" fill={C.violetL} stroke={C.violet} strokeWidth={1.5} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="fulfilled" fill={C.teal} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              <div className="grid-span-4">
                <Card title="Church Demographics" icon="🏛" action="Full Report" bodyStyle={{ display: "flex", flexDirection: "column" }}>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={data.demographics} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                        {data.demographics.map((d, i) => <Cell key={i} fill={d.color || C.muted} />)}
                      </Pie>
                      <Tooltip formatter={v => v.toLocaleString()} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 16 }}>
                    {data.demographics.map(d => (
                      <div key={d.name}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                          <span style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>{d.name}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{Math.round(d.value / totalDemo * 100)}%</span>
                        </div>
                        <ProgressBar pct={d.value / totalDemo * 100} color={d.color || C.muted} />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }}>
              <Card title="Offering Over Time" icon="💰" action="Full Report" bodyStyle={{ padding: "16px 0 0 0" }}>
                <div style={{ display: "flex", gap: 12, padding: "0 20px", marginBottom: 12 }}>
                  {[{ l: "First Offering", c: C.sage }, { l: "Second Offering", c: C.sky }].map(x => (
                    <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: x.c }} />
                      <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{x.l}</span>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={340}>
                  <AreaChart data={getResponsiveData(data.offerings)} margin={{ left: -10, right: 10 }}>
                    <defs>
                      <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.sage} stopOpacity={0.25} /><stop offset="95%" stopColor={C.sage} stopOpacity={0} /></linearGradient>
                      <linearGradient id="gS" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.sky} stopOpacity={0.25} /><stop offset="95%" stopColor={C.sky} stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<Tip prefix="GHS " />} />
                    <Area type="monotone" dataKey="First" stroke={C.sage} strokeWidth={2} fill="url(#gF)" dot={false} />
                    <Area type="monotone" dataKey="Second" stroke={C.sky} strokeWidth={2} fill="url(#gS)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default Dashboard;