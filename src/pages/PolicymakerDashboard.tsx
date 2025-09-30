import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Users, FileText, MessageSquare, Plus, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const PolicymakerDashboard = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [contactRequests, setContactRequests] = useState<any[]>([]);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [newScheme, setNewScheme] = useState({ title: '', description: '', content: '' });
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: profilesData } = await supabase.from('profiles').select('*');
    const { data: requestsData } = await supabase.from('contact_requests').select('*');
    const { data: schemesData } = await supabase.from('schemes').select('*');
    
    if (profilesData) setProfiles(profilesData);
    if (requestsData) setContactRequests(requestsData);
    if (schemesData) setSchemes(schemesData);
  };

  const createScheme = async () => {
    const { error } = await supabase
      .from('schemes')
      .insert([newScheme]);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Scheme created successfully' });
      setNewScheme({ title: '', description: '', content: '' });
      setOpen(false);
      fetchData();
    }
  };

  const stats = {
    totalFarmers: profiles.length,
    pigFarms: profiles.filter(p => p.farm_type === 'pig' || p.farm_type === 'both').length,
    poultryFarms: profiles.filter(p => p.farm_type === 'poultry' || p.farm_type === 'both').length,
    pendingRequests: contactRequests.filter(r => r.status === 'pending').length,
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Policymaker Dashboard</h1>
          <p className="text-muted-foreground">Monitor farms and create guidelines</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Scheme
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Scheme</DialogTitle>
              <DialogDescription>Create guidelines for farmers</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={newScheme.title}
                  onChange={(e) => setNewScheme({ ...newScheme, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={newScheme.description}
                  onChange={(e) => setNewScheme({ ...newScheme, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Content</Label>
                <Textarea
                  value={newScheme.content}
                  onChange={(e) => setNewScheme({ ...newScheme, content: e.target.value })}
                  rows={5}
                />
              </div>
              <Button onClick={createScheme} className="w-full">Create Scheme</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <Users className="w-5 h-5 text-primary mb-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFarmers}</div>
            <p className="text-sm text-muted-foreground">Total Farmers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <BarChart3 className="w-5 h-5 text-accent mb-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pigFarms}</div>
            <p className="text-sm text-muted-foreground">Pig Farms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <BarChart3 className="w-5 h-5 text-success mb-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.poultryFarms}</div>
            <p className="text-sm text-muted-foreground">Poultry Farms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <MessageSquare className="w-5 h-5 text-warning mb-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            <p className="text-sm text-muted-foreground">Pending Requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Contact Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Farmer Contact Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contactRequests.slice(0, 5).map((request) => (
              <div key={request.id} className="border-l-4 border-primary pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{request.subject}</h4>
                    <p className="text-sm text-muted-foreground">{request.message}</p>
                  </div>
                  <Badge variant={request.status === 'pending' ? 'default' : 'secondary'}>
                    {request.status}
                  </Badge>
                </div>
              </div>
            ))}
            {contactRequests.length === 0 && (
              <p className="text-muted-foreground text-center py-4">No contact requests</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schemes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Published Schemes & Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schemes.map((scheme) => (
              <div key={scheme.id} className="border rounded-lg p-4">
                <h4 className="font-semibold">{scheme.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{scheme.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Created {new Date(scheme.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
            {schemes.length === 0 && (
              <p className="text-muted-foreground text-center py-4">No schemes created yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PolicymakerDashboard;
