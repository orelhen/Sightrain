import { LineChart } from '@mui/x-charts/LineChart';

export const Catch5LineChart = ({ chartData }) => {
  if (!chartData?.length) return null;

 
// Sort the data by date (oldest to newest)
const sortedData = [...chartData].sort((a, b) => {
  const dateA = a.date.split('/').reverse().join('-');
  const dateB = b.date.split('/').reverse().join('-');
  return new Date(dateA) - new Date(dateB);
});

// Use sorted data for the chart
const dates = sortedData.map(d => d.date);
const values = sortedData.map(d => d.avgReaction);

return (
    <div style={{ marginTop: "20px", padding: "20px", background: "#f8f9fa", borderRadius: "12px" }}>
        <h4 style={{ marginBottom: "10px" }}>📈 זמן תגובה ממוצע למשחק (Catch5)</h4>
        <LineChart
            xAxis={[{
                data: dates,
                label: "תאריך",
                scaleType: "band",
                tickLabelStyle: { fontSize: 12 },
                direction: 'ltr',
                reverse: true
            }]}
            yAxis={[{
                label: "זמן תגובה (ms)",
                min: 0,
                tickLabelStyle: { fontSize: 12 }
            }]}
            series={[{
                data: values,
                label: "ממוצע זמן תגובה",
                area: true,
                showMark: true,
                curve: "monotone"
            }]}
            height={400}
        />
    </div>
);
};
