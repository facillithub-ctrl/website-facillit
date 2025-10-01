"use client";

import { useState, useTransition, ReactNode } from 'react';
import type { ShoppingList, ShoppingListItem, Habit, Transaction, DayTask } from './actions';
import { 
    addShoppingItem, toggleShoppingItem, createShoppingList, 
    toggleHabitCompletion, addHabit,
    addTransaction,
    addTask, toggleTask
} from './actions';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';


// --- Tipos e Dados para as Abas ---
type Tab = 'home' | 'health' | 'finance' | 'productivity';
const tabs: { id: Tab; label: string; icon: string; }[] = [
  { id: 'home', label: 'Casa e Vida', icon: 'fa-home' },
  { id: 'health', label: 'Saúde', icon: 'fa-heartbeat' },
  { id: 'finance', label: 'Finanças', icon: 'fa-wallet' },
  { id: 'productivity', label: 'Produtividade', icon: 'fa-rocket' },
];

// --- Componente de Conteúdo da Aba ---
const TabContent = ({ children, isActive }: { children: ReactNode, isActive: boolean }) => (
  <div className={`${isActive ? 'block animate-fade-in' : 'hidden'}`}>{children}</div>
);

// ============================================================================
// --- COMPONENTES DA ABA "CASA E VIDA" ---
// ============================================================================
function ShoppingListItemComponent({ item }: { item: ShoppingListItem }) {
    const [isChecked, setIsChecked] = useState(item.is_checked);
    const [isPending, startTransition] = useTransition();
    const handleToggle = () => { const newCheckedState = !isChecked; setIsChecked(newCheckedState); startTransition(() => { toggleShoppingItem(item.id, newCheckedState); }); };
    return ( <li className="flex items-center justify-between py-2 transition-colors duration-200"><label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={isChecked} onChange={handleToggle} disabled={isPending} className="h-5 w-5 rounded border-gray-300 text-royal-blue focus:ring-royal-blue dark:bg-gray-700 dark:border-gray-600" /><span className={`dark:text-gray-300 ${isChecked ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>{item.name}</span></label></li> );
}
function ShoppingListComponent({ list }: { list: ShoppingList }) {
    const [newItemName, setNewItemName] = useState('');
    const [isPending, startTransition] = useTransition();
    const handleAddItem = (e: React.FormEvent) => { e.preventDefault(); if (!newItemName.trim()) return; startTransition(async () => { await addShoppingItem(list.id, newItemName); setNewItemName(''); }); };
    return ( <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex flex-col h-full"><h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2"><i className="fas fa-shopping-basket text-royal-blue"></i>{list.title}</h3><div className="flex-grow overflow-y-auto"><ul className="divide-y dark:divide-gray-700">{list.items.map(item => ( <ShoppingListItemComponent key={item.id} item={item} /> ))}</ul></div><form onSubmit={handleAddItem} className="mt-4 flex gap-2"><input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="Adicionar item..." disabled={isPending} className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-royal-blue" /><button type="submit" disabled={isPending || !newItemName.trim()} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-opacity"><i className="fas fa-plus"></i></button></form></div> );
}
function AddNewListComponent() {
    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState('');
    const [isPending, startTransition] = useTransition();
    const handleCreateList = async (e: React.FormEvent) => { e.preventDefault(); startTransition(async () => { const result = await createShoppingList(title); if (!result.error) { setTitle(''); setIsCreating(false); } else { alert(result.error); } }); };
    if (!isCreating) { return ( <button onClick={() => setIsCreating(true)} className="w-full min-h-[200px] h-full bg-white/60 dark:bg-gray-800/60 border-2 border-dashed dark:border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-royal-blue transition-colors"><i className="fas fa-plus text-3xl"></i><span className="mt-2 font-bold">Adicionar Nova Lista</span></button> ); }
    return ( <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow h-full flex flex-col justify-center"><form onSubmit={handleCreateList}><h3 className="font-bold text-lg mb-4 dark:text-white">Nova Lista de Compras</h3><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Compras da Semana" autoFocus className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-royal-blue" /><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setIsCreating(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500">Cancelar</button><button type="submit" disabled={isPending || !title.trim()} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-opacity">{isPending ? 'Criando...' : 'Criar'}</button></div></form></div> );
}

// ============================================================================
// --- COMPONENTES DA ABA "SAÚDE" ---
// ============================================================================
function HabitTracker({ habits: initialHabits }: { habits: Habit[] }) {
    const [habits, setHabits] = useState(initialHabits);
    const [isPending, startTransition] = useTransition();

    const handleToggle = (habit: Habit) => {
        startTransition(async () => {
            await toggleHabitCompletion(habit.id);
            // Otimistamente atualiza a UI
            setHabits(currentHabits => currentHabits.map(h => 
                h.id === habit.id 
                ? { ...h, completions: [{ count: (h.completions?.[0]?.count ?? 0) + 1 }] }
                : h
            ));
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="font-bold text-lg mb-4 dark:text-white"><i className="fas fa-walking mr-2 text-royal-blue"></i>Rastreador de Hábitos</h3>
            <div className="space-y-3">
                {habits.map(habit => {
                    const count = habit.completions?.[0]?.count ?? 0;
                    const isComplete = count >= habit.goal;
                    return (
                        <div key={habit.id} className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-700/50">
                            <div className="flex items-center gap-3">
                                <i className={`fas ${habit.icon} text-xl ${isComplete ? 'text-green-500' : 'text-gray-400'}`}></i>
                                <div>
                                    <p className="font-medium dark:text-white">{habit.name}</p>
                                    <p className="text-xs text-gray-500">{count} / {habit.goal} {habit.unit}</p>
                                </div>
                            </div>
                            <button onClick={() => handleToggle(habit)} disabled={isPending || isComplete} className="bg-gray-200 dark:bg-gray-700 w-10 h-10 rounded-full font-bold text-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">+</button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================================================
// --- COMPONENTES DA ABA "FINANÇAS" ---
// ============================================================================
function FinanceTracker({ initialTransactions }: { initialTransactions: Transaction[] }) {
    const [isPending, startTransition] = useTransition();
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = { description: formData.get('description') as string, amount: parseFloat(formData.get('amount') as string), type: formData.get('type') as 'income' | 'expense', category: formData.get('category') as string, };
        startTransition(() => { addTransaction(data); });
        e.currentTarget.reset();
    };

    const totalIncome = initialTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const totalExpenses = initialTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    const balance = totalIncome - totalExpenses;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow"><h3 className="font-bold text-lg mb-4 dark:text-white"><i className="fas fa-receipt mr-2 text-royal-blue"></i>Últimas Transações</h3><ul className="divide-y dark:divide-gray-700 max-h-96 overflow-y-auto">{initialTransactions.map(t => ( <li key={t.id} className="py-3 flex justify-between items-center"><div><p className="font-medium dark:text-white">{t.description}</p><p className="text-sm text-gray-500 capitalize">{t.category || t.type}</p></div><p className={`font-bold text-lg ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>{t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toFixed(2)}</p></li> ))}</ul></div>
            <div className="space-y-6"><div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"><h3 className="font-bold text-lg mb-4 dark:text-white"><i className="fas fa-balance-scale mr-2 text-royal-blue"></i>Balanço do Mês</h3><div className="space-y-2"><div className="flex justify-between text-sm"><span className="text-green-500 font-semibold">Receitas</span><span className="font-medium">R$ {totalIncome.toFixed(2)}</span></div><div className="flex justify-between text-sm"><span className="text-red-500 font-semibold">Despesas</span><span className="font-medium">R$ {totalExpenses.toFixed(2)}</span></div><div className="flex justify-between font-bold text-lg border-t pt-2 mt-2 dark:border-gray-700"><span className="dark:text-white">Saldo</span><span>R$ {balance.toFixed(2)}</span></div></div></div><div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"><h3 className="font-bold text-lg mb-4 dark:text-white"><i className="fas fa-plus-circle mr-2 text-royal-blue"></i>Nova Transação</h3><form onSubmit={handleSubmit} className="space-y-3"><input name="description" placeholder="Descrição" required className="w-full p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600"/><input name="amount" type="number" step="0.01" placeholder="Valor (R$)" required className="w-full p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600"/><select name="type" className="w-full p-2 border rounded-md text-sm bg-white dark:bg-gray-700 dark:border-gray-600"><option value="expense">Despesa</option><option value="income">Receita</option></select><input name="category" placeholder="Categoria (ex: Alimentação)" className="w-full p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600"/><button type="submit" disabled={isPending} className="w-full py-2 bg-royal-blue text-white font-bold rounded-lg disabled:bg-gray-400">Adicionar</button></form></div></div>
        </div>
    );
}

