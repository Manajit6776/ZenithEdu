
import React from 'react';

export enum UserRole {
  ADMIN = 'Admin',
  TEACHER = 'Teacher',
  STUDENT = 'Student',
  PARENT = 'Parent'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'High' | 'Medium' | 'Low';
  author: string;
  pinned?: boolean;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export interface ChartData {
  name: string;
  value: number;
  secondary?: number;
}

export interface HostelRoom {
  id: string;
  number: string;
  type: 'Single' | 'Double' | 'Shared';
  capacity: number;
  occupied: number;
  floor: number;
  status: 'Available' | 'Full' | 'Maintenance';
  fee: number;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  instructor: string;
  credits: number;
  progress: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  status: 'Available' | 'Issued' | 'Reserved' | 'Checked Out';
  coverUrl: string;
  rating?: number;
  views?: number;
}

export interface BusRoute {
  id: string;
  routeNumber: string;
  destination: string;
  driver: string;
  departureTime: string;
  status: 'OnTime' | 'Delayed' | 'Departed';
  capacity: number;
  nextStop?: string;
  eta?: string;
}

export interface FeeRecord {
  id: string;
  type: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  invoiceId: string;
}

export interface LiveClass {
  id: string;
  subject: string;
  topic: string;
  instructor: string;
  date: string;
  startTime: string;
  duration: string;
  status: 'Live' | 'Upcoming' | 'Ended';
  platform: 'Zoom' | 'GoogleMeet' | 'MicrosoftTeams' | 'Other';
  meetingLink?: string;
}
