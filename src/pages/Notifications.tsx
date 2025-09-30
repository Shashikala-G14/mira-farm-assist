import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Notifications = () => {
  const [schemes, setSchemes] = useState<any[]>([]);

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    const { data } = await supabase
      .from('schemes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setSchemes(data);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Bell className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Latest schemes and guidelines from authorities</p>
        </div>
      </div>

      <div className="space-y-4">
        {schemes.map((scheme) => (
          <Card key={scheme.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">{scheme.title}</CardTitle>
                </div>
                <Badge>New</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{scheme.description}</p>
              <div className="bg-secondary/30 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{scheme.content}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Published on {new Date(scheme.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
        
        {schemes.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                New schemes and guidelines will appear here
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Notifications;
