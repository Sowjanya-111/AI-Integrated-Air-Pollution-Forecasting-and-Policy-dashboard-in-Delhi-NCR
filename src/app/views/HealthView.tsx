import { Card } from "../components/ui/card";
import { HealthRecommendations } from "../components/HealthRecommendations";
import { Heart, Baby, Users, Activity, Home, Bike, Wind, AlertCircle } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const healthImpacts = [
  {
    category: "Respiratory Issues",
    percentage: 68,
    cases: "2,450",
    trend: "up",
    color: "text-red-500",
  },
  {
    category: "Cardiovascular Problems",
    percentage: 45,
    cases: "1,620",
    trend: "up",
    color: "text-orange-500",
  },
  {
    category: "Eye Irritation",
    percentage: 82,
    cases: "2,950",
    trend: "stable",
    color: "text-yellow-500",
  },
  {
    category: "Skin Allergies",
    percentage: 35,
    cases: "1,260",
    trend: "down",
    color: "text-green-500",
  },
];

const groupRecommendations = [
  {
    icon: Baby,
    title: "Children (0-12 years)",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    recommendations: [
      "Keep children indoors during peak pollution hours (6 AM - 10 AM)",
      "Use air purifiers in children's rooms",
      "Avoid outdoor sports and playgrounds",
      "Ensure children wear N95 masks if going outside",
      "Keep schools closed on very unhealthy days",
    ],
  },
  {
    icon: Heart,
    title: "Elderly (60+ years)",
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    recommendations: [
      "Stay indoors with windows closed",
      "Avoid all outdoor physical activities",
      "Monitor heart rate and oxygen levels regularly",
      "Keep emergency medications readily available",
      "Use air purifiers and maintain indoor humidity at 40-60%",
    ],
  },
  {
    icon: Activity,
    title: "Pregnant Women",
    color: "text-pink-500",
    bgColor: "bg-pink-50 dark:bg-pink-950/20",
    recommendations: [
      "Minimize outdoor exposure completely",
      "Use N99 masks if must go outside",
      "Regular prenatal checkups to monitor health",
      "Consume antioxidant-rich foods (fruits, vegetables)",
      "Keep indoor air quality optimal with purifiers",
    ],
  },
  {
    icon: Users,
    title: "Respiratory Patients",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950/20",
    recommendations: [
      "Keep rescue inhalers and medications accessible",
      "Monitor symptoms closely - consult doctor if worsening",
      "Avoid all outdoor activities",
      "Use prescribed nebulizers as needed",
      "Emergency room visit if severe breathing difficulty",
    ],
  },
];

const protectiveMeasures = [
  {
    icon: Home,
    title: "Indoor Air Quality",
    measures: [
      "Use HEPA air purifiers in all rooms",
      "Seal windows and doors to prevent outdoor air entry",
      "Maintain humidity levels between 40-60%",
      "Avoid burning incense or candles",
      "Use exhaust fans while cooking",
    ],
  },
  {
    icon: Wind,
    title: "When Going Outdoors",
    measures: [
      "Wear N95 or N99 certified face masks",
      "Avoid peak traffic hours (7-10 AM, 5-8 PM)",
      "Choose less polluted routes",
      "Limit outdoor time to absolute necessities",
      "Shower and change clothes after returning",
    ],
  },
  {
    icon: Bike,
    title: "Lifestyle Adjustments",
    measures: [
      "Postpone outdoor exercises and sports",
      "Do indoor workouts instead (yoga, home gym)",
      "Consume vitamin C and E rich foods",
      "Stay hydrated - drink 8-10 glasses of water",
      "Include turmeric and ginger in diet (anti-inflammatory)",
    ],
  },
];

