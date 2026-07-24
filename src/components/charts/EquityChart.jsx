/**
 * Lightweight dependency-free SVG line chart. Each series is drawn on a
 * shared time/value scale so multiple curves stay comparable.
 *
 * series: [{ label, color, points: [{ time, balance }], strokeWidth? }]
 */
export default function EquityChart({ series, height = 220 }) {
  const width = 1000;
  const allPoints = series.flatMap((s) => s.points || []);

  if (allPoints.length < 2) {
    return (
      <div
        className="flex items-center justify-center text-xs text-slate-500"
        style={{ height }}
      >
        Not enough data points to render this chart.
      </div>
    );
  }

  const times = allPoints.map((p) => new Date(p.time).getTime());
  const balances = allPoints.map((p) => p.balance);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const minBal = Math.min(...balances);
  const maxBal = Math.max(...balances);

  const toPoints = (points) =>
    points
      .map((p) => {
        const t = new Date(p.time).getTime();
        const x = maxTime === minTime ? 0 : ((t - minTime) / (maxTime - minTime)) * width;
        const y =
          maxBal === minBal
            ? height / 2
            : height - ((p.balance - minBal) / (maxBal - minBal)) * height;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none">
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={0}
          x2={width}
          y1={height * f}
          y2={height * f}
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      ))}
      {series.map((s) => (
        <polyline
          key={s.label}
          points={toPoints(s.points)}
          fill="none"
          stroke={s.color}
          strokeWidth={s.strokeWidth ?? 2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}