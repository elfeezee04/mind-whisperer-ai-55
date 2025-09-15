import { useState, useEffect } from 'react';
import { ChatBot } from '@/components/ChatBot';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Heart, Users, Target, Smile, Scale, UserCheck, Brain, Sun } from 'lucide-react';

interface Goal {
  id: string;
  name: string;
  description: string | null;
  icon_name: string | null;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  heart: Heart,
  users: Users,
  target: Target,
  smile: Smile,
  scale: Scale,
  userCheck: UserCheck,
  brain: Brain,
  sun: Sun,
};

const fallbackGoals: Goal[] = [
  { id: 'calm', name: 'Feel calm', description: null, icon_name: 'smile' },
  { id: 'relationships', name: 'Improve relationships', description: null, icon_name: 'users' },
  { id: 'productive', name: 'Be more productive', description: null, icon_name: 'target' },
  { id: 'sadness', name: 'Overcome sadness', description: null, icon_name: 'heart' },
  { id: 'balanced', name: 'Feel more balanced', description: null, icon_name: 'scale' },
  { id: 'shyness', name: 'Overcome shyness', description: null, icon_name: 'userCheck' },
];

const Index = () => {
  const [hasGoals, setHasGoals] = useState<boolean>(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const { data: availableGoals, error } = await supabase
          .from('mental_health_goals')
          .select('*')
          .order('id');

        if (error) throw error;

        if (!availableGoals || availableGoals.length === 0) {
          setGoals(fallbackGoals);
          setFallbackMode(true);
        } else {
          setGoals(availableGoals as Goal[]);
          setFallbackMode(false);
        }
      } catch (err) {
        console.error('Error loading goals:', err);
        setGoals(fallbackGoals);
        setFallbackMode(true);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId) ? prev.filter(id => id !== goalId) : [...prev, goalId]
    );
  };

  const handleContinue = async () => {
    if (selectedGoals.length < 1) {
      toast({
        title: 'Select at least 1 goal',
        description: 'Please select at least one goal to continue.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (!fallbackMode && user) {
        const rows = selectedGoals.map(goalId => ({ user_id: user.id, goal_id: goalId }));
        const { error } = await supabase.from('user_goals').insert(rows, { defaultToNull: true });
        if (error) throw error;
      }

      setHasGoals(true);
    } catch (error) {
      console.error('Error saving goals:', error);
      toast({ title: 'Could not save goals', description: 'Proceeding without saving.', variant: 'destructive' });
      setHasGoals(true);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while fetching goals
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Show goals selection if user hasn't selected goals yet
  if (hasGoals === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 pt-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              What brings you here?
            </h1>
            <p className="text-lg text-purple-100">
              We'll personalize your experience based on your goals.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {goals.map((goal) => {
              const IconComponent = goal.icon_name ? iconMap[goal.icon_name] : Heart;
              const isSelected = selectedGoals.includes(goal.id);
              
              return (
                <Card 
                  key={goal.id}
                  className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                    isSelected 
                      ? 'ring-2 ring-white bg-white/20 backdrop-blur-sm' 
                      : 'bg-white/10 backdrop-blur-sm hover:bg-white/15'
                  }`}
                  onClick={() => handleGoalToggle(goal.id)}
                >
                  <CardContent className="p-6 text-center">
                    {IconComponent && (
                      <IconComponent className="h-8 w-8 mx-auto mb-3 text-white" />
                    )}
                    <h3 className="text-xl font-bold text-white drop-shadow-md">
                      {goal.name}
                    </h3>
                    {goal.description && (
                      <p className="text-sm text-purple-100 mt-1">
                        {goal.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center">
            <Button 
              onClick={handleContinue}
              disabled={selectedGoals.length < 1 || loading}
              className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 disabled:opacity-50"
              size="lg"
            >
              {loading ? 'Saving...' : (selectedGoals.length < 1 ? 'Select at least 1 goal to continue' : `Continue (${selectedGoals.length} selected)`)}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <ChatBot />;
};

export default Index;
