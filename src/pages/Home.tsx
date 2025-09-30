import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Activity, BookOpen, FileText, BarChart3, Bell, Users, Globe, Award } from 'lucide-react';
import farmHero from '@/assets/farm-hero.jpg';
import { useAuth } from '@/contexts/AuthContext';

const Home = () => {
  const { userRole, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userRole === 'policymaker') {
      navigate('/policymaker');
    }
  }, [userRole, navigate]);
  const features = [
    {
      icon: Activity,
      title: 'Risk Assessment',
      description: 'Evaluate biosecurity risks with our comprehensive assessment tool',
      link: '/risk-assessment',
      badge: 'Essential'
    },
    {
      icon: BookOpen,
      title: 'Learning Center',
      description: 'Access training modules and best practices for farm biosecurity',
      link: '/learning',
      badge: 'Popular'
    },
    {
      icon: FileText,
      title: 'Digital Records',
      description: 'Maintain comprehensive health and compliance records',
      link: '/records',
      badge: 'Required'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Monitor farm performance and track biosecurity metrics',
      link: '/analytics',
      badge: 'Insights'
    },
    {
      icon: Bell,
      title: 'Disease Alerts',
      description: 'Stay informed about local outbreaks and notifications',
      link: '/alerts',
      badge: 'Live'
    },
    {
      icon: Users,
      title: 'Expert Support',
      description: 'Connect with veterinarians and biosecurity experts',
      link: '#',
      badge: 'Coming Soon'
    }
  ];

  const stats = [
    { label: 'Active Farmers', value: '2,500+', icon: Users },
    { label: 'Farms Protected', value: '1,200+', icon: Shield },
    { label: 'Disease Alerts', value: '48', icon: Bell },
    { label: 'Training Modules', value: '25', icon: BookOpen }
  ];

  const benefits = [
    {
      title: 'Multilingual Support',
      description: 'Available in Hindi and English for accessibility across India',
      icon: Globe
    },
    {
      title: 'Offline Capability',
      description: 'Works offline for rural areas with limited connectivity',
      icon: Shield
    },
    {
      title: 'Government Compliance',
      description: 'Meets regulatory requirements and supports policy making',
      icon: Award
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-farm">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={farmHero} 
            alt="Modern farm with biosecurity measures" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/10" />
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Digital Farm Biosecurity Platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Welcome to KrishiCure, {profile?.name}
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Managing your {profile?.farm_type === 'both' ? 'pig and poultry' : profile?.farm_type} farm
          </p>
          <p className="text-lg text-muted-foreground mb-8">
            Farm Size: {profile?.farm_size} acres
          </p>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Comprehensive digital farm management platform. 
            Enhance biosecurity, ensure compliance, and boost productivity with AI-powered tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
              <Link to="/learning">
                Get Started
                <BookOpen className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/risk-assessment">
                Risk Assessment
                <Activity className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Complete Farm Management Solution
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to maintain biosecurity, ensure compliance, and optimize farm operations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="shadow-card border-0 hover:shadow-farm transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <Badge variant={feature.badge === 'Live' ? 'destructive' : 'secondary'}>
                        {feature.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className="w-full">
                      <Link to={feature.link}>
                        Explore Feature
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Indian Farmers
            </h2>
            <p className="text-xl text-muted-foreground">
              Designed with accessibility and rural needs in mind
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Enhance Your Farm?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers who trust KrishiCure for their biosecurity needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              <Link to="/risk-assessment" className="flex items-center">
                Start Risk Assessment
                <Activity className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary">
              <Link to="/learning" className="flex items-center">
                Access Learning
                <BookOpen className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;