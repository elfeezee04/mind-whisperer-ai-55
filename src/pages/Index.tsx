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

const Index = () => {
  const [hasGoals, setHasGoals] = useState<boolean | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const checkUserGoals = async () => {
      if (!user) return;
      
      try {
        const { data: userGoals, error: userGoalsError } = await supabase
          .from('user_goals')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (userGoalsError) throw userGoalsError;
        
        if (!userGoals || userGoals.length === 0) {
          // Fetch available goals for selection
          const { data: availableGoals, error: goalsError } = await supabase
            .from('mental_health_goals')
            .select('*')
            .order('id');
          
          if (goalsError) throw goalsError;
          
          setGoals(availableGoals || []);
          setHasGoals(false);
        } else {
          setHasGoals(true);
        }
      } catch (error) {
        console.error('Error checking user goals:', error);
        setHasGoals(false);
      }
    };

    checkUserGoals();
  }, [user]);

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => {
      if (prev.includes(goalId)) {
        return prev.filter(id => id !== goalId);
      } else if (prev.length < 3) {
        return [...prev, goalId];
      }
      return prev;
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

    if (!user) return;

    setLoading(true);

    try {
      const userGoals = selectedGoals.map(goalId => ({
        user_id: user.id,
        goal_id: goalId,
      }));

      const { error } = await supabase
        .from('user_goals')
        .insert(userGoals);

      if (error) throw error;

      toast({
        title: "Goals selected successfully!",
        description: "You can now start chatting with your personalized AI assistant.",
      });

      setHasGoals(true);
    } catch (error) {
      console.error('Error saving goals:', error);
      toast({
        title: "Error saving goals",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking goals
  if (hasGoals === null) {
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
              We'll personalize your experience based on your top 3 goals.
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
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {goal.name}
                    </h3>
                    <p className="text-sm text-purple-100">
                      {goal.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center">
            <Button 
              onClick={handleContinue}
              disabled={selectedGoals.length !== 3 || loading}
              className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 disabled:opacity-50"
              size="lg"
            >
              {loading ? 'Saving...' : `Select 3 goals to continue (${selectedGoals.length}/3)`}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <ChatBot />;
};

export default Index;
