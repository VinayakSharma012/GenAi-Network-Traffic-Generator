import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Zap, Activity, Brain, ScrollText, Settings,
  Radio, Wifi, AlertTriangle, Menu, X, Play, Square,
  ChevronDown, Copy, Eye, EyeOff
} from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper functions
function generateChartData() {
  return Array.from({length: 20}, (_, i) => ({
    time: `${i}`,
    http: Math.floor(Math.random() * 100),
    dns: Math.floor(Math.random() * 80),
    smtp: Math.floor(Math.random() * 60),
    ftp: Math.floor(Math.random() * 50)
  }));
}

function generateMockLogLine(protocol) {
  const time = new Date().toLocaleTimeString('en-US', {hour12: false});
  const lines = {
    HTTP: `${time} [HTTP] POST /api/users → 200`,
    DNS: `${time} [DNS] QUERY api.service.ai → 142.250.80.4`,
    SMTP: `${time} [SMTP] SENT john@example.com → alice@company.com`,
    FTP: `${time} [FTP] LIST /uploads/ → success`
  };
  return lines[protocol] || '';
}

const mockPayloads = [
  {method: "POST", endpoint: "/api/v2/users", user_agent: "Mozilla/5.0", delay_ms: 284},
  {query: "api.randomservice.ai", type: "A", server: "8.8.8.8", ttl: 300},
  {from: "john@example.com", to: "alice@company.com", subject: "Q3 Report"},
  {host: "ftp.dlptest.com", user: "dlpuser", command: "LIST", path: "/uploads/"}
];

function getProtocolColor(protocol) {
  const colors = {http: '#00e5ff', dns: '#a855f7', smtp: '#f59e0b', ftp: '#22c55e'};
  return colors[protocol] || '#cbd5e1';
}

function buildCliCommand(config) {
  let cmd = 'python3 main.py';
  if (config.http_count > 0) cmd += ` --http-target ${config.http_target} --http-count ${config.http_count}`;
  else cmd += ' --skip-http';
  if (config.dns_count > 0) cmd += ` --dns-server ${config.dns_server} --dns-count ${config.dns_count}`;
  else cmd += ' --skip-dns';
  if (config.smtp_count > 0) cmd += ` --smtp-host ${config.smtp_host} --smtp-port ${config.smtp_port} --smtp-count ${config.smtp_count}`;
  else cmd += ' --skip-smtp';
  if (config.ftp_count > 0) cmd += ` --ftp-host ${config.ftp_host} --ftp-count ${config.ftp_count}`;
  return cmd;
}

