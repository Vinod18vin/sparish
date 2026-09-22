import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from "recharts";

import { THRESHOLDS, evaluateParam } from "../data/thresholds";


function ParameterCard({ paramKey, icon, series, value }) {

  const threshold = THRESHOLDS[paramKey];

  const status = evaluateParam(paramKey, value);

  const isSafe = status === "safe";

  return (

    <div className={`parameter-card parameter-card-${status}`}>

      <div className="parameter-card-top">

        <div className="parameter-icon">
          {icon}
        </div>

        <span
          className={`param-status-pill param-status-${status}`}
        >
          {isSafe ? "Safe" : "Unsafe"}
        </span>

      </div>


      <div className="parameter-card-value-row">

        <span className="parameter-label">{threshold.label}</span>

        <div className="parameter-value">
          {value}
          <em>{threshold.unit}</em>
        </div>

      </div>


      <div className="parameter-chart">

        <ResponsiveContainer width="100%" height={64}>

          <LineChart data={series}>

            <YAxis
              hide
              domain={["dataMin - 1", "dataMax + 1"]}
            />

            <Tooltip
              contentStyle={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                borderRadius: "8px",
                border: "1px solid var(--line)",
              }}
              labelStyle={{ display: "none" }}
              formatter={(val) => [`${val} ${threshold.unit}`, threshold.label]}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke={isSafe ? "var(--teal-600)" : "var(--danger-600)"}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>


      <div className="parameter-range">
        Reference range: {threshold.min}–{threshold.max} {threshold.unit}
      </div>

    </div>

  );
}

export default ParameterCard;
