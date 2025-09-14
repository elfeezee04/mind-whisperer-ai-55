import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Heart, Users, Target, Sun, Scale, Smile, CheckCircle } from 'lucide-react';

interface Goal {
  id: string;
  name: string;
  description: string;
  icon_name: string;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  heart: Heart,
  users: Users,
  target: Target,
  sun: Sun,
  scale: Scale,
  smile: Smile,
};

export default function GoalsSelection() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchGoals();
  }, [user, navigate]);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('mental_health_goals')
        .select('*')
        .order('created_at');

      if (error) throw error;
      setGoals(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading goals",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(id => id !== goalId);
      } else if (prev.length < 3) {
        return [...prev, goalId];
      } else {
        toast({
          title: "Maximum reached",
          description: "You can select up to 3 goals only.",
        });
        return prev;
      }
    });
  };

  const handleContinue = async () => {
    if (selectedGoals.length !== 3) {
      toast({
        title: "Please select exactly 3 goals",
        description: "You need to select exactly 3 goals to continue.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Clear any existing goals for this user
      await supabase
        .from('user_goals')
        .delete()
        .eq('user_id', user?.id);

      // Insert new selected goals
      const userGoals = selectedGoals.map(goalId => ({
        user_id: user?.id,
        goal_id: goalId,
      }));

      const { error } = await supabase
        .from('user_goals')
        .insert(userGoals);

      if (error) throw error;

      toast({
        title: "Goals saved!",
        description: "Your mental health goals have been set successfully.",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error saving goals",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">
          What brings you here?
        </h1>
        <p className="text-purple-100 text-lg">
          We'll personalize your experience based on your top 3 goals.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-lg mb-8">
        {goals.map((goal) => {
          const IconComponent = iconMap[goal.icon_name] || Heart;
          const isSelected = selectedGoals.includes(goal.id);
          
          return (
            <Card 
              key={goal.id}
              className={`relative overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                isSelected 
                  ? 'ring-4 ring-white ring-opacity-60 shadow-xl' 
                  : 'hover:shadow-lg'
              }`}
              onClick={() => toggleGoal(goal.id)}
            >
              <div className="aspect-square bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm p-6 flex flex-col items-center justify-center text-center">
                {isSelected && (
                  <CheckCircle className="absolute top-2 right-2 h-6 w-6 text-green-400 fill-white" />
                )}
                <IconComponent className="h-12 w-12 text-white mb-3" />
                <p className="text-white font-semibold text-sm leading-tight">
                  {goal.name}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="w-full max-w-lg">
        <Button 
          onClick={handleContinue}
          disabled={selectedGoals.length !== 3 || loading}
          className="w-full py-4 text-lg font-semibold bg-white/20 text-white border-2 border-white/30 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
        >
          {loading ? 'Saving...' : selectedGoals.length === 3 ? 'Continue to Chat' : `Select ${3 - selectedGoals.length} ${selectedGoals.length === 2 ? 'more goal' : 'more goals'} to continue`}
        </Button>
        
        {selectedGoals.length === 3 && (
          <p className="text-center text-purple-100 mt-3 text-sm">
            Perfect! You've selected your 3 goals. Click to continue.
          </p>
        )}
      </div>
    </div>
  );
}