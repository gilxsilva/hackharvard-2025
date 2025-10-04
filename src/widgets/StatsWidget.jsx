import { BarChart3, BookOpen, Target, Clock } from 'lucide-react';

export default function StatsWidget() {
  const stats = [
    {
      label: 'Classes This Week',
      value: '12',
      icon: BookOpen,
      color: 'text-blue-600'
    },
    {
      label: 'Study Hours',
      value: '24',
      icon: Clock,
      color: 'text-green-600'
    },
    {
      label: 'Assignments Due',
      value: '5',
      icon: Target,
      color: 'text-orange-600'
    },
    {
      label: 'Progress',
      value: '85%',
      icon: BarChart3,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">Weekly Overview</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="text-center p-3 bg-gray-50 rounded-md">
              <IconComponent className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <div className="font-bold text-lg text-gray-800">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

StatsWidget.id = 'stats';