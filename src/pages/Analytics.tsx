import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Shield, Users, AlertTriangle, Download } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';

const Analytics = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [animals, setAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('farmer_id', user.id);
    
    if (data) {
      setAnimals(data);
    }
    setLoading(false);
  };

  // Calculate metrics from real data
  const totalAnimals = animals.length;
  const healthyAnimals = animals.filter(a => a.health_status === 'healthy').length;
  const vaccinatedAnimals = animals.filter(a => a.is_vaccinated).length;
  const pregnantAnimals = animals.filter(a => a.is_pregnant).length;
  const vaccinationRate = totalAnimals > 0 ? Math.round((vaccinatedAnimals / totalAnimals) * 100) : 0;
  const healthRate = totalAnimals > 0 ? Math.round((healthyAnimals / totalAnimals) * 100) : 0;

  const keyMetrics = [
    { label: t('analytics.totalAnimals'), value: totalAnimals.toString(), trend: 'up', icon: Users, color: 'text-primary' },
    { label: t('analytics.healthyAnimals'), value: healthyAnimals.toString(), trend: 'up', icon: Shield, color: 'text-success' },
    { label: t('analytics.vaccinationRate'), value: `${vaccinationRate}%`, trend: 'up', icon: BarChart3, color: 'text-accent' },
    { label: t('analytics.pregnantAnimals'), value: pregnantAnimals.toString(), trend: 'stable', icon: TrendingUp, color: 'text-warning' }
  ];

  // Health distribution data for pie chart
  const healthDistribution = [
    { name: t('animals.healthy'), value: animals.filter(a => a.health_status === 'healthy').length, color: '#22c55e' },
    { name: t('animals.sick'), value: animals.filter(a => a.health_status === 'sick').length, color: '#ef4444' },
    { name: t('animals.quarantined'), value: animals.filter(a => a.health_status === 'quarantined').length, color: '#f59e0b' },
  ].filter(item => item.value > 0);

  // Type distribution
  const typeDistribution = [
    { name: t('animals.pig'), value: animals.filter(a => a.type === 'pig').length, color: '#8b5cf6' },
    { name: t('animals.poultry'), value: animals.filter(a => a.type === 'poultry').length, color: '#06b6d4' },
  ].filter(item => item.value > 0);

  // Gender distribution
  const genderDistribution = [
    { name: t('animals.male'), value: animals.filter(a => a.gender === 'male').length, color: '#3b82f6' },
    { name: t('animals.female'), value: animals.filter(a => a.gender === 'female').length, color: '#ec4899' },
  ].filter(item => item.value > 0);

  // Growth trend (simulated monthly data)
  const growthTrend = [
    { month: 'Jan', animals: Math.max(0, totalAnimals - 40) },
    { month: 'Feb', animals: Math.max(0, totalAnimals - 30) },
    { month: 'Mar', animals: Math.max(0, totalAnimals - 20) },
    { month: 'Apr', animals: Math.max(0, totalAnimals - 10) },
    { month: 'May', animals: totalAnimals },
  ];

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('analytics.title')}</h1>
          <p className="text-muted-foreground">Monitor your farm performance and biosecurity metrics</p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                  <Badge variant={metric.trend === 'up' ? 'default' : metric.trend === 'down' ? 'secondary' : 'outline'}>
                    {metric.trend}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Health Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.healthDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            {healthDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={healthDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {healthDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.typeDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            {typeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Growth Trend */}
      <Card>
        <CardHeader>
          <CardTitle>{t('analytics.growthTrend')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growthTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="animals" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;