export function HealthView() {
  return (
    <div className="space-y-6">
      {/* Current Health Recommendations */}
      <HealthRecommendations aqi={178} />

      {/* Health Impact Statistics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Health Impact Statistics (This Month)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {healthImpacts.map((impact, idx) => (
            <Card key={idx} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <AlertCircle className={`w-5 h-5 ${impact.color}`} />
                <Badge variant={impact.trend === "up" ? "destructive" : "secondary"}>
                  {impact.trend === "up" ? "↑" : impact.trend === "down" ? "↓" : "→"} {impact.trend}
                </Badge>
              </div>
              <h4 className="font-semibold text-sm mb-2">{impact.category}</h4>
              <p className="text-2xl font-bold mb-2">{impact.cases}</p>
              <p className="text-xs text-muted-foreground mb-2">Reported Cases</p>
              <Progress value={impact.percentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {impact.percentage}% increase from baseline
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Group-Specific Recommendations */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recommendations by Vulnerable Groups</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groupRecommendations.map((group, idx) => {
            const Icon = group.icon;
            return (
              <Card key={idx} className={`p-6 ${group.bgColor} border-2`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-full bg-white dark:bg-gray-900 ${group.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold">{group.title}</h3>
                </div>
                <ul className="space-y-2">
                  {group.recommendations.map((rec, recIdx) => (
                    <li key={recIdx} className="flex items-start gap-2 text-sm">
                      <span className={`mt-1 ${group.color}`}>•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Protective Measures */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Protective Measures & Guidelines</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {protectiveMeasures.map((category, idx) => {
            const Icon = category.icon;
            return (
              <Card key={idx} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                  <h3 className="font-semibold">{category.title}</h3>
                </div>
                <ul className="space-y-3">
                  {category.measures.map((measure, mIdx) => (
                    <li key={mIdx} className="flex items-start gap-2 text-sm">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                      <span className="text-muted-foreground">{measure}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Diet & Nutrition */}
      <Tabs defaultValue="foods" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="foods">Beneficial Foods</TabsTrigger>
          <TabsTrigger value="avoid">Foods to Avoid</TabsTrigger>
        </TabsList>

        <TabsContent value="foods" className="mt-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Anti-Pollution Diet Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  Antioxidant-Rich Foods
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Berries (blueberries, strawberries)</li>
                  <li>• Citrus fruits (oranges, lemons)</li>
                  <li>• Dark leafy greens (spinach, kale)</li>
                  <li>• Nuts and seeds (walnuts, flaxseeds)</li>
                  <li>• Green tea</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Anti-Inflammatory Foods
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Turmeric and ginger</li>
                  <li>• Tomatoes</li>
                  <li>• Olive oil</li>
                  <li>• Fatty fish (salmon, mackerel)</li>
                  <li>• Broccoli and cauliflower</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  Vitamin-Rich Options
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Vitamin C: Amla, guava, peppers</li>
                  <li>• Vitamin E: Almonds, sunflower seeds</li>
                  <li>• Vitamin A: Carrots, sweet potatoes</li>
                  <li>• Omega-3: Chia seeds, walnuts</li>
                  <li>• Zinc: Pumpkin seeds, chickpeas</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  Detoxifying Options
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Lemon water (morning routine)</li>
                  <li>• Beetroot juice</li>
                  <li>• Jaggery (helps clear respiratory tract)</li>
                  <li>• Honey with warm water</li>
                  <li>• Tulsi (Holy Basil) tea</li>
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="avoid" className="mt-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Foods & Habits to Avoid During High Pollution</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3 text-red-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Inflammatory Foods
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Processed and fried foods</li>
                  <li>• Refined sugar and sweets</li>
                  <li>• Red and processed meats</li>
                  <li>• Excessive dairy products</li>
                  <li>• White bread and pasta</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-3 text-red-500 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Habits to Avoid
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Smoking (amplifies pollution effects)</li>
                  <li>• Alcohol consumption</li>
                  <li>• Caffeinated drinks (dehydrating)</li>
                  <li>• Eating street food (exposed to pollution)</li>
                  <li>• Skipping meals (weakens immunity)</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm">
                <strong>Important:</strong> These dietary recommendations support overall health during high pollution periods but should not replace medical advice. Consult your doctor for personalized health guidance.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Emergency Contacts */}
      <Card className="p-6 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          Emergency Health Resources
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="font-medium text-sm mb-1">Emergency Ambulance</p>
            <p className="text-2xl font-bold text-red-500">102</p>
          </div>
          <div>
            <p className="font-medium text-sm mb-1">Pollution Helpline</p>
            <p className="text-2xl font-bold text-red-500">1800-11-0007</p>
          </div>
          <div>
            <p className="font-medium text-sm mb-1">AIIMS Delhi Emergency</p>
            <p className="text-2xl font-bold text-red-500">011-2659-3607</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
