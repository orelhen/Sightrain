import React from 'react';
import { Catch5LineChart } from './StatisticsCopmonents/LineChart';
import BasicPie from './StatisticsCopmonents/PieChart';

const DemoStats = () => {
  // נתונים מזויפים לגרפים
  const chartData = [
    { date: '2024-01-02', avgReaction: 260 },
    { date: '2024-01-04', avgReaction: 280 },
    { date: '2024-01-09', avgReaction: 330 },
    { date: '2024-01-15', avgReaction: 300 },
    { date: '2024-01-20', avgReaction: 380 },
    { date: '2024-01-25', avgReaction: 410 },
  ];

  // נתונים מזויפים לכרטיסים
  const demoData = [
    { title: '⏱ זמן תגובה ממוצע', value: '342ms' },
    { title: '✔️ תשובות נכונות', value: '38%' },
    { title: '🧠 משחקים ששוחקו', value: '24' },
    { title: '📈 תרגול שבועי', value: '5 סשנים' },
  ];

  return (
    <section className="scroll-section section-gray">
      <h2>נתונים לדוגמה - כך יראו הנתונים שלכם</h2>
      <div className="stats-cards-row">
        {demoData.map((item, index) => (
          <div className="stat-card" key={index}>
            {item.title}: <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      <div className="stats-charts-row">
        <div className="chart-box">
          <p> גרף התקדמות שבועי של מטופל</p>
          <Catch5LineChart chartData={chartData} />
        </div>
        <div className="chart-box">
          <p>התפלגות משחקים לדוגמה</p>
          <BasicPie
            QuickMemoryGame={3}
            Catch5Game={5}
            ColorShadeGame={2}
            SaccadeClockGame={4}
            ScanningGame={6}
          />
        </div>
      </div>
    </section>
  );
};

export default DemoStats;