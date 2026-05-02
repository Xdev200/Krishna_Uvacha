import { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';

export const useStreak = () => {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    dbService.getStreak().then(setStreak);
  }, []);

  return streak;
};
