"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type ProgressionData = {
    date: string;
    grade: number;
};

export default function ProgressionChart({ data }: { data: ProgressionData[] }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow col-span-1 md:col-span-2">
            <h3 className="font-bold text-lg mb-4 dark:text-white">Sua Progressão</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="date" tick={{ fill: '#6b7280' }} fontSize={12} />
                    <YAxis domain={[0, 1000]} tick={{ fill: '#6b7280' }} fontSize={12} />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#1f2937', 
                            borderColor: '#374151',
                            borderRadius: '0.5rem'
                        }}
                        labelStyle={{ color: '#f9fafb' }}
                    />
                    <Line type="monotone" dataKey="grade" name="Nota" stroke="#2E14ED" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}