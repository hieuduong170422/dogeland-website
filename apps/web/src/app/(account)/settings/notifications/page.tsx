'use client';

import { Bell } from 'lucide-react';

export default function NotificationSettingsPage() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bell size={18} className="text-primary" />
        <h2 className="font-semibold">Cài đặt thông báo</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Tính năng cài đặt thông báo chi tiết sẽ sớm ra mắt.
      </p>
    </div>
  );
}
