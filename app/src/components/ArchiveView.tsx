import React, { useState, useMemo } from 'react';
import {
  Archive,
  Search,
  Filter,
  Clock,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  User,
  Tag,
  Undo2,
} from 'lucide-react';
import { AuditLogEntry } from '../types/audit';
import { formatDateAr } from '../utils/formatters';

interface ArchiveViewProps {
  auditLogs: AuditLogEntry[];
  onUndoChange?: (log: AuditLogEntry) => void;
  onClearLogs?: () => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  auditLogs,
  onUndoChange,
  onClearLogs,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (actionFilter !== 'all' && log.group !== actionFilter) return false;
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const matchItem = log.itemName?.toLowerCase().includes(s);
        const matchUser = log.user?.toLowerCase().includes(s);
        const matchField = log.field?.toLowerCase().includes(s);
        const matchRef = log.referenceNumber?.toLowerCase().includes(s);
        if (!matchItem && !matchUser && !matchField && !matchRef) return false;
      }
      return true;
    });
  }, [auditLogs, actionFilter, searchTerm]);

  const groupBadge: Record<string, { label: string; bg: string }> = {
    selling_prices: { label: 'أسعار البيع', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' },
    decisions: { label: 'قرارات واعتمادات', bg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' },
    purchase_costs: { label: 'تكاليف شراء', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
    box_formulations: { label: 'هندسة بوكس', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
    settings: { label: 'إعدادات النظام', bg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
    catalog: { label: 'الكتالوج', bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300' },
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header & Stats */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              سجل التدقيق والحركات التاريخية (Audit Trail)
            </h3>
            <p className="text-xs text-slate-500">
              توثيق زمني غير قابل للتلاعب لجميع قرارات التسعير، التكاليف، والاعتمادات
            </p>
          </div>
        </div>

        {onClearLogs && auditLogs.length > 0 && (
          <button
            type="button"
            onClick={onClearLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            تفريغ السجل
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالصنف، الحقل، المستخدم، أو رقم المذكرة..."
            className="w-full pl-3 pr-9 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
        >
          <option value="all">جميع أنواع العمليات</option>
          <option value="price_change">تعديل أسعار</option>
          <option value="memo_approval">اعتماد مذكرات</option>
          <option value="cost_update">تحديث تكلفة</option>
          <option value="box_created">إنشاء بوكس</option>
          <option value="settings_update">تحديث إعدادات</option>
        </select>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
              <tr>
                <th className="p-3.5 pr-5">الوقت والتاريخ</th>
                <th className="p-3.5">العملية</th>
                <th className="p-3.5">الصنف / الكيان</th>
                <th className="p-3.5">الحقل المعدل</th>
                <th className="p-3.5">القيمة السابقة</th>
                <th className="p-3.5">القيمة الجديدة</th>
                <th className="p-3.5">المستخدم / المرجع</th>
                <th className="p-3.5 text-center">تراجع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => {
                const badge = groupBadge[log.group] || {
                  label: log.group,
                  bg: 'bg-slate-100 text-slate-700',
                };
                return (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 pr-5 font-mono text-slate-400">
                      {formatDateAr(log.timestamp)}
                    </td>
                    <td className="p-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                      {log.itemName || log.itemId || '—'}
                    </td>
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">
                      {log.field || '—'}
                    </td>
                    <td className="p-3.5 font-mono text-rose-500 line-through">
                      {String(log.previousValue ?? '—')}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {String(log.newValue ?? '—')}
                    </td>
                    <td className="p-3.5 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{log.user || 'النظام'}</span>
                        {log.referenceNumber && (
                          <span className="font-mono text-purple-600 dark:text-purple-400 mr-1 text-[10px]">
                            ({log.referenceNumber})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      {onUndoChange && log.previousValue !== undefined && (
                        <button
                          type="button"
                          onClick={() => onUndoChange(log)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="تراجع عن هذه القيمة واستعادة السابقة"
                        >
                          <Undo2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    لا توجد سجلات تدقيق مسجلة حالياً.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
