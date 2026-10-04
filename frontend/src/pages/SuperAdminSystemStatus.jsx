import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../Components/Navbar';
import { API_BASE, WS_BASE } from '../config';
import { ensureCsrfToken } from '../csrf';

/**
 * Super Admin System Status & Real-Time Diagnostics
 * 
 * Provides platform administrators with live infrastructure health insights:
 * 1. Database connection telemetry (Engine, Provider detection: Render PostgreSQL / Supabase / AWS / SQLite, latency)
 * 2. ASGI WebSocket channel layer and MediaPipe Pose Tracking verification
 * 3. Interactive live diagnostic test suite (Client-to-Server WS Handshake + DB Latency Ping + Pose Engine Math)
 * 4. Production security headers and environment auditing
 */
export default function SuperAdminSystemStatus() {
  // Telemetry data state fetched from /api/superadmin/system-status/
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Live diagnostics execution state
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState(null);
  const [wsTestStatus, setWsTestStatus] = useState(null); // { status: 'idle' | 'testing' | 'success' | 'failed', latency: number, message: string }

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/superadmin/system-status/`, {
        credentials: 'include',
      });
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Access denied: Super Admin authentication required.');
        }
        throw new Error(`Failed to load system status (HTTP ${res.status})`);
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message || 'Error fetching system status.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Live WebSocket Probe from Browser
  const testBrowserWebSocket = () => {
    return new Promise((resolve) => {
      setWsTestStatus({ status: 'testing', message: 'Connecting to WebSocket route...' });
      const t0 = performance.now();
      let socket;
      let timeoutId;

      try {
        socket = new WebSocket(`${WS_BASE}/ws/exercise/`);

        timeoutId = setTimeout(() => {
          if (socket && socket.readyState !== WebSocket.OPEN) {
            socket.close();
            const res = {
              status: 'failed',
              latency: 5000,
              message: 'Connection timed out after 5000ms. Verify ASGI/Daphne service.',
            };
            setWsTestStatus(res);
            resolve(res);
          }
        }, 5000);

        socket.onopen = () => {
          clearTimeout(timeoutId);
          const latency = Math.round(performance.now() - t0);
          const res = {
            status: 'success',
            latency,
            message: `Handshake successful (${latency}ms round-trip). ASGI WebSocket channel active.`,
          };
          setWsTestStatus(res);
          socket.close();
          resolve(res);
        };

        socket.onerror = () => {
          clearTimeout(timeoutId);
          const res = {
            status: 'failed',
            latency: Math.round(performance.now() - t0),
            message: 'WebSocket connection failed. Verify host routing and SSL/TLS certificates.',
          };
          setWsTestStatus(res);
          resolve(res);
        };
      } catch (err) {
        clearTimeout(timeoutId);
        const res = {
          status: 'failed',
          latency: 0,
          message: err.message || 'Error initiating WebSocket probe.',
        };
        setWsTestStatus(res);
        resolve(res);
      }
    });
  };

  // Run Backend & Frontend Diagnostics
  const handleRunFullDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    try {
      // 1. Run live browser WebSocket probe
      const wsResult = await testBrowserWebSocket();

      // 2. Call backend diagnostic API
      const csrfToken = await ensureCsrfToken();
      const res = await fetch(`${API_BASE}/api/superadmin/system-diagnostics/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
      });

      if (!res.ok) {
        throw new Error(`Diagnostics endpoint returned HTTP ${res.status}`);
      }

      const json = await res.json();
      
      // Combine with browser websocket result
      const combinedResults = [
        {
          name: 'Client-to-Server WebSocket Handshake',
          status: wsResult.status === 'success' ? 'PASSED' : 'FAILED',
          latency_ms: wsResult.latency,
          details: wsResult.message,
        },
        ...(json.results || []),
      ];

      setDiagnosticResults({
        timestamp: json.timestamp || new Date().toISOString(),
        success: json.success && wsResult.status === 'success',
        results: combinedResults,
      });

      // Refresh status telemetry
      fetchStatus();
    } catch (err) {
      alert(`Diagnostics error: ${err.message}`);
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  const getProviderBadge = (providerType, providerName) => {
    switch (providerType) {
      case 'render':
        return {
          label: providerName,
          color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
          icon: '🚀',
        };
      case 'supabase':
        return {
          label: providerName,
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          icon: '⚡',
        };
      case 'aws':
        return {
          label: providerName,
          color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
          icon: '☁️',
        };
      case 'neon':
        return {
          label: providerName,
          color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
          icon: '🟢',
        };
      case 'railway':
        return {
          label: providerName,
          color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30',
          icon: '🚂',
        };
      case 'sqlite':
        return {
          label: providerName,
          color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
          icon: '💾',
        };
      default:
        return {
          label: providerName || 'PostgreSQL',
          color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
          icon: '🗄️',
        };
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-gray-100 to-indigo-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 text-gray-800 dark:text-gray-100 font-[Inter] transition-colors duration-300">
      <Navbar role="superadmin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Top Header & Action Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-6 rounded-3xl border border-white/60 dark:border-gray-700/60 shadow-xl">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl text-2xl border border-purple-500/20 shadow-sm">
                ⚙️
              </span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                  System Health & Environment Status
                </h1>
                <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                  Real-time runtime telemetry, database engine detection, WebSocket ASGI routing, and AI pose tracking diagnostics.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={fetchStatus}
              disabled={loading || isRunningDiagnostics}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-gray-100 dark:bg-gray-700/70 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-200 border border-gray-300/50 dark:border-gray-600/50 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>

            <button
              onClick={handleRunFullDiagnostics}
              disabled={loading || isRunningDiagnostics}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25 transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isRunningDiagnostics ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Running Check...
                </>
              ) : (
                <>
                  <span>🧪</span>
                  Run Full Diagnostics
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-600 dark:text-red-400 text-sm font-semibold flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Diagnostics Results Banner (if ran) */}
        {diagnosticResults && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-3xl border border-purple-500/30 dark:border-purple-500/30 shadow-xl space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-700/60 pb-3">
              <div className="flex items-center gap-2.5">
                <span className={`w-3 h-3 rounded-full ${diagnosticResults.success ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <h2 className="text-lg font-black text-gray-900 dark:text-white">
                  Diagnostic Suite Results
                </h2>
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md border ${
                  diagnosticResults.success
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                }`}>
                  {diagnosticResults.success ? 'ALL CHECKS PASSED' : 'CHECK WITH WARNINGS/ISSUES'}
                </span>
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Executed: {diagnosticResults.timestamp}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {diagnosticResults.results.map((res, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-900/60 border border-gray-200/70 dark:border-gray-800 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{res.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{res.details}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`px-2 py-0.5 text-[10px] font-black tracking-wider uppercase rounded-md border ${
                      res.status === 'PASSED'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : res.status === 'WARNING'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                    }`}>
                      {res.status}
                    </span>
                    {res.latency_ms !== undefined && res.latency_ms >= 0 && (
                      <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                        {res.latency_ms} ms
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && !data ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Gathering system telemetry & database configuration...
            </p>
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 1. Database & Cloud Provider Card (lg:col-span-7) */}
            <div className="lg:col-span-7 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-6 rounded-3xl border border-white/60 dark:border-gray-700/60 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-gray-200/80 dark:border-gray-700/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🗄️</span>
                  <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                    Database Engine & Cloud Service Provider
                  </h2>
                </div>
                {(() => {
                  const badge = getProviderBadge(data.database.provider_type, data.database.provider);
                  return (
                    <span className={`px-3 py-1 text-xs font-bold rounded-xl border flex items-center gap-1.5 shadow-sm ${badge.color}`}>
                      <span>{badge.icon}</span>
                      <span>{badge.label}</span>
                    </span>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Engine</p>
                  <p className="text-sm font-black text-gray-800 dark:text-gray-100 mt-1">{data.database.engine}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Query Latency</p>
                  <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    {data.database.latency_ms >= 0 ? `${data.database.latency_ms} ms` : 'Error'}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Health Status</p>
                  <p className="text-sm font-black text-purple-600 dark:text-purple-400 mt-1">
                    {data.database.is_healthy ? 'HEALTHY' : 'DEGRADED'}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Host Node</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1 truncate" title={data.database.host}>
                    {data.database.host}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Port</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">{data.database.port}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Database User</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">{data.database.user}</p>
                </div>
              </div>

              {/* Records Breakdown */}
              <div className="pt-2">
                <p className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5">
                  Stored Records in Database
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-800/40 text-center">
                    <p className="text-lg font-black text-purple-600 dark:text-purple-400">{data.database.records.users}</p>
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Users</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40 text-center">
                    <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{data.database.records.hospitals}</p>
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Hospitals</p>
                  </div>
                  <div className="p-3 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/50 dark:border-cyan-800/40 text-center">
                    <p className="text-lg font-black text-cyan-600 dark:text-cyan-400">{data.database.records.doctors}</p>
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Doctors</p>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/40 text-center">
                    <p className="text-lg font-black text-blue-600 dark:text-blue-400">{data.database.records.patients}</p>
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Patients</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. WebSocket & Channels Layer (lg:col-span-5) */}
            <div className="lg:col-span-5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-6 rounded-3xl border border-white/60 dark:border-gray-700/60 shadow-xl space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200/80 dark:border-gray-700/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">📡</span>
                    <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                      WebSocket & Channels Layer
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    ACTIVE
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-700/50">
                    <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ASGI Application</p>
                    <p className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{data.websocket.asgi_application}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-700/50">
                    <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Channel Layer Backend</p>
                    <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{data.websocket.channel_layer_type}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-700/50">
                    <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">WebSocket Endpoint Route</p>
                    <p className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 mt-0.5">{data.websocket.websocket_route}</p>
                  </div>
                </div>
              </div>

              {/* Browser-to-Server Live Probe */}
              <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-300">Live Browser Probe</span>
                  <button
                    onClick={testBrowserWebSocket}
                    disabled={wsTestStatus?.status === 'testing'}
                    className="px-3 py-1 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition disabled:opacity-50 cursor-pointer"
                  >
                    {wsTestStatus?.status === 'testing' ? 'Testing...' : 'Probe WebSocket'}
                  </button>
                </div>
                {wsTestStatus && (
                  <p className={`text-xs font-medium ${
                    wsTestStatus.status === 'success'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : wsTestStatus.status === 'testing'
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {wsTestStatus.message}
                  </p>
                )}
              </div>
            </div>

            {/* 3. AI Pose Tracking & Computer Vision Engine (lg:col-span-12) */}
            <div className="lg:col-span-12 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-6 rounded-3xl border border-white/60 dark:border-gray-700/60 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 dark:border-gray-700/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🦾</span>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                      AI Pose Tracking & MediaPipe Biomechanical Engine
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Real-time skeletal joint angle calculation, posture threshold evaluation, and state machine rep counters.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 text-xs font-bold rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                    OpenCV: {data.pose_tracking.opencv_version}
                  </span>
                  <span className="px-3 py-1 text-xs font-bold rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                    {data.pose_tracking.detectors_count} Detectors Active
                  </span>
                </div>
              </div>

              {/* Detectors Table */}
              <div className="overflow-x-auto rounded-2xl border border-gray-200/80 dark:border-gray-700/80">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-gray-100/80 dark:bg-gray-900/80 text-gray-600 dark:text-gray-300 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Exercise Detector</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Tracked Landmarks & Joints</th>
                      <th className="py-3 px-4">Biomechanical Angle Logic</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/60 dark:divide-gray-800">
                    {data.pose_tracking.detectors.map((det) => (
                      <tr key={det.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-750/50 transition">
                        <td className="py-3.5 px-4 font-black text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs">
                            {det.id}
                          </span>
                          {det.name}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-gray-600 dark:text-gray-300">
                          {det.category}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-purple-600 dark:text-purple-400">
                          {det.tracked_joints}
                        </td>
                        <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300">
                          {det.type}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {det.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Server Runtime & Security Environment (lg:col-span-12) */}
            <div className="lg:col-span-12 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-6 rounded-3xl border border-white/60 dark:border-gray-700/60 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-gray-200/80 dark:border-gray-700/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🛡️</span>
                  <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                    Server Runtime & Security Settings
                  </h2>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-xl border ${
                  data.server.debug
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                }`}>
                  {data.server.environment}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Python Runtime</p>
                  <p className="text-sm font-black text-gray-800 dark:text-gray-100 mt-1">{data.server.python_version}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Django Framework</p>
                  <p className="text-sm font-black text-gray-800 dark:text-gray-100 mt-1">v{data.server.django_version}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Host OS / Platform</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1 truncate">{data.server.platform}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">WhiteNoise Static Storage</p>
                  <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {data.security.whitenoise_active ? 'ENABLED' : 'STANDARD'}
                  </p>
                </div>
              </div>

              {/* Security & Headers details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-700/50 space-y-2">
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Cross-Origin Access (CORS & CSRF)</p>
                  <div className="space-y-1 text-xs">
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">CORS Origins: </span>
                      {data.security.cors_allowed_origins.length > 0 ? data.security.cors_allowed_origins.join(', ') : 'None configured (Local only)'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">CSRF Trusted: </span>
                      {data.security.csrf_trusted_origins.length > 0 ? data.security.csrf_trusted_origins.join(', ') : 'None configured (Local only)'}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-900/60 border border-gray-200/50 dark:border-gray-700/50 space-y-2">
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Cookie & Session Security Flags</p>
                  <div className="grid grid-cols-3 gap-2 text-xs text-center">
                    <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <p className="text-[10px] text-gray-500">SameSite</p>
                      <p className="font-bold text-gray-800 dark:text-gray-200">{data.security.session_cookie_samesite}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <p className="text-[10px] text-gray-500">Session Secure</p>
                      <p className={`font-bold ${data.security.session_cookie_secure ? 'text-emerald-600' : 'text-gray-500'}`}>
                        {data.security.session_cookie_secure ? 'TRUE' : 'FALSE'}
                      </p>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <p className="text-[10px] text-gray-500">CSRF Secure</p>
                      <p className={`font-bold ${data.security.csrf_cookie_secure ? 'text-emerald-600' : 'text-gray-500'}`}>
                        {data.security.csrf_cookie_secure ? 'TRUE' : 'FALSE'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : null}
      </main>
    </div>
  );
}
