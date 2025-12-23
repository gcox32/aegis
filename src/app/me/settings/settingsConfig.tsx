import React from 'react';
import { Bell, Shield, Database, Info, LucideIcon } from 'lucide-react';
import { UserSettings } from '@/lib/settings';

export type SettingItemType = 'toggle' | 'button' | 'link' | 'info' | 'component';

export interface BaseSettingItem {
  id: string;
  type: SettingItemType;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export interface ToggleSettingItem extends BaseSettingItem {
  type: 'toggle';
  settingKey: keyof UserSettings;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface ButtonSettingItem extends BaseSettingItem {
  type: 'button';
  action: () => void;
  variant?: 'default' | 'danger';
}

export interface LinkSettingItem extends BaseSettingItem {
  type: 'link';
  href: string;
}

export interface InfoSettingItem extends BaseSettingItem {
  type: 'info';
  value: string;
}

export interface ComponentSettingItem extends BaseSettingItem {
  type: 'component';
  component: React.ReactNode;
}

export type SettingItem = 
  | ToggleSettingItem 
  | ButtonSettingItem 
  | LinkSettingItem 
  | InfoSettingItem
  | ComponentSettingItem;

export interface SettingSection {
  id: string;
  title: string;
  icon: LucideIcon;
  items: SettingItem[];
}

interface SettingsConfigProps {
  settings: UserSettings;
  handlers: {
    handleSleepReminderChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
  env: {
    version: string;
    build: string;
  };
}

export const getSettingsConfig = ({ settings, handlers, env }: SettingsConfigProps): SettingSection[] => [
  {
    id: 'notifications',
    title: 'Notifications',
    icon: Bell,
    items: [
      {
        id: 'sleepReminder',
        type: 'toggle',
        label: 'Morning Sleep Reminder',
        description: 'Get reminded to log your sleep',
        settingKey: 'sleepReminder',
        onChange: handlers.handleSleepReminderChange,
      },
      {
        id: 'sessionReminders',
        type: 'toggle',
        label: 'Session Reminders',
        description: 'Get notified before training sessions',
        settingKey: 'sessionReminders',
        disabled: true,
      },
      {
        id: 'mealReminders',
        type: 'toggle',
        label: 'Meal Reminders',
        description: 'Reminders for meal times',
        settingKey: 'mealReminders',
        disabled: true,
      },
      {
        id: 'progressUpdates',
        type: 'toggle',
        label: 'Progress Updates',
        description: 'Weekly progress summaries',
        settingKey: 'progressUpdates',
        disabled: true,
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    icon: Shield,
    items: [
      {
        id: 'changePassword',
        type: 'button',
        label: 'Change Password',
        description: 'Update your account password',
        action: () => console.log('Change Password clicked'),
      },
      {
        id: 'dataExport',
        type: 'button',
        label: 'Data Export',
        description: 'Download your data',
        action: () => console.log('Data Export clicked'),
      },
      {
        id: 'deleteAccount',
        type: 'button',
        label: 'Delete Account',
        description: 'Permanently delete your account',
        action: () => console.log('Delete Account clicked'),
        variant: 'danger',
      },
    ],
  },
  {
    id: 'data',
    title: 'Data & Storage',
    icon: Database,
    items: [
      {
        id: 'storage',
        type: 'component',
        component: (
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Storage Used</span>
              <span className="text-sm text-muted-foreground">125 MB / 1 GB</span>
            </div>
            <div className="w-full bg-input rounded-full h-2">
              <div className="bg-brand-primary h-2 rounded-full" style={{ width: '12.5%' }}></div>
            </div>
          </div>
        ),
      },
      {
        id: 'clearCache',
        type: 'button',
        label: 'Clear Cache',
        action: () => console.log('Clear Cache clicked'),
      },
    ],
  },
  {
    id: 'about',
    title: 'About',
    icon: Info,
    items: [
      {
        id: 'version',
        type: 'info',
        label: 'Version',
        value: env.version,
      },
      {
        id: 'build',
        type: 'info',
        label: 'Build',
        value: env.build,
      },
      {
        id: 'tos',
        type: 'link',
        label: 'Terms of Service',
        href: '/terms-of-service',
      },
      {
        id: 'privacyPolicy',
        type: 'link',
        label: 'Privacy Policy',
        href: '/privacy-policy',
      },
    ],
  },
];

