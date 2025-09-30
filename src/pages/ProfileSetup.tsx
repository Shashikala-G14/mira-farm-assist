import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const ProfileSetup = () => {
  const [name, setName] = useState('');
  const [farmType, setFarmType] = useState<'pig' | 'poultry' | 'both'>('pig');
  const [farmSize, setFarmSize] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();

  useEffect(() => {
    if (profile && profile.farm_type) {
      // Profile already complete, redirect to dashboard
      navigate('/');
    } else if (profile) {
      setName(profile.name || '');
    }
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          farm_type: farmType,
          farm_size: parseFloat(farmSize),
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      await refreshProfile();
      
      toast({
        title: 'Profile completed!',
        description: 'Welcome to KrishiCure.',
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-accent/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Tell us about your farm to get personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Farm Owner Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="farmType">Farm Type</Label>
              <Select value={farmType} onValueChange={(value: any) => setFarmType(value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select farm type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pig">Pig Farm</SelectItem>
                  <SelectItem value="poultry">Poultry Farm</SelectItem>
                  <SelectItem value="both">Both Pig & Poultry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="farmSize">Farm Size (in acres)</Label>
              <Input
                id="farmSize"
                type="number"
                step="0.1"
                placeholder="Enter farm size"
                value={farmSize}
                onChange={(e) => setFarmSize(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving...' : 'Complete Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSetup;