// Page Components
function DashboardPage({ kpis, chartData, logLines }) {
  return (
    <div style={{padding: '20px'}}>
      <h1 style={{fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: '#00e5ff', fontFamily: 'Orbitron'}}>Dashboard</h1>
      
      {/* KPI Row */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px'}}>
        {[
          { label: 'Total Packets Sent', value: kpis.packets, color: '#00e5ff' },
          { label: 'Active Sessions', value: kpis.sessions, color: '#a855f7' },
          { label: 'GenAI Profiles', value: kpis.profiles, color: '#f59e0b' },
          { label: 'Errors Detected', value: kpis.errors, color: '#f43f5e' }
        ].map((kpi, i) => (
          <div key={i} style={{background: '#0b1225', border: `1px solid ${kpi.color}`, borderRadius: '8px', padding: '20px'}}>
            <div style={{fontSize: '12px', color: '#3d5270', marginBottom: '12px'}}>{kpi.label}</div>
            <div style={{fontSize: '24px', fontWeight: 'bold', color: kpi.color, fontFamily: 'Share Tech Mono'}}>
              {kpi.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{display: 'flex', gap: '16px', marginBottom: '24px'}}>
        <div style={{flex: '0 0 60%', background: '#0b1225', border: '1px solid #162040', borderRadius: '8px', padding: '16px'}}>
          <h3 style={{fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', color: '#00e5ff'}}>Live Packet Rate</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <XAxis dataKey="time" stroke="#3d5270" />
              <YAxis stroke="#3d5270" />
              <Tooltip contentStyle={{background: '#0b1225', border: '1px solid #162040'}} />
              <Area type="monotone" dataKey="http" stroke="#00e5ff" fill="#00e5ff20" />
              <Area type="monotone" dataKey="dns" stroke="#a855f7" fill="#a855f720" />
              <Area type="monotone" dataKey="smtp" stroke="#f59e0b" fill="#f59e0b20" />
              <Area type="monotone" dataKey="ftp" stroke="#22c55e" fill="#22c55e20" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{flex: '0 0 40%', background: '#0b1225', border: '1px solid #162040', borderRadius: '8px', padding: '16px'}}>
          <h3 style={{fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', color: '#00e5ff'}}>Protocol Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={[{name: 'HTTP', value: 42}, {name: 'DNS', value: 28}, {name: 'SMTP', value: 18}, {name: 'FTP', value: 12}]} cx="50%" cy="50%" labelLine={false}>
                <Cell fill="#00e5ff" />
                <Cell fill="#a855f7" />
                <Cell fill="#f59e0b" />
                <Cell fill="#22c55e" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Log & Health */}
      <div style={{display: 'flex', gap: '16px'}}>
        <div style={{flex: '0 0 60%', background: '#0b1225', border: '1px solid #162040', borderRadius: '8px', padding: '16px'}}>
          <h3 style={{fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', color: '#00e5ff'}}>Live Log Feed</h3>
          <div style={{fontFamily: 'Share Tech Mono', fontSize: '11px', maxHeight: '280px'}}>
            {logLines.map((line, i) => (
              <div key={i} style={{padding: '4px 0', opacity: 1 - i * 0.08, color: '#cbd5e1'}}>
                {line}
              </div>
            ))}
          </div>
        </div>

        <div style={{flex: '0 0 40%', background: '#0b1225', border: '1px solid #162040', borderRadius: '8px', padding: '16px'}}>
          <h3 style={{fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', color: '#00e5ff'}}>System Health</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {[{label: 'CPU', value: 41}, {label: 'Memory', value: 58}, {label: 'Log File', value: 23}].map((bar, i) => (
              <div key={i}>
                <div style={{fontSize: '11px', color: '#3d5270', marginBottom: '4px'}}>{bar.label}</div>
                <div style={{height: '6px', background: '#03060e', borderRadius: '3px', overflow: 'hidden', border: '1px solid #162040'}}>
                  <div style={{height: '100%', width: `${bar.value}%`, background: '#00e5ff'}} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GeneratorPage({ config, setConfig, cliPreview, genaiOutput, onLaunch, generating }) {
  const [showPass, setShowPass] = useState(false);

  return (
    <div style={{padding: '20px'}}>
      <h1 style={{fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: '#00e5ff', fontFamily: 'Orbitron'}}>Traffic Generator</h1>
      
      <div style={{display: 'flex', gap: '16px'}}>
        <div style={{flex: '0 0 50%', background: '#0b1225', border: '1px solid #162040', borderRadius: '8px', padding: '16px'}}>
          <h3 style={{fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', color: '#00e5ff'}}>Configuration</h3>

          {['http', 'dns', 'smtp', 'ftp'].map(protocol => (
            <div key={protocol} style={{marginBottom: '16px', border: '1px solid #162040', borderRadius: '4px', overflow: 'hidden'}}>
              <div style={{padding: '12px', background: getProtocolColor(protocol) + '20', borderBottom: '1px solid #162040'}}>
                <span style={{color: getProtocolColor(protocol), fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px'}}>
                  {protocol}
                </span>
              </div>
              <div style={{padding: '12px'}}>
                {protocol === 'http' && (
                  <>
                    <div style={{marginBottom: '12px'}}>
                      <label style={{fontSize: '11px', color: '#3d5270', display: 'block', marginBottom: '4px'}}>--http-target</label>
                      <input type="text" value={config.http_target} onChange={(e) => setConfig({...config, http_target: e.target.value})} style={{width: '100%', padding: '8px', background: '#03060e', border: '1px solid #162040', borderRadius: '4px', color: '#cbd5e1', fontFamily: 'Share Tech Mono'}} />
                    </div>
                    <div>
                      <label style={{fontSize: '11px', color: '#3d5270', display: 'block', marginBottom: '4px'}}>--http-count</label>
                      <input type="number" value={config.http_count} onChange={(e) => setConfig({...config, http_count: parseInt(e.target.value)})} style={{width: '100%', padding: '8px', background: '#03060e', border: '1px solid #162040', borderRadius: '4px', color: '#cbd5e1'}} />
                    </div>
                  </>
                )}
                {protocol === 'dns' && (
                  <>
                    <div style={{marginBottom: '12px'}}>
                      <label style={{fontSize: '11px', color: '#3d5270', display: 'block', marginBottom: '4px'}}>--dns-server</label>
                      <input type="text" value={config.dns_server} onChange={(e) => setConfig({...config, dns_server: e.target.value})} style={{width: '100%', padding: '8px', background: '#03060e', border: '1px solid #162040', borderRadius: '4px', color: '#cbd5e1', fontFamily: 'Share Tech Mono'}} />
                    </div>
                    <div>
                      <label style={{fontSize: '11px', color: '#3d5270', display: 'block', marginBottom: '4px'}}>--dns-count</label>
                      <input type="number" value={config.dns_count} onChange={(e) => setConfig({...config, dns_count: parseInt(e.target.value)})} style={{width: '100%', padding: '8px', background: '#03060e', border: '1px solid #162040', borderRadius: '4px', color: '#cbd5e1'}} />
                    </div>
                  </>
                )}
                {protocol === 'smtp' && (
                  <>
                    <div style={{marginBottom: '12px'}}>
                      <label style={{fontSize: '11px', color: '#3d5270', display: 'block', marginBottom: '4px'}}>--smtp-host</label>
                      <input type="text" value={config.smtp_host} onChange={(e) => setConfig({...config, smtp_host: e.target.value})} style={{width: '100%', padding: '8px', background: '#03060e', border: '1px solid #162040', borderRadius: '4px', color: '#cbd5e1', fontFamily: 'Share Tech Mono'}} />
                    </div>
                    <div style={{marginBottom: '12px'}}>
                      <label style={{fontSize: '11px', color: '#3d5270', display: 'block', marginBottom: '4px'}}>--smtp-port</label>
                      <input type="number" value={config.smtp_port} onChange={(e) => setConfig({...config, smtp_port: parseInt(e.target.value)})} style={{width: '100%', padding: '8px', background: '#03060e', border: '1px solid #162040', borderRadius: '4px', color: '#cbd5e1'}} />
                    </div>
                    <div>
                      <label style={{fontSize: '11px', color: '#3d5270', display: 'block', marginBottom: '4px'}}>--smtp-count</label>
                      <input type="number" value={config.smtp_count} onChange={(e) => setConfig({...config, smtp_count: parseInt(e.target.value)})} style={{width: '100%', padding: '8px', background: '#03060e', border: '1px solid #162040', borderRadius: '4px', color: '#cbd5e1'}} />
                    </div>
                  </>
                )}
                {protocol === 'ftp' && (
                  <>
                    <div style={{marginBottom: '12px'}}>
                      <label style={{fontSize: '11px', color: '#3d5270', display: 'block', marginBottom: '4px'}}>--ftp-host</label>
                      <input type="text" value={config.ftp_host} onChange={(e) => setConfig({...config, ftp_host: e.target.value})} style={{width: '100%', padding: '8px', background: '#03060e', border: '1px solid #162040', borderRadius: '4px', color: '#cbd5e1', fontFamily: 'Share Tech Mono'}} />
                    </div>
                    <div>
                      <label style={{fontSize: '11px', color: '#3d5270', display: 'block', marginBottom: '4px'}}>--ftp-count</label>
                      <input type="number" value={config.ftp_count} onChange={(e) => setConfig({...config, ftp_count: parseInt(e.target.value)})} style={{width: '100%', padding: '8px', background: '#03060e', border: '1px solid #162040', borderRadius: '4px', color: '#cbd5e1'}} />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}

          <div style={{background: '#03060e', border: '1px solid #162040', borderRadius: '4px', padding: '12px', marginTop: '16px', position: 'relative'}}>
            <pre style={{fontFamily: 'Share Tech Mono', fontSize: '10px', color: '#00e5ff', margin: 0, whiteSpace: 'pre-wrap'}}>{cliPreview}</pre>
            <button onClick={() => navigator.clipboard.writeText(cliPreview)} style={{position: 'absolute', top: '8px', right: '8px', background: '#00e5ff20', border: '1px solid #00e5ff', color: '#00e5ff', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer'}}>
              <Copy size={12} style={{display: 'inline', marginRight: '4px'}} /> Copy
            </button>
          </div>

          <button onClick={onLaunch} disabled={generating} style={{width: '100%', padding: '12px', marginTop: '20px', background: 'linear-gradient(90deg, #00e5ff, #a855f7)', border: 'none', color: 'white', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer', opacity: generating ? 0.7 : 1}}>
            {generating ? '⚡ GENERATING...' : '▶ LAUNCH TRAFFIC GENERATION'}
          </button>
        </div>

        <div style={{flex: '0 0 50%', background: '#0b1225', border: '1px solid #162040', borderRadius: '8px', padding: '16px'}}>
          <h3 style={{fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', color: '#00e5ff'}}>GenAIContentEngine Output</h3>
          <div style={{background: '#03060e', border: '1px solid #162040', borderRadius: '4px', overflow: 'hidden'}}>
            <div style={{padding: '8px 12px', background: '#00e5ff10', borderBottom: '1px solid #162040', fontFamily: 'Share Tech Mono', fontSize: '11px', color: '#00e5ff'}}>
              GenAIContentEngine <span style={{animation: 'pulse 1s infinite'}}>█</span>
            </div>
            <pre style={{padding: '12px', margin: 0, fontFamily: 'Share Tech Mono', fontSize: '10px', color: '#00e5ff', maxHeight: '280px', overflow: 'auto', whiteSpace: 'pre-wrap'}}>
              {JSON.stringify(genaiOutput, null, 2)}
            </pre>
            <div style={{padding: '8px 12px', borderTop: '1px solid #162040', display: 'flex', gap: '12px', fontSize: '10px', color: '#3d5270', fontFamily: 'Share Tech Mono'}}>
              <span>Gen time: 18ms</span>
              <span>Tokens: 142</span>
              <span>Model: GenAIContentEngine</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MonitorPage({ protocolLogs }) {
  return (
    <div style={{padding: '20px'}}>
      <h1 style={{fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: '#00e5ff', fontFamily: 'Orbitron'}}>Protocol Monitor</h1>
      
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px'}}>
        {['http', 'dns', 'smtp', 'ftp'].map(protocol => (
          <div key={protocol} style={{background: '#0b1225', border: `1px solid ${getProtocolColor(protocol)}`, borderRadius: '8px', overflow: 'hidden', minHeight: '500px', display: 'flex', flexDirection: 'column'}}>
            <div style={{padding: '12px', background: getProtocolColor(protocol) + '20', borderColor: getProtocolColor(protocol), borderBottom: '2px solid'}}>
              <div style={{color: getProtocolColor(protocol), fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px'}}>
                {protocol} | PORT {protocol === 'http' ? '80/443' : protocol === 'dns' ? '53' : protocol === 'smtp' ? '25/1025' : '21/2121'}
              </div>
              <div style={{color: '#22c55e', fontSize: '12px', marginTop: '4px'}}>↓ {Math.floor(Math.random() * 100)} pkt/s</div>
            </div>
            <div style={{flex: 1, fontFamily: 'Share Tech Mono', fontSize: '10px', overflow: 'auto', padding: '12px'}}>
              {protocolLogs[protocol].map((line, i) => (
                <div key={i} style={{opacity: 1 - i * 0.08, color: '#cbd5e1', marginBottom: '4px'}}>
                  {line}
                </div>
              ))}
            </div>
            <div style={{padding: '12px', borderTop: '1px solid #162040', display: 'flex', gap: '8px'}}>
              <button style={{flex: 1, padding: '6px', background: '#00e5ff10', border: '1px solid #00e5ff', color: '#00e5ff', borderRadius: '4px', fontSize: '10px', cursor: 'pointer'}}>⏸ PAUSE</button>
              <button style={{flex: 1, padding: '6px', background: '#00e5ff10', border: '1px solid #00e5ff', color: '#00e5ff', borderRadius: '4px', fontSize: '10px', cursor: 'pointer'}}>▶ RESUME</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GenAIPage() {
  return (
    <div style={{padding: '20px'}}>
      <h1 style={{fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: '#00e5ff', fontFamily: 'Orbitron'}}>GenAI Engine</h1>
      
      <div style={{background: '#0b1225', border: '1px solid #162040', borderRadius: '8px', padding: '12px', marginBottom: '20px', fontFamily: 'Share Tech Mono', fontSize: '11px', color: '#3d5270'}}>
        GenAIContentEngine v1.0 | Mode: Simulated LLM | Calls: 1,204 | Avg: 18ms | Uptime: 00:14:32
      </div>

      <div style={{display: 'flex', gap: '16px', marginBottom: '20px'}}>
        <div style={{flex: '0 0 50%', background: '#0b1225', border: '1px solid #162040', borderRadius: '8px', padding: '16px'}}>
          <h3 style={{fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', color: '#00e5ff'}}>Prompt Template</h3>
          <div style={{background: '#03060e', border: '1px solid #162040', borderRadius: '4px', padding: '12px', fontFamily: 'Share Tech Mono', fontSize: '10px', color: '#00e5ff', maxHeight: '200px', overflow: 'auto'}}>
            <pre>{`Generate a realistic HTTP REST API request.
Include: method, endpoint, headers, body, user_agent, delay_ms.
Scenario: E-commerce checkout flow
Context: High-traffic financial application.
Output: valid JSON only.`}</pre>
          </div>
          <button style={{width: '100%', marginTop: '12px', padding: '8px', background: '#00e5ff10', border: '1px solid #00e5ff', color: '#00e5ff', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold'}}>✎ EDIT TEMPLATE</button>
        </div>

        <div style={{flex: '0 0 50%', background: '#0b1225', border: '1px solid #162040', borderRadius: '8px', padding: '16px'}}>
          <h3 style={{fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', color: '#00e5ff'}}>Generation History</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflow: 'auto'}}>
            {[
              {time: '10:23:04', protocol: 'HTTP', score: 92},
              {time: '10:23:02', protocol: 'DNS', score: 78},
              {time: '10:23:00', protocol: 'SMTP', score: 85},
              {time: '10:22:58', protocol: 'FTP', score: 71}
            ].map((item, i) => (
              <div key={i} style={{padding: '8px', background: '#03060e', border: '1px solid #162040', borderRadius: '4px'}}>
                <div style={{fontSize: '11px', marginBottom: '4px', color: getProtocolColor(item.protocol.toLowerCase()), fontWeight: 'bold'}}>
                  {item.time} {item.protocol}
                </div>
                <div style={{height: '4px', background: '#162040', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px'}}>
                  <div style={{height: '100%', width: `${item.score}%`, background: item.score > 80 ? '#22c55e' : '#f59e0b'}} />
                </div>
                <span style={{fontSize: '10px', color: '#3d5270'}}>{item.score}% • 18ms</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{background: '#0b1225', border: '1px solid #162040', borderRadius: '8px', padding: '16px'}}>
        <h3 style={{fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', color: '#00e5ff'}}>Feedback Loop</h3>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '20px', overflow: 'auto'}}>
          {['Generate', 'Emit', 'Capture', 'Score', 'Re-Prompt'].map((step, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
              <div style={{padding: '12px 16px', border: '1px solid #162040', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', background: '#00e5ff10', color: '#00e5ff'}}>
                {step}
              </div>
              {i < 4 && <div style={{width: '30px', height: '2px', background: '#00e5ff'}} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LogsPage({ allLogs, logFilter, logSearch, setLogSearch }) {
  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear all logs?')) {
      // In production, call API endpoint to clear logs
      console.log('Logs cleared');
    }
  };

  const handleDownloadLogs = () => {
    // Fetch logs from backend API
    fetch(`${API_URL}/api/logs`)
      .then(res => res.json())
      .then(data => {
        const logContent = data.logs.join('\n');
        const blob = new Blob([logContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `traffic_log_${new Date().toISOString().split('T')[0]}_${new Date().toLocaleTimeString('en-US', {hour12: false}).replace(/:/g, '-')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('Logs downloaded successfully');
      })
      .catch(err => {
        console.error('Failed to download logs:', err);
        alert('Failed to download logs. Check console for errors.');
      });
  };

  return (
    <div style={{padding: '20px'}}>
      <h1 style={{fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: '#00e5ff', fontFamily: 'Orbitron'}}>Log Viewer</h1>
      
      <div style={{display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center'}}>
        <input type="text" placeholder="Search logs..." value={logSearch} onChange={(e) => setLogSearch(e.target.value)} style={{flex: 1, padding: '8px 12px', background: '#0b1225', border: '1px solid #162040', color: '#cbd5e1', borderRadius: '4px', fontFamily: 'Share Tech Mono'}} />
        <select onChange={(e) => logFilter(e.target.value)} style={{padding: '8px 12px', background: '#0b1225', border: '1px solid #162040', color: '#cbd5e1', borderRadius: '4px', cursor: 'pointer'}}>
          {['ALL', 'HTTP', 'DNS', 'SMTP', 'FTP', 'ERROR'].map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <button onClick={handleClearLogs} style={{padding: '8px 12px', background: '#f43f5e20', border: '1px solid #f43f5e', color: '#f43f5e', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s'}}>🗑 CLEAR</button>
        <button onClick={handleDownloadLogs} style={{padding: '8px 12px', background: '#22c55e20', border: '1px solid #22c55e', color: '#22c55e', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s'}}>⬇ DOWNLOAD</button>
      </div>

      <div style={{background: '#000', border: '2px solid #22c55e', borderRadius: '8px', height: '600px', overflow: 'auto', padding: '12px'}}>
        <div style={{fontFamily: 'Share Tech Mono', fontSize: '11px', color: '#22c55e', lineHeight: '1.6'}}>
          {allLogs.slice(0, 50).map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </div>

      <div style={{padding: '12px', background: '#0b1225', border: '1px solid #162040', borderRadius: '0 0 8px 8px', fontSize: '11px', color: '#3d5270', fontFamily: 'Share Tech Mono'}}>
        Lines: {allLogs.length} | Errors: 7 | Last: {new Date().toLocaleTimeString('en-US', {hour12: false})} | Size: 2.3 MB
      </div>
    </div>
  );
}

function ConfigPage() {
  const [showPass, setShowPass] = useState(false);

  const handleRunTests = () => {
    alert('Running tests would execute: pytest tests/ -v\n\nIn deployment, this would show test results here.');
  };

  const handleExportConfig = () => {
    const configData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      defaults: {
        http_target: 'http://httpbin.org',
        dns_server: '8.8.8.8',
        smtp_host: 'localhost',
        smtp_port: 1025,
        ftp_host: 'ftp.dlptest.com',
        ftp_credentials: {
          user: 'dlpuser',
          pass: 'rNrKYTX9g7z3RgJRmxWuGHbeu'
        }
      }
    };
    
    const dataStr = JSON.stringify(configData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `genai-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('Config exported successfully');
  };

  return (
    <div style={{padding: '20px'}}>
      <h1 style={{fontSize: '28px', fontWeight: 'bold', marginBottom: '20px', color: '#00e5ff', fontFamily: 'Orbitron'}}>Configuration</h1>
      
      <div style={{display: 'flex', gap: '16px', marginBottom: '20px'}}>
        <div style={{flex: '0 0 50%', background: '#0b1225', border: '1px solid #162040', borderRadius: '8px', padding: '16px'}}>
          <h3 style={{fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', color: '#00e5ff'}}>Default Targets</h3>
          {[
            { label: 'HTTP Target', value: 'http://httpbin.org' },
            { label: 'DNS Server', value: '8.8.8.8' },
            { label: 'SMTP Host', value: 'localhost:1025' },
            { label: 'FTP Host', value: 'ftp.dlptest.com' }
          ].map((item, i) => (
            <div key={i} style={{marginBottom: '16px'}}>
              <label style={{fontSize: '11px', color: '#3d5270', display: 'block', marginBottom: '4px'}}>{item.label}</label>
              <input type="text" defaultValue={item.value} style={{width: '100%', padding: '8px', background: '#03060e', border: '1px solid #162040', borderRadius: '4px', color: '#cbd5e1', fontFamily: 'Share Tech Mono'}} />
            </div>
          ))}
        </div>

        <div style={{flex: '0 0 50%', background: '#0b1225', border: '1px solid #162040', borderRadius: '8px', padding: '16px'}}>
          <h3 style={{fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', color: '#00e5ff'}}>Test Server Setup</h3>
          <div style={{background: '#03060e', border: '1px solid #162040', borderRadius: '4px', padding: '12px', fontFamily: 'Share Tech Mono', fontSize: '10px', color: '#00e5ff'}}>
            <pre>{`# SMTP debug server
python3 -m aiosmtpd -n -l localhost:1025

# FTP local server
python3 -m pyftpdlib -p 2121`}</pre>
          </div>
        </div>
      </div>

      <div style={{background: '#0b1225', border: '1px solid #162040', borderRadius: '8px', padding: '16px', marginBottom: '20px'}}>
        <h3 style={{fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', color: '#00e5ff'}}>FTP Test Credentials</h3>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px'}}>
          <div>
            <label style={{fontSize: '11px', color: '#3d5270', display: 'block', marginBottom: '4px'}}>Host</label>
            <input type="text" defaultValue="ftp.dlptest.com" style={{width: '100%', padding: '8px', background: '#03060e', border: '1px solid #162040', borderRadius: '4px', color: '#cbd5e1'}} />
          </div>
          <div>
            <label style={{fontSize: '11px', color: '#3d5270', display: 'block', marginBottom: '4px'}}>User</label>
            <input type="text" defaultValue="dlpuser" style={{width: '100%', padding: '8px', background: '#03060e', border: '1px solid #162040', borderRadius: '4px', color: '#cbd5e1'}} />
          </div>
          <div>
            <label style={{fontSize: '11px', color: '#3d5270', display: 'block', marginBottom: '4px'}}>Password</label>
            <div style={{display: 'flex', gap: '8px'}}>
              <input type={showPass ? "text" : "password"} defaultValue="rNrKYTX9g7z3RgJRmxWuGHbeu" style={{flex: 1, padding: '8px', background: '#03060e', border: '1px solid #162040', borderRadius: '4px', color: '#cbd5e1'}} />
              <button onClick={() => setShowPass(!showPass)} style={{padding: '8px 12px', background: '#00e5ff10', border: '1px solid #00e5ff', color: '#00e5ff', borderRadius: '4px', cursor: 'pointer'}}>
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{background: '#0b1225', border: '1px solid #162040', borderRadius: '8px', padding: '16px'}}>
        <h3 style={{fontSize: '14px', fontWeight: 'bold', marginBottom: '16px', color: '#00e5ff'}}>Tools</h3>
        <div style={{display: 'flex', gap: '12px'}}>
          <button onClick={handleRunTests} style={{flex: 1, padding: '12px', background: 'linear-gradient(90deg, #a855f7, #f59e0b)', border: 'none', color: 'white', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s'}}>
            ▶ Run Tests
          </button>
          <button onClick={handleExportConfig} style={{flex: 1, padding: '12px', background: 'linear-gradient(90deg, #22c55e, #00e5ff)', border: 'none', color: 'white', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s'}}>
            ⬇ Export Config
          </button>
        </div>
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setMenuOpen] = useState(true);
  const [time, setTime] = useState(new Date());
  const [trafficRunning, setTrafficRunning] = useState(false);
  
  const [kpis, setKpis] = useState({ packets: 0, sessions: 0, profiles: 0, errors: 0 });
  const [chartData, setChartData] = useState(generateChartData());
  const [logLines, setLogLines] = useState([]);
  
  const [config, setConfig] = useState({
    http_target: 'http://httpbin.org',
    http_count: 10,
    dns_server: '8.8.8.8',
    dns_count: 10,
    smtp_host: 'localhost',
    smtp_port: 1025,
    smtp_count: 5,
    ftp_host: 'ftp.dlptest.com',
    ftp_count: 5,
    enable_all: true
  });
  const [genaiOutput, setGenaiOutput] = useState(mockPayloads[0]);
  const [payloadIndex, setPayloadIndex] = useState(0);
  const [protocolLogs, setProtocolLogs] = useState({http: [], dns: [], smtp: [], ftp: []});
  const [allLogs, setAllLogs] = useState([]);
  const [logFilter, setLogFilter] = useState('ALL');
  const [logSearch, setLogSearch] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const targetKpis = { packets: 847293, sessions: 142, profiles: 1204, errors: 7 };
    let current = { packets: 0, sessions: 0, profiles: 0, errors: 0 };
    const duration = 1800;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      current = {
        packets: Math.floor(targetKpis.packets * easeOut),
        sessions: Math.floor(targetKpis.sessions * easeOut),
        profiles: Math.floor(targetKpis.profiles * easeOut),
        errors: Math.floor(targetKpis.errors * easeOut)
      };
      setKpis(current);

      if (progress < 1) requestAnimationFrame(animate);
    };
    animate();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => {
        const newData = [...prev.slice(1)];
        newData.push({
          time: `${newData.length}`,
          http: Math.floor(Math.random() * 100),
          dns: Math.floor(Math.random() * 80),
          smtp: Math.floor(Math.random() * 60),
          ftp: Math.floor(Math.random() * 50)
        });
        return newData;
      });

      const protocols = ['HTTP', 'DNS', 'SMTP', 'FTP'];
      const protocol = protocols[Math.floor(Math.random() * 4)];
      const newLog = generateMockLogLine(protocol);
      setLogLines(prev => [newLog, ...prev.slice(0, 11)]);
      setAllLogs(prev => [newLog, ...prev]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPayloadIndex(prev => (prev + 1) % mockPayloads.length);
      setGenaiOutput(mockPayloads[(payloadIndex + 1) % mockPayloads.length]);
    }, 3000);
    return () => clearInterval(interval);
  }, [payloadIndex]);

  useEffect(() => {
    const intervals = {
      http: setInterval(() => addProtocolLog('http'), 800),
      dns: setInterval(() => addProtocolLog('dns'), 1000),
      smtp: setInterval(() => addProtocolLog('smtp'), 1200),
      ftp: setInterval(() => addProtocolLog('ftp'), 900)
    };
    return () => Object.values(intervals).forEach(i => clearInterval(i));
  }, []);

  const addProtocolLog = (protocol) => {
    const lines = {
      http: `${new Date().toLocaleTimeString('en-US', {hour12: false})} POST /api/users → 200 OK`,
      dns: `${new Date().toLocaleTimeString('en-US', {hour12: false})} QUERY api.service.ai → 142.250.80.4`,
      smtp: `${new Date().toLocaleTimeString('en-US', {hour12: false})} SENT john@ → alice@ → 250 OK`,
      ftp: `${new Date().toLocaleTimeString('en-US', {hour12: false})} LIST /uploads/ → success`
    };
    setProtocolLogs(prev => ({
      ...prev,
      [protocol]: [lines[protocol], ...prev[protocol].slice(0, 13)]
    }));
  };

  const handleLaunchTraffic = async () => {
    setTrafficRunning(true);
    try {
      const response = await fetch(`${API_URL}/api/traffic/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await response.json();
      if (response.ok) {
        console.log('✓ Traffic started:', data);
        // Keep running for 5 seconds before clearing the UI
        setTimeout(() => setTrafficRunning(false), 5000);
      } else {
        console.error('Traffic start failed:', data);
        setTrafficRunning(false);
      }
    } catch (e) {
      console.error('API error:', e);
      alert(`Error: ${e.message}`);
      setTrafficRunning(false);
    }
  };

  const handleStopAll = async () => {
    try {
      const response = await fetch(`${API_URL}/api/traffic/stop`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (response.ok) {
        console.log('✓ Traffic stopped:', data);
        setTrafficRunning(false);
      } else {
        console.warn('Stop response:', data);
        setTrafficRunning(false);
      }
    } catch (e) {
      console.error('Stop error:', e);
      alert(`Error stopping traffic: ${e.message}`);
    }
  };

  const cliPreview = buildCliCommand(config);
  const filteredLogs = allLogs.filter(log => {
    const matchFilter = logFilter === 'ALL' || log.includes(logFilter);
    const matchSearch = logSearch === '' || log.toLowerCase().includes(logSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div style={{background: '#03060e', color: '#cbd5e1', fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      <style>{`
        :root { --http: #00e5ff; --dns: #a855f7; --smtp: #f59e0b; --ftp: #22c55e; }
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Share+Tech+Mono&family=Inter:wght@400;600&display=swap');
        * { box-sizing: border-box; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0b1225; } ::-webkit-scrollbar-thumb { background: #00e5ff; }
      `}</style>

      {/* HEADER */}
      <header style={{background: '#070d1c', borderBottom: '1px solid #162040', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px', flex: 1}}>
          <button onClick={() => setMenuOpen(!sidebarOpen)} style={{background: 'none', border: 'none', color: '#00e5ff', cursor: 'pointer', fontSize: '20px'}}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#00e5ff', fontFamily: 'Orbitron', fontSize: '18px', fontWeight: 'bold'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <span>GENTRAFFIC</span>
          </div>
          <span style={{fontSize: '11px', color: '#3d5270', fontFamily: 'Share Tech Mono'}}>AI Network Simulation Engine v1.0</span>
        </div>

        <div style={{display: 'flex', gap: '12px', flex: 1.5}}>
          {[{label: 'HTTP', color: '#00e5ff', active: true}, {label: 'DNS', color: '#a855f7', active: true}, {label: 'SMTP', color: '#f59e0b', active: false}, {label: 'FTP', color: '#22c55e', active: false}].map(pill => (
            <div key={pill.label} style={{display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', border: `1px solid ${pill.color}`, borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', background: pill.active ? pill.color + '20' : 'transparent', boxShadow: pill.active ? `0 0 10px ${pill.color}60` : 'none'}}>
              <div style={{width: '8px', height: '8px', borderRadius: '50%', background: pill.color, animation: pill.active ? 'pulse 1.5s infinite' : 'none'}} />
              <span style={{color: pill.color}}>{pill.label}</span>
            </div>
          ))}
        </div>

        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <div style={{fontSize: '12px', fontFamily: 'Share Tech Mono', color: '#00e5ff'}}>{time.toLocaleTimeString()}</div>
          <button onClick={handleStopAll} style={{display: 'flex', alignItems: 'center', padding: '6px 12px', border: '1px solid #f43f5e', borderRadius: '4px', color: '#f43f5e', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', background: trafficRunning ? '#f43f5e' : '#1a1a2e', boxShadow: trafficRunning ? '0 0 20px #f43f5e80' : 'none'}}>
            <Square size={16} style={{marginRight: '6px'}} />
            STOP
          </button>
        </div>
      </header>

      <div style={{display: 'flex', flex: 1, overflow: 'hidden'}}>
        {/* SIDEBAR */}
        <aside style={{background: '#070d1c', borderRight: '1px solid #162040', padding: '20px 12px', display: 'flex', flexDirection: 'column', width: sidebarOpen ? '220px' : '60px', transition: 'width 0.3s', overflow: 'hidden'}}>
          <nav style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '8px'}}>
            {[{id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard'}, {id: 'generator', icon: Zap, label: 'Traffic Generator'}, {id: 'monitor', icon: Activity, label: 'Protocol Monitor'}, {id: 'genai', icon: Brain, label: 'GenAI Engine'}, {id: 'logs', icon: ScrollText, label: 'Log Viewer'}, {id: 'config', icon: Settings, label: 'Configuration'}].map(item => {
              const Icon = item.icon;
              return (
                <button key={item.id} onClick={() => setCurrentPage(item.id)} style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: 'none', borderLeft: `3px solid ${currentPage === item.id ? '#00e5ff' : 'transparent'}`, background: currentPage === item.id ? '#00e5ff10' : 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '13px', borderRadius: '4px', transition: 'all 0.3s'}}>
                  <Icon size={20} />
                  {sidebarOpen && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 12px', borderTop: '1px solid #162040'}}>
            <div style={{width: '40px', height: '40px', borderRadius: '50%', background: '#00e5ff20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: '#00e5ff'}}>SN</div>
            {sidebarOpen && <div>
              <div style={{fontSize: '12px', fontWeight: 'bold'}}>Sky</div>
              <div style={{fontSize: '10px', color: '#3d5270'}}>Network Engineer</div>
            </div>}
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{flex: 1, overflow: 'auto', padding: '24px', background: 'radial-gradient(circle at 20% 50%, rgba(0, 229, 255, 0.03) 0%, transparent 50%), #03060e'}}>
          {currentPage === 'dashboard' && <DashboardPage kpis={kpis} chartData={chartData} logLines={logLines} />}
          {currentPage === 'generator' && <GeneratorPage config={config} setConfig={setConfig} cliPreview={cliPreview} genaiOutput={genaiOutput} onLaunch={handleLaunchTraffic} generating={trafficRunning} />}
          {currentPage === 'monitor' && <MonitorPage protocolLogs={protocolLogs} />}
          {currentPage === 'genai' && <GenAIPage />}
          {currentPage === 'logs' && <LogsPage allLogs={filteredLogs} logFilter={setLogFilter} logSearch={logSearch} setLogSearch={setLogSearch} />}
          {currentPage === 'config' && <ConfigPage />}
        </main>
      </div>
    </div>
  );
}
