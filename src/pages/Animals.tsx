import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Filter, Edit, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface Animal {
  id: string;
  type: 'pig' | 'poultry';
  gender: 'male' | 'female';
  birth_date: string;
  health_status: 'healthy' | 'sick' | 'quarantined' | 'deceased';
  is_vaccinated: boolean;
  vaccination_date: string | null;
  is_pregnant: boolean;
  pregnancy_start_date: string | null;
  notes: string | null;
}

const Animals = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [filteredAnimals, setFilteredAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<string>('all');
  const [vaccinationFilter, setVaccinationFilter] = useState<string>('all');
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'pig' as 'pig' | 'poultry',
    gender: 'male' as 'male' | 'female',
    birth_date: '',
    health_status: 'healthy' as 'healthy' | 'sick' | 'quarantined' | 'deceased',
    is_vaccinated: false,
    vaccination_date: '',
    is_pregnant: false,
    pregnancy_start_date: '',
    notes: '',
  });

  useEffect(() => {
    fetchAnimals();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [animals, typeFilter, genderFilter, healthFilter, vaccinationFilter]);

  const fetchAnimals = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('farmer_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setAnimals(data || []);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...animals];
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(a => a.type === typeFilter);
    }
    if (genderFilter !== 'all') {
      filtered = filtered.filter(a => a.gender === genderFilter);
    }
    if (healthFilter !== 'all') {
      filtered = filtered.filter(a => a.health_status === healthFilter);
    }
    if (vaccinationFilter === 'vaccinated') {
      filtered = filtered.filter(a => a.is_vaccinated);
    } else if (vaccinationFilter === 'not-vaccinated') {
      filtered = filtered.filter(a => !a.is_vaccinated);
    }
    
    setFilteredAnimals(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const animalData = {
      ...formData,
      farmer_id: user.id,
      vaccination_date: formData.is_vaccinated ? formData.vaccination_date : null,
      pregnancy_start_date: formData.is_pregnant ? formData.pregnancy_start_date : null,
    };

    if (editingAnimal) {
      const { error } = await supabase
        .from('animals')
        .update(animalData)
        .eq('id', editingAnimal.id);
      
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Animal updated successfully' });
        fetchAnimals();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('animals')
        .insert([animalData]);
      
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Animal added successfully' });
        fetchAnimals();
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('animals')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Animal deleted successfully' });
      fetchAnimals();
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'pig',
      gender: 'male',
      birth_date: '',
      health_status: 'healthy',
      is_vaccinated: false,
      vaccination_date: '',
      is_pregnant: false,
      pregnancy_start_date: '',
      notes: '',
    });
    setEditingAnimal(null);
    setOpen(false);
  };

  const startEdit = (animal: Animal) => {
    setEditingAnimal(animal);
    setFormData({
      type: animal.type,
      gender: animal.gender,
      birth_date: animal.birth_date,
      health_status: animal.health_status,
      is_vaccinated: animal.is_vaccinated,
      vaccination_date: animal.vaccination_date || '',
      is_pregnant: animal.is_pregnant,
      pregnancy_start_date: animal.pregnancy_start_date || '',
      notes: animal.notes || '',
    });
    setOpen(true);
  };

  const getHealthBadgeColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-success text-success-foreground';
      case 'sick': return 'bg-destructive text-destructive-foreground';
      case 'quarantined': return 'bg-warning text-warning-foreground';
      case 'deceased': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted';
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('animals.title')}</h1>
          <p className="text-muted-foreground">Manage your farm animal inventory</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              {t('animals.addAnimal')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAnimal ? t('animals.edit') : t('animals.addAnimal')}</DialogTitle>
              <DialogDescription>Add or update animal information</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('animals.type')}</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pig">{t('animals.pig')}</SelectItem>
                      <SelectItem value="poultry">{t('animals.poultry')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('animals.gender')}</Label>
                  <Select value={formData.gender} onValueChange={(value: any) => setFormData({ ...formData, gender: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t('animals.male')}</SelectItem>
                      <SelectItem value="female">{t('animals.female')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>{t('animals.birthDate')}</Label>
                <Input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label>{t('animals.health')}</Label>
                <Select value={formData.health_status} onValueChange={(value: any) => setFormData({ ...formData, health_status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthy">{t('animals.healthy')}</SelectItem>
                    <SelectItem value="sick">{t('animals.sick')}</SelectItem>
                    <SelectItem value="quarantined">{t('animals.quarantined')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_vaccinated}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_vaccinated: checked })}
                />
                <Label>{t('animals.vaccinated')}</Label>
              </div>
              
              {formData.is_vaccinated && (
                <div>
                  <Label>{t('animals.vaccinationDate')}</Label>
                  <Input
                    type="date"
                    value={formData.vaccination_date}
                    onChange={(e) => setFormData({ ...formData, vaccination_date: e.target.value })}
                  />
                </div>
              )}
              
              {formData.gender === 'female' && (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.is_pregnant}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_pregnant: checked })}
                    />
                    <Label>{t('animals.pregnant')}</Label>
                  </div>
                  
                  {formData.is_pregnant && (
                    <div>
                      <Label>Pregnancy Start Date</Label>
                      <Input
                        type="date"
                        value={formData.pregnancy_start_date}
                        onChange={(e) => setFormData({ ...formData, pregnancy_start_date: e.target.value })}
                      />
                    </div>
                  )}
                </>
              )}
              
              <div>
                <Label>{t('animals.notes')}</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">{t('animals.save')}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>{t('animals.cancel')}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            {t('animals.filters')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>{t('animals.type')}</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('animals.all')}</SelectItem>
                  <SelectItem value="pig">{t('animals.pig')}</SelectItem>
                  <SelectItem value="poultry">{t('animals.poultry')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('animals.gender')}</Label>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('animals.all')}</SelectItem>
                  <SelectItem value="male">{t('animals.male')}</SelectItem>
                  <SelectItem value="female">{t('animals.female')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('animals.health')}</Label>
              <Select value={healthFilter} onValueChange={setHealthFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('animals.all')}</SelectItem>
                  <SelectItem value="healthy">{t('animals.healthy')}</SelectItem>
                  <SelectItem value="sick">{t('animals.sick')}</SelectItem>
                  <SelectItem value="quarantined">{t('animals.quarantined')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('animals.vaccination')}</Label>
              <Select value={vaccinationFilter} onValueChange={setVaccinationFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('animals.all')}</SelectItem>
                  <SelectItem value="vaccinated">{t('animals.vaccinated')}</SelectItem>
                  <SelectItem value="not-vaccinated">{t('animals.notVaccinated')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Animals List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAnimals.map((animal) => (
          <Card key={animal.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="mb-2">
                    {t(`animals.${animal.type}`)} - {t(`animals.${animal.gender}`)}
                  </Badge>
                  <CardTitle className="text-lg">
                    Born: {new Date(animal.birth_date).toLocaleDateString()}
                  </CardTitle>
                </div>
                <Badge className={getHealthBadgeColor(animal.health_status)}>
                  {t(`animals.${animal.health_status}`)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vaccination:</span>
                  <Badge variant={animal.is_vaccinated ? 'default' : 'secondary'}>
                    {animal.is_vaccinated ? t('animals.vaccinated') : t('animals.notVaccinated')}
                  </Badge>
                </div>
                {animal.is_pregnant && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className="bg-accent text-accent-foreground">{t('animals.pregnant')}</Badge>
                  </div>
                )}
                {animal.notes && (
                  <p className="text-muted-foreground mt-2">{animal.notes}</p>
                )}
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => startEdit(animal)}>
                    <Edit className="w-3 h-3 mr-1" />
                    {t('animals.edit')}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(animal.id)}>
                    <Trash2 className="w-3 h-3 mr-1" />
                    {t('animals.delete')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAnimals.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No animals found. Add your first animal to get started!
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Animals;
