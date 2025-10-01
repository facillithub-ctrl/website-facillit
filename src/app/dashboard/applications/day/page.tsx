import createSupabaseServerClient from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { getShoppingLists, getHabits, getTransactions, getTasks } from './actions';
import DayClientPage from './DayClientPage';
import type { ShoppingList, Habit, Transaction, DayTask } from './actions';

export default async function FacillitDayPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Busca todos os dados em paralelo para otimizar o carregamento
  const [
    shoppingListsResult, 
    habitsResult,
    transactionsResult,
    tasksResult
  ] = await Promise.all([
    getShoppingLists(),
    getHabits(),
    getTransactions(),
    getTasks()
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-dark-text dark:text-white mb-6">Facillit Day</h1>
      <DayClientPage 
        initialShoppingLists={shoppingListsResult.data as ShoppingList[] || []}
        initialHabits={habitsResult.data as Habit[] || []}
        initialTransactions={transactionsResult.data as Transaction[] || []}
        initialTasks={tasksResult.data as DayTask[] || []}
      />
    </div>
  );
}