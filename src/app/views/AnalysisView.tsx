import { Card } from "../components/ui/card";
import { StatCard } from "../components/StatCard";
import { Target, TrendingUp, Database, GitCompare, Activity, CheckCircle, Download, FileSpreadsheet } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter } from "recharts";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { useAnalysisData } from "../../hooks/useApiData";

const predictionAccuracy = [
  { hour: "1h", predicted: 175, actual: 178, error: 3 },
  { hour: "6h", predicted: 182, actual: 185, error: 3 },
  { hour: "12h", predicted: 188, actual: 192, error: 4 },
  { hour: "24h", predicted: 172, actual: 168, error: 4 },
  { hour: "48h", predicted: 165, actual: 175, error: 10 },
];

export function AnalysisView() {
  const { modelMetrics, yearComparison, featureImportance, isLoading } = useAnalysisData();

  // const handleExport = (format: string) => {
  //   console.log(`Exporting data in ${format} format...`);
  // };

  const handleExport = (format: string) => {

  const exportData = {
    predictionAccuracy,
    modelMetrics: modelMetrics.data,
    yearComparison: yearComparison.data,
    featureImportance: featureImportance.data,
  };

  // JSON Download
  if (format === "json") {
    const blob = new Blob(
      [JSON.stringify(exportData, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "air_quality_report.json";
    a.click();

    URL.revokeObjectURL(url);
  }

  // CSV Download
  if (format === "csv") {

    let csvContent =
      "Hour,Predicted,Actual,Error\n";

    predictionAccuracy.forEach((item) => {
      csvContent += `${item.hour},${item.predicted},${item.actual},${item.error}\n`;
    });

    const blob = new Blob(
      [csvContent],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "air_quality_report.csv";
    a.click();

    URL.revokeObjectURL(url);
  }

  if (format === "pdf") {

  import("jspdf").then(({ jsPDF }) => {

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Air Quality Analysis Report", 20, 20);

    doc.setFontSize(12);
    doc.text(
      `Model Accuracy: ${bestModel?.accuracy || 96.1}%`,
      20,
      40
    );

    doc.text("Prediction Accuracy:", 20, 55);

    predictionAccuracy.forEach((item, index) => {
      doc.text(
        `${item.hour} Forecast -> Predicted: ${item.predicted}, Actual: ${item.actual}, Error: ±${item.error}`,
        20,
        70 + index * 10
      );
    });

    doc.save("air_quality_report.pdf");

  });

}
};

  // Transform model metrics for chart
  const modelChartData = modelMetrics.data.map(m => ({
    metric: m.model_name,
    accuracy: m.accuracy,
    mae: m.mae,
    rmse: m.rmse
  }));

  // Get best model stats
  const bestModel = modelMetrics.data.reduce((best, current) =>
    current.accuracy > best.accuracy ? current : best
    , modelMetrics.data[0]);

  return (
    <div className="space-y-6">
      {/* Data Source Indicator */}
      {modelMetrics.isUsingMockData && (
        <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30">
          Demo Mode - Connect backend for live data
        </Badge>
      )}

      {/* Export Data Section */}
      <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-purple-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Research Data Export</h4>
              <p className="text-xs text-muted-foreground">
                Download historical data, model metrics, and analysis reports for research purposes
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="gap-1">
              <FileSpreadsheet className="w-3 h-3" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('json')} className="gap-1">
              <Download className="w-3 h-3" />
              JSON
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} className="gap-1">
              <Download className="w-3 h-3" />
              Report PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Model Performance Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Model Performance Metrics</h2>
        {modelMetrics.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Overall Accuracy"
              value={`${bestModel?.accuracy || 96.1}%`}
              subtitle={bestModel?.model_name || "Ensemble Model"}
              icon={Target}
              iconColor="text-green-500"
            />
            <StatCard
              title="Mean Absolute Error"
              value={bestModel?.mae?.toFixed(3) || "11.2"}
              subtitle="AQI Points"
              icon={Activity}
              iconColor="text-blue-500"
            />
            <StatCard
              title="RMSE"
              value={bestModel?.rmse?.toFixed(3) || "16.8"}
              subtitle="Root Mean Square Error"
              icon={TrendingUp}
              iconColor="text-purple-500"
            />
            <StatCard
              title="Training Samples"
              value={bestModel?.training_samples ? `${(bestModel.training_samples / 1000).toFixed(1)}K` : "18K"}
              subtitle="Data Points"
              icon={Database}
              iconColor="text-orange-500"
            />
          </div>
        )}
      </div>

      {/* Model Comparison */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Model Comparison Analysis</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={modelChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="metric" tick={{ fill: 'var(--muted-foreground)' }} fontSize={12} />
              <YAxis tick={{ fill: 'var(--muted-foreground)' }} fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--card-foreground)",
                }}
                labelStyle={{ color: 'var(--foreground)' }}
              />
              <Legend />
              <Bar dataKey="accuracy" fill="var(--chart-1)" name="Accuracy %" radius={[8, 8, 0, 0]} />
              <Bar dataKey="mae" fill="var(--chart-2)" name="MAE" radius={[8, 8, 0, 0]} />
              <Bar dataKey="rmse" fill="var(--chart-3)" name="RMSE" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Year-over-Year Comparison */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Year-over-Year AQI Comparison</h3>
            <p className="text-sm text-muted-foreground">Monthly average comparison: 2024, 2025, 2026</p>
          </div>
          <Badge variant="outline" className="gap-1">
            <GitCompare className="w-3 h-3" />
            3 Years
          </Badge>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={yearComparison.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--muted-foreground)' }} fontSize={12} />
              <YAxis tick={{ fill: 'var(--muted-foreground)' }} fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--card-foreground)",
                }}
                labelStyle={{ color: 'var(--foreground)' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="y2024"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={{ r: 4, fill: "var(--chart-1)" }}
                name="2024"
              />
              <Line
                type="monotone"
                dataKey="y2025"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={{ r: 4, fill: "var(--chart-2)" }}
                name="2025"
              />
              <Line
                type="monotone"
                dataKey="y2026"
                stroke="var(--chart-4)"
                strokeWidth={3}
                dot={{ r: 5, fill: "var(--chart-4)" }}
                name="2026 (Current)"
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm">
            <strong>Key Insight:</strong> 2026 shows a 7.2% improvement over 2025 in Q1, indicating positive impact of recent policy interventions.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prediction Accuracy */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Prediction Accuracy by Horizon</h3>
          <p className="text-sm text-muted-foreground mb-4">Predicted vs Actual AQI values</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="predicted"
                  name="Predicted"
                  className="text-muted-foreground"
                  fontSize={12}
                />
                <YAxis
                  dataKey="actual"
                  name="Actual"
                  className="text-muted-foreground"
                  fontSize={12}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Scatter
                  data={predictionAccuracy}
                  fill="hsl(var(--chart-2))"
                  stroke="white"
                  strokeWidth={1.5}
                  name="Predictions"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {predictionAccuracy.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{item.hour} Forecast</span>
                <div className="flex items-center gap-2">
                  <span>Error: ±{item.error}</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Feature Importance */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Feature Importance Analysis</h3>
          <p className="text-sm text-muted-foreground mb-4">Impact of features on model predictions</p>
          <div className="space-y-4">
            {featureImportance.data.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-2">
                  <span>{item.feature}</span>
                  <span className="font-medium">{item.importance}%</span>
                </div>
                <Progress value={item.importance} className="h-2" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Research Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold mb-2">Seasonal Patterns</h4>
          <p className="text-sm text-muted-foreground">
            Winter months (Nov-Jan) show 58% higher AQI compared to summer, primarily due to stubble burning and atmospheric conditions.
          </p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
          <h4 className="font-semibold mb-2">Traffic Impact</h4>
          <p className="text-sm text-muted-foreground">
            Rush hour traffic contributes to 23% spike in PM2.5 levels. Weekend AQI averages 15 points lower than weekdays.
          </p>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-200 dark:border-orange-800">
          <h4 className="font-semibold mb-2">Policy Effectiveness</h4>
          <p className="text-sm text-muted-foreground">
            Odd-even scheme reduced AQI by 12-18 points during implementation. CNG adoption shows 8% improvement in NO₂ levels.
          </p>
        </Card>
      </div>
    </div>
  );
}