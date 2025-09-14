import { useState, useEffect } from 'react';
import { ChatBot } from '@/components/ChatBot';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [hasGoals, setHasGoals] = useState<boolean | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserGoals = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_goals')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (error) throw error;
        
        if (!data || data.length === 0) {
          navigate('/goals-selection');
        } else {
          setHasGoals(true);
        }
      } catch (error) {
        console.error('Error checking user goals:', error);
        // On error, redirect to goals selection to be safe
        navigate('/goals-selection');
      }
    };

    checkUserGoals();
  }, [user, navigate]);

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

  return <ChatBot />;
};

export default Index;
