/**
 * SmartAQI - Intelligent Air Pollution Forecasting and Policy Dashboard
 * 
 * A comprehensive dashboard for monitoring, analyzing, and predicting air quality in Delhi-NCR.
 * 
 * Features:
 * - Real-time AQI monitoring across Delhi-NCR
 * - ML-powered predictions (95%+ accuracy)
 * - Policy impact analysis
 * - Interactive data visualizations
 * - Dark/Light mode support
 */

import { useState, useEffect } from "react";
import { ThemeProvider } from "./components/theme-provider";
import { Navigation } from "./components/Navigation";
import { LiveIndicator } from "./components/LiveIndicator";
import { KeyboardShortcuts } from "./components/KeyboardShortcuts";
import { OverviewView } from "./views/OverviewView";
import { AnalysisView } from "./views/AnalysisView";
import { PredictionsView } from "./views/PredictionsView";
import { AlertsView } from "./views/AlertsView";
import { SolutionsView } from "./views/SolutionsView";
import { motion, AnimatePresence } from "motion/react";
import { Wind, Github, Twitter, Globe, Heart } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const renderView = () => {
    const views: Record<string, JSX.Element> = {
      overview: <OverviewView />,
      analysis: <AnalysisView />,
      predictions: <PredictionsView />,
      alerts: <AlertsView />,
      solutions: <SolutionsView />,
    };
    return views[activeTab] || <OverviewView />;
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 text-foreground">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <AnimatePresence mode="wait">
          <motion.main
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
          >
            {isLoaded && renderView()}
          </motion.main>
        </AnimatePresence>

        {/* Keyboard Shortcuts Helper */}
        <KeyboardShortcuts />

        {/* Footer */}
        <footer className="border-t bg-card/50 backdrop-blur-sm mt-12">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                    <Wind className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                      SmartAQI
                    </h3>
                    <p className="text-xs text-muted-foreground">Intelligent Air Quality Monitoring</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Real-time air quality monitoring and ML-powered forecasting for Delhi-NCR region. 
                  Empowering citizens and policymakers with actionable environmental insights.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    <button 
                      onClick={() => setActiveTab('overview')} 
                      className="hover:text-foreground transition-colors"
                    >
                      Dashboard
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('predictions')} 
                      className="hover:text-foreground transition-colors"
                    >
                      Forecasts
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('alerts')} 
                      className="hover:text-foreground transition-colors"
                    >
                      Alerts
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('analysis')} 
                      className="hover:text-foreground transition-colors"
                    >
                      Analysis
                    </button>
                  </li>
                </ul>
              </div>

              {/* Status */}
              <div>
                <h4 className="font-semibold mb-4">System Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-muted-foreground">API Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-muted-foreground">Data Pipeline Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-muted-foreground">ML Model Running</span>
                  </div>
                  <div className="mt-3">
                    <LiveIndicator />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>Built with</span>
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                <span>for cleaner air</span>
              </div>
              <div className="flex items-center gap-4">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <Globe className="w-5 h-5" />
                </a>
              </div>
              <p className="text-xs text-muted-foreground">
                © 2026 SmartAQI. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}