// ============================================================================
// --- COMPONENTES DA ABA "PRODUTIVIDADE" ---
// ============================================================================
function TaskManager({ initialTasks }: { initialTasks: DayTask[] }) {
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isPending, startTransition] = useTransition();

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(() => {
            addTask(newTaskTitle, 'normal');
            setNewTaskTitle('');
        });
    };

    const handleToggleTask = (task: DayTask) => {
        startTransition(() => {
            toggleTask(task.id, !task.is_completed);
        });
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="font-bold text-lg mb-4 dark:text-white"><i className="fas fa-tasks mr-2 text-royal-blue"></i>Gerenciador de Tarefas</h3>
            <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                <input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="Nova tarefa..." className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600" />
                <button type="submit" disabled={isPending || !newTaskTitle.trim()} className="bg-royal-blue text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">Adicionar</button>
            </form>
            <ul className="space-y-2">
                {initialTasks.map(task => (
                    <li key={task.id} className="flex items-center gap-3">
                        <input type="checkbox" checked={task.is_completed} onChange={() => handleToggleTask(task)} className="h-5 w-5 rounded border-gray-300 text-royal-blue focus:ring-royal-blue"/>
                        <span className={`${task.is_completed ? 'line-through text-gray-400' : 'dark:text-white'}`}>{task.title}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// ============================================================================
// --- COMPONENTE PRINCIPAL ---
// ============================================================================
interface DayClientPageProps {
  initialShoppingLists: ShoppingList[];
  initialHabits: Habit[];
  initialTransactions: Transaction[];
  initialTasks: DayTask[];
}

export default function DayClientPage({ 
    initialShoppingLists, 
    initialHabits,
    initialTransactions,
    initialTasks
}: DayClientPageProps) {
    const [activeTab, setActiveTab] = useState<Tab>('home');

    return (
        <div>
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700"><nav className="flex space-x-4" aria-label="Tabs">{tabs.map(tab => ( <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={` ${activeTab === tab.id ? 'border-royal-blue text-royal-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'} flex items-center gap-2 whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors`}> <i className={`fas ${tab.icon}`}></i> {tab.label} </button> ))}</nav></div>
            <div>
                <TabContent isActive={activeTab === 'home'}><h2 className="text-2xl font-bold text-dark-text dark:text-white mb-4">Casa e Vida Doméstica</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{initialShoppingLists.map(list => <ShoppingListComponent key={list.id} list={list} />)}<AddNewListComponent /></div></TabContent>
                <TabContent isActive={activeTab === 'health'}><h2 className="text-2xl font-bold text-dark-text dark:text-white mb-4">Saúde e Bem-estar</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><HabitTracker habits={initialHabits} /></div></TabContent>
                <TabContent isActive={activeTab === 'finance'}><h2 className="text-2xl font-bold text-dark-text dark:text-white mb-4">Controle Financeiro</h2><FinanceTracker initialTransactions={initialTransactions} /></TabContent>
                <TabContent isActive={activeTab === 'productivity'}><h2 className="text-2xl font-bold text-dark-text dark:text-white mb-4">Produtividade e Estudo</h2><TaskManager initialTasks={initialTasks} /></TabContent>
            </div>
        </div>
    );
}