import { useState } from 'react';
import Layout from '../components/Layout';
import ChatBar from '../components/ChatBar';
import DashboardGrid from '../components/DashboardGrid';
import ScheduleWidget from '../widgets/ScheduleWidget';
import AssignmentsWidget from '../widgets/AssignmentsWidget';
import GradesWidget from '../widgets/GradesWidget';
import StatsWidget from '../widgets/StatsWidget';

const defaultWidgets = [
  ScheduleWidget,
  AssignmentsWidget,
  GradesWidget,
  StatsWidget
];

export default function Dashboard() {
  const [widgets, setWidgets] = useState(defaultWidgets);

  const handleReorderWidgets = (reorderedWidgets) => {
    setWidgets(reorderedWidgets);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back!</h2>
          <p className="text-gray-600">Here's what's happening with your academic life today.</p>
        </div>

        <ChatBar />
        
        <DashboardGrid 
          widgets={widgets} 
          onReorder={handleReorderWidgets}
        />
      </div>
    </Layout>
  );
}