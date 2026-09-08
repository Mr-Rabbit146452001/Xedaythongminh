import React from 'react';

interface KpiCardProps {
  title: string;
  value: React.ReactNode;
  icon: string;
  iconBgColor?: string;
  iconTextColor?: string;
  trend?: string;
  trendText?: string;
  trendType?: 'up' | 'down' | 'neutral' | 'warning';
  subtext?: string;
  borderColor?: string;
  badge?: string;
}

export default function KpiCard({
  title,
  value,
  icon,
  iconBgColor = 'bg-primary-container/10',
  iconTextColor = 'text-primary',
  trend,
  trendText,
  trendType = 'up',
  subtext,
  borderColor = 'border-outline-variant/30',
  badge,
}: KpiCardProps) {
  return (
    <div
      className={`bg-surface-container-lowest rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.03)] border ${borderColor} flex flex-col justify-between hover:shadow-[0_8px_24px_rgba(0,64,161,0.08)] transition-all duration-200 relative overflow-hidden`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-on-surface-variant font-semibold text-sm">{title}</span>
        <div className={`p-2 rounded-xl ${iconBgColor} ${iconTextColor} flex items-center justify-center`}>
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
      </div>

      <div>
        <div suppressHydrationWarning className="text-2xl font-bold text-on-surface tracking-tight mb-1.5">
          {value}
        </div>

        {(trend || trendText) && (
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {trendType === 'up' && (
              <div className="flex items-center text-success gap-0.5">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                <span>{trend}</span>
              </div>
            )}
            {trendType === 'down' && (
              <div className="flex items-center text-danger gap-0.5">
                <span className="material-symbols-outlined text-[16px]">trending_down</span>
                <span>{trend}</span>
              </div>
            )}
            {trendType === 'warning' && (
              <div className="flex items-center text-warning gap-0.5">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                <span>{trend}</span>
              </div>
            )}
            {trendType === 'neutral' && (
              <div className="flex items-center text-on-surface-variant gap-0.5">
                <span className="material-symbols-outlined text-[16px]">horizontal_rule</span>
                <span>{trend}</span>
              </div>
            )}
            {trendText && <span className="text-on-surface-variant font-normal">{trendText}</span>}
          </div>
        )}

        {subtext && <div className="text-xs text-on-surface-variant mt-1">{subtext}</div>}
      </div>

      {badge && (
        <span className="absolute top-3 right-12 text-[10px] font-bold px-2 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/20">
          {badge}
        </span>
      )}
    </div>
  );
}
