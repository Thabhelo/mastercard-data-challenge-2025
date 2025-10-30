import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart, Legend } from 'recharts';
import './TimeSeriesComparison.css';

function TimeSeriesComparison({ data }) {
  const { years, tract_105_igs, tract_1100_igs } = data;
  // Compose series for recharts
  const series = years.map((year, i) => ({
    year: year.toString(),
    'Tract 105': tract_105_igs[i],
    'Tract 1100': tract_1100_igs[i],
    threshold: 45
  }));

  return (
    <div className="time-series-comparison">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={series} margin={{ top: 32, right: 32, left: 16, bottom: 10 }}>
          <defs>
            <linearGradient id="ig-blue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d9ff" stopOpacity={0.75}/>
              <stop offset="80%" stopColor="#1a1a2e" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="ig-purple" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.7}/>
              <stop offset="85%" stopColor="#1a1a2e" stopOpacity={0}/>
            </linearGradient>
          </defs>

          <XAxis dataKey="year" stroke="var(--text-tertiary)" tickLine={false} axisLine={false} fontSize={13}/>
          <YAxis stroke="var(--text-tertiary)" domain={['dataMin-2', 'dataMax+2']} tick={{ fontSize: 13 }} axisLine={false} tickLine={false} width={36}/>
          <CartesianGrid vertical={false} strokeDasharray="3 5" stroke="var(--border-subtle)"/>
          <Tooltip contentStyle={{ background: '#1a1a2edd', borderRadius: 16, color: '#fff', borderColor: '#334155' }} labelStyle={{ color: 'var(--accent-blue)' }} cursor={{ stroke: 'var(--accent-blue)', strokeDasharray: 2 }}/>

          <Area type="monotone" dataKey="Tract 105" stroke="#00d9ff" fillOpacity={0.18} fill="url(#ig-blue)" isAnimationActive={true} />
          <Area type="monotone" dataKey="Tract 1100" stroke="#8b5cf6" fillOpacity={0.15} fill="url(#ig-purple)" isAnimationActive={true} />

          <Line type="monotone" dataKey="Tract 105" stroke="#00d9ff" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#00d9ff', stroke: '#fff', strokeWidth: 3 }} strokeLinejoin="round"/>
          <Line type="monotone" dataKey="Tract 1100" stroke="#8b5cf6" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 3 }} strokeLinejoin="round"/>
          <Line type="stepAfter" dataKey="threshold" stroke="#64748b" strokeWidth={2} dot={false} legendType="none" strokeDasharray="4 4" />
          <Legend verticalAlign="top" height={30} iconType="plainline" wrapperStyle={{ color: 'var(--text-secondary)', fontSize: 14 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TimeSeriesComparison;

