'use client';

import React from 'react';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ThumbsUp,
  Target,
  BarChart3,
  Phone,
  Video,
  MoreHorizontal,
  Paperclip,
  Mic,
  Download,
  MessageCircle
} from 'lucide-react';

export default function Dashboard() {
  const performanceMetrics = [
    {
      name: 'Finished',
      value: '18',
      change: '+8 tasks',
      changeType: 'positive',
      icon: ThumbsUp,
      color: 'bg-green-500'
    },
    {
      name: 'Tracked',
      value: '31h',
      change: '-6 hours',
      changeType: 'negative',
      icon: Clock,
      color: 'bg-red-500'
    },
    {
      name: 'Efficiency',
      value: '93%',
      change: '+12%',
      changeType: 'positive',
      icon: Target,
      color: 'bg-blue-500'
    }
  ];

  const currentTasks = [
    { 
      id: 'TASK-001', 
      title: 'Product Review for U18 Market', 
      status: 'In progress', 
      time: '4h',
      statusColor: 'bg-orange-500',
      statusBg: 'bg-orange-100',
      statusText: 'text-orange-800'
    },
    { 
      id: 'TASK-002', 
      title: 'UX Research for Product', 
      status: 'On hold', 
      time: '8h',
      statusColor: 'bg-blue-500',
      statusBg: 'bg-blue-100',
      statusText: 'text-blue-800'
    },
    { 
      id: 'TASK-003', 
      title: 'App design and development', 
      status: 'Done', 
      time: '32h',
      statusColor: 'bg-green-500',
      statusBg: 'bg-green-100',
      statusText: 'text-green-800'
    }
  ];

  const activityFeed = [
    {
      id: 'ACT-001',
      user: 'Floyd Miles',
      avatar: 'FM',
      action: 'Commented on Stark Project',
      time: '10:15 AM',
      message: 'Hi! Next week we\'ll start a new project. I\'ll tell you all the details later',
      hasReaction: true,
      reactionCount: 1
    },
    {
      id: 'ACT-002',
      user: 'Guy Hawkins',
      avatar: 'GH',
      action: 'Added a file to 7Heros Project',
      time: '10:15 AM',
      file: {
        name: 'Homepage.fig',
        size: '13.4 Mb',
        type: 'figma'
      }
    },
    {
      id: 'ACT-003',
      user: 'Kristin Watson',
      avatar: 'KW',
      action: 'Commented on 7Heros Project',
      time: '10:15 AM',
      hasComment: true
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Performance Metrics and Tasks */}
      <div className="lg:col-span-2 space-y-6">
        {/* Performance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {performanceMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                    <div className="flex items-center mt-2">
                      <div className={`w-2 h-2 rounded-full ${metric.changeType === 'positive' ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
                      <span className={`text-sm ${metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 ${metric.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Performance Graph */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
            <select className="text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-1">
              <option>01-07 May</option>
            </select>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Performance chart will be displayed here</p>
            </div>
          </div>
        </div>

        {/* Current Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-900">Current Tasks</h3>
              <span className="text-sm text-gray-600">Done 30%</span>
            </div>
            <select className="text-sm text-gray-600 border border-gray-300 rounded-lg px-3 py-1">
              <option>Week</option>
            </select>
          </div>
          <div className="space-y-4">
            {currentTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${task.statusColor}`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${task.statusBg} ${task.statusText}`}>
                        {task.status}
                      </span>
                      <span className="text-xs text-gray-500">{task.time}</span>
                    </div>
                  </div>
                </div>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Activity Feed */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Activity</h3>
          <div className="space-y-6">
            {activityFeed.map((activity) => (
              <div key={activity.id} className="flex space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {activity.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{activity.user}</span>
                    <span className="text-sm text-gray-600">{activity.action}</span>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                  
                  {activity.message && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{activity.message}</p>
                      {activity.hasReaction && (
                        <div className="flex items-center mt-2">
                          <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700">
                            <ThumbsUp className="h-3 w-3" />
                            <span>{activity.reactionCount}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {activity.file && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                          <div className="w-4 h-4 bg-purple-500 rounded"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.file.name}</p>
                          <p className="text-xs text-gray-500">{activity.file.size}</p>
                        </div>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {activity.hasComment && (
                    <div className="mt-2">
                      <button className="text-sm text-gray-500 hover:text-gray-700">
                        View comment
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Message Input */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Paperclip className="h-4 w-4" />
              </button>
              <input
                type="text"
                placeholder="Write a message"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Mic className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}