'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Download, 
  Calendar, 
  Users,
  Building,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  DollarSign,
  Filter,
  Search,
  Phone
} from 'lucide-react';
import { DebtorsCreditors as DebtorsCreditors, } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { mockDebtorsCreditors } from '@/lib/mockData';

interface AgingBracketProps {
  label: string;
  amount: number;
  color: string;
  isOverdue?: boolean;
}

function AgingBracket({ label, amount, color, isOverdue }: AgingBracketProps) {
  return (
    <div className={`text-center p-3 rounded-lg ${color}`}>
      <div className="flex items-center justify-center mb-1">
        {isOverdue && <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />}
        <span className="text-xs font-medium text-gray-600">{label}</span>
      </div>
      <div className="text-lg font-bold text-gray-900">{formatCurrency(amount)}</div>
    </div>
  );
}

export default function DebtorsCreditors() {
  const [data] = useState<DebtorsCreditors[]>(mockDebtorsCreditors);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  const downloadReport = (format: 'pdf' | 'excel') => {
    console.log(`Downloading debtors & creditors report in ${format} format`);
  };

  const filteredData = data.filter(item => {
    const matchesType = typeFilter === 'ALL' || item.partyType === typeFilter;
    const matchesSearch = 
      item.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.panNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contactNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOverdue = !showOverdueOnly || item.overdueAmount > 0;
    
    return matchesType && matchesSearch && matchesOverdue;
  });

  // Calculate totals
  const debtors = filteredData.filter(item => item.partyType === 'debtor');
  const creditors = filteredData.filter(item => item.partyType === 'creditor');
  
  const totalDebtors = debtors.reduce((sum, item) => sum + item.outstandingAmount, 0);
  const totalCreditors = creditors.reduce((sum, item) => sum + item.outstandingAmount, 0);
  const totalOverdue = filteredData.reduce((sum, item) => sum + item.overdueAmount, 0);

  // Aging analysis
  const agingAnalysis = filteredData.reduce(
    (acc, item) => ({
      current: acc.current + item.agingBrackets.current,
      thirtyDays: acc.thirtyDays + item.agingBrackets.thirtyDays,
      sixtyDays: acc.sixtyDays + item.agingBrackets.sixtyDays,
      ninetyDaysPlus: acc.ninetyDaysPlus + item.agingBrackets.ninetyDaysPlus
    }),
    { current: 0, thirtyDays: 0, sixtyDays: 0, ninetyDaysPlus: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Debtors & Creditors</h1>
            <p className="text-gray-600 mt-1">
              Outstanding amounts and aging analysis for customers and suppliers
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                As of {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => downloadReport('pdf')}
                className="inline-flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Download className="h-4 w-4 mr-1" />
                PDF
              </button>
              <button
                onClick={() => downloadReport('excel')}
                className="inline-flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-1" />
                Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Debtors</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalDebtors)}</p>
              <p className="text-xs text-gray-500">{debtors.length} parties</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Creditors</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalCreditors)}</p>
              <p className="text-xs text-gray-500">{creditors.length} parties</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalOverdue)}</p>
              <p className="text-xs text-gray-500">Needs attention</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Net Position</p>
              <p className={`text-2xl font-bold ${totalDebtors > totalCreditors ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(totalDebtors - totalCreditors))}
              </p>
              <p className="text-xs text-gray-500">
                {totalDebtors > totalCreditors ? 'Favorable' : 'Unfavorable'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Aging Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Aging Analysis</h2>
          <p className="text-sm text-gray-600 mt-1">Outstanding amounts by age brackets</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <AgingBracket
              label="Current (0-30 days)"
              amount={agingAnalysis.current}
              color="bg-green-50 border border-green-200"
            />
            <AgingBracket
              label="31-60 days"
              amount={agingAnalysis.thirtyDays}
              color="bg-yellow-50 border border-yellow-200"
            />
            <AgingBracket
              label="61-90 days"
              amount={agingAnalysis.sixtyDays}
              color="bg-orange-50 border border-orange-200"
              isOverdue
            />
            <AgingBracket
              label="90+ days"
              amount={agingAnalysis.ninetyDaysPlus}
              color="bg-red-50 border border-red-200"
              isOverdue
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search parties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="ALL">All Types</option>
                <option value="debtor">Debtors Only</option>
                <option value="creditor">Creditors Only</option>
              </select>
            </div>
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={showOverdueOnly}
                onChange={(e) => setShowOverdueOnly(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
              />
              <span className="ml-2 text-gray-700">Overdue Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Debtors & Creditors Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Outstanding Balances ({filteredData.length} parties)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Party Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Outstanding
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overdue
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  31-60 Days
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  61-90 Days
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  90+ Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Transaction
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 ${
                        item.partyType === 'debtor' ? 'bg-blue-100' : 'bg-red-100'
                      }`}>
                        {item.partyType === 'debtor' ? (
                          <Users className={`h-4 w-4 ${item.partyType === 'debtor' ? 'text-blue-600' : 'text-red-600'}`} />
                        ) : (
                          <Building className={`h-4 w-4 ${item.partyType === 'debtor' ? 'text-blue-600' : 'text-red-600'}`} />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.partyName}</div>
                        {item.panNumber && (
                          <div className="text-sm text-gray-500">PAN: {item.panNumber}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.partyType === 'debtor' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {item.partyType === 'debtor' ? 'Debtor' : 'Creditor'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.contactNumber && (
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 text-gray-400 mr-1" />
                        {item.contactNumber}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono font-medium">
                    <span className={item.partyType === 'debtor' ? 'text-blue-600' : 'text-red-600'}>
                      {formatCurrency(item.outstandingAmount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono">
                    {item.overdueAmount > 0 ? (
                      <span className="text-red-600 font-medium">
                        {formatCurrency(item.overdueAmount)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-gray-900">
                    {item.agingBrackets.current > 0 ? formatCurrency(item.agingBrackets.current) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono">
                    {item.agingBrackets.thirtyDays > 0 ? (
                      <span className="text-yellow-600">{formatCurrency(item.agingBrackets.thirtyDays)}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono">
                    {item.agingBrackets.sixtyDays > 0 ? (
                      <span className="text-orange-600">{formatCurrency(item.agingBrackets.sixtyDays)}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono">
                    {item.agingBrackets.ninetyDaysPlus > 0 ? (
                      <span className="text-red-600 font-medium">{formatCurrency(item.agingBrackets.ninetyDaysPlus)}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 text-gray-400 mr-1" />
                      {formatDate(item.lastTransactionDate)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-900">
                  TOTAL
                </td>
                <td className="px-6 py-4 text-sm text-right font-mono font-bold text-gray-900">
                  {formatCurrency(filteredData.reduce((sum, item) => sum + item.outstandingAmount, 0))}
                </td>
                <td className="px-6 py-4 text-sm text-right font-mono font-bold text-red-600">
                  {formatCurrency(filteredData.reduce((sum, item) => sum + item.overdueAmount, 0))}
                </td>
                <td className="px-6 py-4 text-sm text-right font-mono font-bold text-gray-900">
                  {formatCurrency(agingAnalysis.current)}
                </td>
                <td className="px-6 py-4 text-sm text-right font-mono font-bold text-yellow-600">
                  {formatCurrency(agingAnalysis.thirtyDays)}
                </td>
                <td className="px-6 py-4 text-sm text-right font-mono font-bold text-orange-600">
                  {formatCurrency(agingAnalysis.sixtyDays)}
                </td>
                <td className="px-6 py-4 text-sm text-right font-mono font-bold text-red-600">
                  {formatCurrency(agingAnalysis.ninetyDaysPlus)}
                </td>
                <td className="px-6 py-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 p-6">
        <div className="flex items-start">
          <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">Action Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800">
              <div>
                <h4 className="font-medium mb-2">Overdue Collections:</h4>
                <ul className="space-y-1">
                  {filteredData
                    .filter(item => item.overdueAmount > 0)
                    .slice(0, 3)
                    .map(item => (
                      <li key={item.id}>
                        • {item.partyName}: {formatCurrency(item.overdueAmount)} overdue
                      </li>
                    ))}
                  {filteredData.filter(item => item.overdueAmount > 0).length > 3 && (
                    <li>• ...and {filteredData.filter(item => item.overdueAmount > 0).length - 3} more</li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Recommendations:</h4>
                <ul className="space-y-1">
                  <li>• Follow up on overdue accounts immediately</li>
                  <li>• Send payment reminders for 31-60 day bracket</li>
                  <li>• Review credit limits for high-risk accounts</li>
                  <li>• Consider collection agencies for 90+ day accounts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}








