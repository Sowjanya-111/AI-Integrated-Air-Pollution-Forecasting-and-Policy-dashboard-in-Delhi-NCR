import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Zap, Clock, Calendar, TrendingDown, Target, Car, Factory, Leaf, 
  Wind, Droplets, Building, CheckCircle, ArrowRight, Lightbulb
} from "lucide-react";
import { useSolutions } from "../../hooks/useApiData";
import { Skeleton } from "../components/ui/skeleton";
import type { Solution } from "../../types/api";

function SolutionSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4" />
    </Card>
  );
}

function getCategoryIcon(category: Solution['category']) {
  switch (category) {
    case 'IMMEDIATE':
      return <Zap className="w-5 h-5 text-red-500" />;
    case 'SHORT_TERM':
      return <Clock className="w-5 h-5 text-orange-500" />;
    case 'LONG_TERM':
      return <Calendar className="w-5 h-5 text-blue-500" />;
    case 'POLICY':
      return <Building className="w-5 h-5 text-purple-500" />;
    default:
      return <Target className="w-5 h-5" />;
  }
}

function getCategoryStyles(category: Solution['category']) {
  switch (category) {
    case 'IMMEDIATE':
      return 'border-l-red-500 bg-gradient-to-r from-red-50/50 to-transparent dark:from-red-950/20';
    case 'SHORT_TERM':
      return 'border-l-orange-500 bg-gradient-to-r from-orange-50/50 to-transparent dark:from-orange-950/20';
    case 'LONG_TERM':
      return 'border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20';
    case 'POLICY':
      return 'border-l-purple-500 bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-950/20';
    default:
      return '';
  }
}

function SolutionCard({ solution }: { solution: Solution }) {
  return (
    <Card className={`p-6 border-l-4 transition-all hover:shadow-lg ${getCategoryStyles(solution.category)}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-background/80">
            {getCategoryIcon(solution.category)}
          </div>
          <div>
            <h3 className="font-semibold">{solution.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={
                  solution.priority === 'HIGH' ? 'destructive' :
                  solution.priority === 'MEDIUM' ? 'default' : 'secondary'
                }
                className="text-xs"
              >
                {solution.priority} Priority
              </Badge>
              <Badge variant="outline" className="text-xs">
                {solution.category.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">{solution.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Expected Impact</p>
          <p className="text-sm font-medium text-green-600 dark:text-green-400">{solution.expected_impact}</p>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Timeline</p>
          <p className="text-sm font-medium">{solution.timeline}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Effectiveness:</span>
          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-green-500"
              style={{ width: `${solution.effectiveness_score}%` }}
            />
          </div>
          <span className="text-xs font-medium">{solution.effectiveness_score}%</span>
        </div>
        <span className="text-xs text-muted-foreground">{solution.estimated_cost}</span>
      </div>
    </Card>
  );
}

export function SolutionsView() {
  const { data: solutions, loading, isUsingMockData } = useSolutions();

  const immediateSolutions = solutions.filter(s => s.category === 'IMMEDIATE');
  const shortTermSolutions = solutions.filter(s => s.category === 'SHORT_TERM');
  const longTermSolutions = solutions.filter(s => s.category === 'LONG_TERM');
  const policySolutions = solutions.filter(s => s.category === 'POLICY');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Air Quality Solutions</h1>
          <p className="text-muted-foreground">AI-recommended interventions based on current conditions</p>
        </div>
        <div className="flex items-center gap-2">
          {isUsingMockData && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-300">
              Demo Data
            </Badge>
          )}
          <Badge variant="secondary" className="gap-1">
            <Lightbulb className="w-3 h-3" />
            {solutions.length} Solutions
          </Badge>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/30 border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-500/20">
              <Zap className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{immediateSolutions.length}</p>
              <p className="text-xs text-muted-foreground">Immediate Actions</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/30 border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-orange-500/20">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{shortTermSolutions.length}</p>
              <p className="text-xs text-muted-foreground">Short-term</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-500/20">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{longTermSolutions.length}</p>
              <p className="text-xs text-muted-foreground">Long-term</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-purple-500/20">
              <Building className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{policySolutions.length}</p>
              <p className="text-xs text-muted-foreground">Policy Changes</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Solutions by Category */}
      <Tabs defaultValue="immediate" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="immediate" className="gap-1">
            <Zap className="w-3 h-3" />
            Immediate
          </TabsTrigger>
          <TabsTrigger value="short-term" className="gap-1">
            <Clock className="w-3 h-3" />
            Short-term
          </TabsTrigger>
          <TabsTrigger value="long-term" className="gap-1">
            <Calendar className="w-3 h-3" />
            Long-term
          </TabsTrigger>
          <TabsTrigger value="policy" className="gap-1">
            <Building className="w-3 h-3" />
            Policy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="immediate" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => <SolutionSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {immediateSolutions.map((solution) => (
                <SolutionCard key={solution.id} solution={solution} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="short-term" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => <SolutionSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {shortTermSolutions.map((solution) => (
                <SolutionCard key={solution.id} solution={solution} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="long-term" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => <SolutionSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {longTermSolutions.map((solution) => (
                <SolutionCard key={solution.id} solution={solution} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="policy" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => <SolutionSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {policySolutions.map((solution) => (
                <SolutionCard key={solution.id} solution={solution} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Impact Summary */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-green-500" />
          Combined Impact Projection
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">-45</p>
            <p className="text-sm text-muted-foreground mt-1">Potential AQI Reduction</p>
            <p className="text-xs text-muted-foreground">If all immediate solutions implemented</p>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">28%</p>
            <p className="text-sm text-muted-foreground mt-1">Annual Improvement</p>
            <p className="text-xs text-muted-foreground">With long-term policy implementation</p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">85%</p>
            <p className="text-sm text-muted-foreground mt-1">Avg. Effectiveness</p>
            <p className="text-xs text-muted-foreground">Based on historical data</p>
          </div>
        </div>
      </Card>

      {/* Key Sectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 hover:shadow-lg transition-all">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Car className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold">Transportation</h4>
              <p className="text-sm text-muted-foreground mt-1">41% of pollution from vehicles</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400">
                <CheckCircle className="w-3 h-3" />
                3 solutions active
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 hover:shadow-lg transition-all">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <Factory className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h4 className="font-semibold">Industrial</h4>
              <p className="text-sm text-muted-foreground mt-1">22% of pollution from industries</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400">
                <CheckCircle className="w-3 h-3" />
                2 solutions active
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 hover:shadow-lg transition-all">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold">Agriculture</h4>
              <p className="text-sm text-muted-foreground mt-1">12% from biomass burning</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400">
                <CheckCircle className="w-3 h-3" />
                1 solution active
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
