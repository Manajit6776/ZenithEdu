import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Plus, X, Check, AlertCircle, Mail, Phone, Video, MessageSquare, FileText, Bell, Search, CheckCircle, MapPin, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { appointmentService, teacherService } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface Appointment {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  date: string;
  time: string;
  duration: number;
  subject: string;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed' | 'Cancelled';
  createdAt: string;
  notes?: string;
  room?: string;
}

export const Appointments: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  // State management
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    duration: 30
  });

  // ... rest of the component logic remains the same

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [appointmentsData, teachersData] = await Promise.all([
        appointmentService.getAppointments(),
        teacherService.getTeachers()
      ]);

      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      setTeachers(Array.isArray(teachersData) ? teachersData : []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setAppointments([]);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedTeacher || !selectedDate || !selectedTime || !formData.subject) {
      return;
    }

    try {
      const appointment: Appointment = {
        id: Date.now().toString(),
        studentId: user?.id || '',
        studentName: user?.name || '',
        teacherId: selectedTeacher.id,
        teacherName: selectedTeacher.name,
        date: new Date(selectedDate + 'T00:00:00.000Z').toISOString(),
        time: selectedTime,
        duration: formData.duration,
        subject: formData.subject,
        description: formData.description,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      await appointmentService.createAppointment(appointment);

      setShowBookingForm(false);
      setFormData({ subject: '', description: '', duration: 30 });
      setSelectedTeacher(null);
      setSelectedDate('');
      setSelectedTime('');
      loadData();
    } catch (error) {
      console.error('Failed to book appointment:', error);
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId: string, status: Appointment['status']) => {
    try {
      await appointmentService.updateAppointmentStatus(appointmentId, status);
      loadData();
    } catch (error) {
      console.error('Failed to update appointment:', error);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.studentName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;

    // Filter based on user role
    const userAppointments = user?.role === 'Student'
      ? appointment.studentId === user?.id
      : user?.role === 'Teacher'
        ? appointment.teacherId === user?.id
        : true;

    return matchesSearch && matchesStatus && userAppointments;
  });

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100/50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200/50';
      case 'Approved': return 'bg-rose-100/50 text-rose-900 dark:bg-indigo-500/10 dark:text-indigo-400 border-rose-200/50';
      case 'Rejected': return 'bg-red-100/50 text-red-900 dark:bg-indigo-500/10 dark:text-indigo-400 border-red-200/50';
      case 'Completed': return 'bg-purple-100/50 text-purple-900 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200/50';
      case 'Cancelled': return 'bg-slate-100/50 text-slate-900 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200/50';
      default: return 'bg-slate-100/50 text-slate-900';
    }
  };

  // Calendar helper functions
  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      days.push({
        date: new Date(d),
        isCurrentMonth: d.getMonth() === currentMonth,
        isToday: d.toDateString() === today.toDateString()
      });
    }

    return days;
  };

  const getAppointmentsForDay = (day: { date: Date; isCurrentMonth: boolean; isToday: boolean }) => {
    if (!day.isCurrentMonth) return [];

    return filteredAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate.toDateString() === day.date.toDateString();
    });
  };

  // Mini calendar for sidebar
  const generateMiniCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    const days = [];
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    for (let d = new Date(startDate); d <= lastDay; d.setDate(d.getDate() + 1)) {
      days.push({
        date: new Date(d),
        isCurrentMonth: d.getMonth() === currentMonth,
        isToday: d.toDateString() === today.toDateString(),
        hasAppointments: filteredAppointments.some(appointment => {
          const appointmentDate = new Date(appointment.date);
          return appointmentDate.toDateString() === d.toDateString();
        })
      });
    }

    return days;
  };

  const getTodayAppointments = () => {
    const today = new Date().toDateString();
    return filteredAppointments.filter(appointment => {
      return new Date(appointment.date).toDateString() === today;
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600 dark:border-indigo-500"></div>
        <p className="text-rose-800 dark:text-indigo-400 animate-pulse font-black uppercase text-xs tracking-widest">Loading Appointments</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-rose-800 dark:text-white uppercase tracking-tight">Appointments</h1>
          <p className="text-[11px] font-black text-rose-700/60 dark:text-indigo-400/60 uppercase tracking-widest mt-1">
            {user?.role === 'Student'
              ? 'Request and manage clinical consultations'
              : 'Orchestrate elite engagement sessions'}
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          {user?.role === 'Student' && (
            <button
              onClick={() => setShowBookingForm(true)}
              className="px-6 py-2.5 bg-rose-600 dark:bg-indigo-600 hover:bg-rose-500 dark:hover:bg-indigo-500 text-white font-black rounded-xl transition-all shadow-lg shadow-rose-200/50 dark:shadow-indigo-500/20 uppercase text-xs tracking-widest flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {t('bookAppointment')}
            </button>
          )}

          <div className="bg-white/40 dark:bg-slate-900 rounded-xl border border-rose-200/30 dark:border-slate-700 p-1 flex">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list'
                ? 'bg-rose-600 dark:bg-indigo-600 text-white shadow-md'
                : 'text-rose-700/60 dark:text-indigo-400/60 hover:text-rose-900 dark:hover:text-indigo-400'
                }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'calendar'
                ? 'bg-rose-600 dark:bg-indigo-600 text-white shadow-md'
                : 'text-rose-700/60 dark:text-indigo-400/60 hover:text-rose-900 dark:hover:text-indigo-400'
                }`}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/40 dark:bg-slate-900 rounded-3xl border border-rose-100/50 dark:border-white/5 p-5 shadow-xl shadow-rose-200/5 backdrop-blur-md group hover:border-rose-400 dark:hover:border-indigo-500/30 transition-all">
          <div className="flex justify-between items-center text-left">
            <div>
              <p className="text-[9px] font-black text-rose-700/40 dark:text-indigo-400/40 uppercase tracking-widest mb-1.5">Pending Request</p>
              <p className="text-2xl font-black text-amber-500 dark:text-amber-400">
                {appointments.filter(a => a.status === 'Pending').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/10 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white/40 dark:bg-slate-900 rounded-3xl border border-rose-100/50 dark:border-white/5 p-5 shadow-xl shadow-rose-200/5 backdrop-blur-md group hover:border-rose-400 dark:hover:border-indigo-500/30 transition-all">
          <div className="flex justify-between items-center text-left">
            <div>
              <p className="text-[9px] font-black text-rose-700/40 dark:text-indigo-400/40 uppercase tracking-widest mb-1.5">Approved Sync</p>
              <p className="text-2xl font-black text-rose-600 dark:text-indigo-400">
                {appointments.filter(a => a.status === 'Approved').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-indigo-500/10 flex items-center justify-center text-rose-500 dark:text-indigo-400 border border-rose-500/10 dark:border-indigo-500/10 group-hover:scale-110 transition-transform">
              <Check className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white/40 dark:bg-slate-900 rounded-3xl border border-rose-100/50 dark:border-white/5 p-5 shadow-xl shadow-rose-200/5 backdrop-blur-md group hover:border-rose-400 dark:hover:border-indigo-500/30 transition-all">
          <div className="flex justify-between items-center text-left">
            <div>
              <p className="text-[9px] font-black text-rose-700/40 dark:text-indigo-400/40 uppercase tracking-widest mb-1.5">Compl. Missions</p>
              <p className="text-2xl font-black text-emerald-500 dark:text-emerald-400">
                {appointments.filter(a => a.status === 'Completed').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="bg-white/40 dark:bg-slate-900 rounded-3xl border border-rose-100/50 dark:border-white/5 p-5 shadow-xl shadow-rose-200/5 backdrop-blur-md group hover:border-rose-400 dark:hover:border-indigo-500/30 transition-all">
          <div className="flex justify-between items-center text-left">
            <div>
              <p className="text-[9px] font-black text-rose-700/40 dark:text-indigo-400/40 uppercase tracking-widest mb-1.5">Total Docket</p>
              <p className="text-2xl font-black text-rose-950 dark:text-white">
                {appointments.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-950/10 dark:bg-white/5 flex items-center justify-center text-rose-600 dark:text-indigo-400 border border-rose-200 dark:border-white/10 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/40 dark:bg-slate-900 rounded-[2rem] border border-rose-100 dark:border-white/5 p-4 md:p-5 shadow-xl shadow-rose-200/5 backdrop-blur-md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-rose-400 dark:text-indigo-400" />
            </div>
            <input
              type="text"
              placeholder="Search appointments or mentors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/60 dark:bg-slate-900 border border-rose-200/50 dark:border-white/10 rounded-2xl text-rose-900 dark:text-white placeholder:text-rose-300 dark:placeholder:indigo-400/30 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-indigo-500 transition-all font-bold text-xs uppercase tracking-widest"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-6 py-3 bg-white/60 dark:bg-slate-900 border border-rose-200/50 dark:border-white/10 rounded-2xl text-rose-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-indigo-500 transition-all font-black text-[10px] uppercase tracking-widest appearance-none cursor-pointer min-w-[160px]"
          >
            <option value="all">ALL PROTOCOLS</option>
            <option value="Pending">PENDING SYNC</option>
            <option value="Approved">APPROVED SESSION</option>
            <option value="Rejected">REJECTED REQUEST</option>
            <option value="Completed">COMPLETED MISSION</option>
            <option value="Cancelled">CANCELLED DATA</option>
          </select>
        </div>
      </div>
      {/* Appointments List/Calendar */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mini Calendar Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/40 dark:bg-slate-900 rounded-3xl border border-rose-200/30 dark:border-slate-700 p-6 shadow-xl shadow-rose-200/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black text-rose-800 dark:text-white uppercase tracking-tight">
                  {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex gap-1">
                  <button className="p-1.5 hover:bg-rose-100 dark:hover:bg-indigo-500/10 rounded-lg text-rose-400 dark:text-indigo-400/60 hover:text-rose-600 dark:hover:text-indigo-400 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button className="p-1.5 hover:bg-rose-100 dark:hover:bg-indigo-500/10 rounded-lg text-rose-400 dark:text-indigo-400/60 hover:text-rose-600 dark:hover:text-indigo-400 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black mb-4 text-rose-700/60 dark:text-slate-500 uppercase tracking-widest">
                <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center">
                {generateMiniCalendarDays().map((day, index) => (
                  <span
                    key={index}
                    className={`p-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${day.isCurrentMonth
                      ? day.isToday
                        ? 'bg-rose-600 dark:bg-indigo-600 text-white shadow-lg shadow-rose-200/50 dark:shadow-indigo-500/20'
                        : day.hasAppointments
                          ? 'text-rose-900 dark:text-indigo-300 bg-white/30 dark:bg-indigo-500/10 font-black ring-1 ring-rose-200/50 dark:ring-indigo-500/20'
                          : 'text-rose-700/60 dark:text-slate-400 hover:bg-rose-100/50 dark:hover:bg-indigo-600/10'
                      : 'text-rose-200 dark:text-slate-700'
                      }`}
                  >
                    {day.date.getDate()}
                  </span>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-rose-100 dark:border-slate-800">
                <h4 className="text-[10px] font-black text-rose-800 dark:text-slate-400 uppercase tracking-widest mb-4">Availability Window</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-2 bg-rose-50 dark:bg-white/5 border border-rose-100 dark:border-white/10 rounded-xl text-[10px] font-black text-rose-700 dark:text-slate-300 hover:border-rose-500 cursor-pointer transition-all uppercase tracking-tighter">09:00 AM</span>
                  <span className="px-3 py-2 bg-rose-50 dark:bg-white/5 border border-rose-100 dark:border-white/10 rounded-xl text-[10px] font-black text-rose-700 dark:text-slate-300 hover:border-rose-500 cursor-pointer transition-all uppercase tracking-tighter">10:30 AM</span>
                  <span className="px-3 py-2 bg-rose-100/50 dark:bg-slate-800 border-rose-200/20 rounded-xl text-[10px] font-black text-rose-300 dark:text-slate-600 line-through cursor-not-allowed uppercase tracking-tighter">02:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Schedule List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black text-rose-800 dark:text-white uppercase tracking-tight">
                {getTodayAppointments().length > 0 ? "Today's Agenda" : "Upcoming Consultations"}
              </h3>
              {user?.role === 'Student' && (
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="text-[10px] font-black text-rose-600 dark:text-indigo-400 hover:text-rose-500 dark:hover:text-indigo-300 uppercase tracking-widest transition-all"
                >
                  Quick Request
                </button>
              )}
            </div>

            {(getTodayAppointments().length > 0 ? getTodayAppointments() : filteredAppointments).length === 0 ? (
              <div className="bg-white/40 dark:bg-slate-900 p-12 text-center rounded-3xl border border-rose-200/30 dark:border-slate-700 shadow-xl shadow-rose-200/5">
                <Calendar className="w-16 h-16 mx-auto mb-6 text-rose-200 dark:text-slate-700" />
                <h3 className="text-xl font-black text-rose-900 dark:text-white uppercase tracking-tight mb-2">Clean Schedule</h3>
                <p className="text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">
                  {user?.role === 'Student'
                    ? 'No appointments today. Reach out to your mentors!'
                    : 'The docket is currently empty. More requests coming soon.'}
                </p>
              </div>
            ) : (
              (getTodayAppointments().length > 0 ? getTodayAppointments() : filteredAppointments).map((appointment) => (
                <div
                  key={appointment.id}
                  className={`bg-white/40 dark:bg-slate-900/40 p-5 rounded-2xl flex items-start gap-5 hover:bg-rose-50/60 dark:hover:bg-indigo-500/5 transition-all border border-rose-200/30 dark:border-slate-700 shadow-xl shadow-rose-200/5 group border-l-[6px] ${appointment.status === 'Pending' ? 'border-l-amber-500' :
                    appointment.status === 'Approved' ? 'border-l-rose-500 dark:border-l-indigo-500' :
                      appointment.status === 'Rejected' ? 'border-l-red-500 dark:border-l-indigo-500' :
                        appointment.status === 'Completed' ? 'border-l-emerald-500' :
                          'border-l-slate-500'
                    }`}
                >
                  <div className="flex flex-col items-center min-w-[70px] bg-rose-50 dark:bg-slate-800 p-3 rounded-xl ring-1 ring-rose-100 group-hover:bg-rose-100 transition-colors">
                    <span className="text-[10px] font-black text-rose-700/60 dark:text-slate-500 uppercase tracking-tighter">
                      {new Date(appointment.date).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-2xl font-black text-rose-900 dark:text-white">
                      {new Date(appointment.date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-black text-rose-900 dark:text-white group-hover:text-rose-700 transition-colors">{appointment.subject}</h4>
                        <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-1">
                          {user?.role === 'Student' ? 'Consulting with' : 'Requested by'}{' '}
                          <span className="text-rose-700 dark:text-indigo-400">
                            {user?.role === 'Student' ? appointment.teacherName : appointment.studentName}
                          </span>
                          {appointment.room && ` • Room ${appointment.room}`}
                        </p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${appointment.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400' :
                        appointment.status === 'Approved' ? 'bg-rose-50 dark:bg-indigo-500/10 border-rose-200 dark:border-indigo-500/20 text-rose-600 dark:text-indigo-400' :
                          appointment.status === 'Rejected' ? 'bg-red-50 dark:bg-indigo-500/10 border-red-200 dark:border-indigo-500/20 text-red-600 dark:text-indigo-400' :
                            appointment.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                              'bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20 text-slate-600 dark:text-slate-400'
                        }`}>
                        {appointment.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 mt-5 text-[10px] font-black text-rose-700/60 dark:text-slate-500 uppercase tracking-widest">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-rose-400" />
                        {appointment.time} — {appointment.duration} Minutes
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-6">
                      {user?.role === 'Teacher' && appointment.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateAppointmentStatus(appointment.id, 'Approved')}
                            className="px-5 py-2 bg-rose-600 dark:bg-indigo-600 hover:bg-rose-500 dark:hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-rose-200/30 dark:shadow-indigo-500/20"
                          >
                            Approve Slot
                          </button>
                          <button
                            onClick={() => handleUpdateAppointmentStatus(appointment.id, 'Rejected')}
                            className="px-5 py-2 bg-rose-100 dark:bg-indigo-500/10 text-rose-700 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-rose-200/50 dark:border-indigo-500/20 hover:bg-rose-200 dark:hover:bg-indigo-500/20"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {user?.role === 'Teacher' && appointment.status === 'Approved' && (
                        <button
                          onClick={() => handleUpdateAppointmentStatus(appointment.id, 'Completed')}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-200/30"
                        >
                          Mark Accomplished
                        </button>
                      )}

                      {user?.role === 'Student' && appointment.status === 'Pending' && (
                        <button
                          onClick={() => handleUpdateAppointmentStatus(appointment.id, 'Cancelled')}
                          className="px-5 py-2 bg-rose-100 dark:bg-indigo-500/10 text-rose-700 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-rose-200/50 dark:border-indigo-500/20 hover:bg-rose-200 dark:hover:bg-indigo-500/20"
                        >
                          Retract Request
                        </button>
                      )}

                      <button className="flex items-center gap-2 px-5 py-2 bg-white/50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 text-rose-800 dark:text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-rose-200/30">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Live Chat
                      </button>
                    </div>
                  </div>
                  <button className="p-2.5 hover:bg-rose-100 dark:hover:bg-slate-800 rounded-xl text-rose-400 transition-all">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Calendar View */
        <div className="bg-white/40 dark:bg-slate-900 rounded-3xl border border-rose-200/30 dark:border-slate-700 p-6 shadow-xl shadow-rose-200/5">
          <div className="grid grid-cols-7 gap-4 mb-6">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <div key={day} className="text-center text-[10px] font-black text-rose-800/60 dark:text-slate-500 uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-4">
            {generateCalendarDays().map((day, index) => {
              const dayAppointments = getAppointmentsForDay(day);
              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-3 rounded-2xl border transition-all ${day.isCurrentMonth
                    ? 'bg-white/50 dark:bg-slate-900 border-rose-100 dark:border-slate-800'
                    : 'bg-rose-50/10 dark:bg-slate-900/20 border-transparent opacity-40'
                    } ${day.isToday ? 'ring-2 ring-rose-500 dark:ring-indigo-500 shadow-lg shadow-rose-200/50 dark:shadow-indigo-500/20 relative z-10' : ''}`}
                >
                  <div className={`text-xs font-black mb-3 text-right ${day.isCurrentMonth ? 'text-rose-900 dark:text-slate-300' : 'text-rose-200 dark:text-slate-700'
                    } ${day.isToday ? 'text-rose-600' : ''}`}>
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-2">
                    {dayAppointments.slice(0, 3).map(appointment => (
                      <div
                        key={appointment.id}
                        className={`text-[9px] font-black p-2 rounded-lg truncate uppercase tracking-tighter ${appointment.status === 'Pending' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-500/30' :
                          appointment.status === 'Approved' ? 'bg-rose-100 dark:bg-indigo-500/20 text-rose-600 dark:text-indigo-400 ring-1 ring-rose-200 dark:ring-indigo-500/30' :
                            appointment.status === 'Rejected' ? 'bg-red-100 dark:bg-indigo-500/20 text-red-600 dark:text-indigo-400 ring-1 ring-red-200 dark:ring-indigo-500/30' :
                              appointment.status === 'Completed' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-500/30' :
                                'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        title={`${appointment.subject} - ${appointment.time}`}
                      >
                        {appointment.time} {appointment.subject}
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="text-[9px] font-black text-rose-800/40 text-center uppercase tracking-widest">
                        + {dayAppointments.length - 3} More
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-rose-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white/90 dark:bg-slate-900 rounded-3xl border border-rose-200/50 dark:border-slate-700 w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in duration-300 transition-all">
            <div className="p-8 border-b border-rose-100 dark:border-slate-800 bg-rose-50/50 dark:bg-slate-900">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-rose-800 dark:text-white uppercase tracking-tight">Request Consultation</h2>
                  <p className="text-[10px] font-bold text-rose-700/60 dark:text-slate-400 uppercase tracking-widest mt-1">Schedule a session with your academic mentor</p>
                </div>
                <button
                  onClick={() => setShowBookingForm(false)}
                  className="w-10 h-10 flex items-center justify-center bg-rose-100 dark:bg-slate-800 rounded-full text-rose-600 dark:text-white hover:bg-rose-200 transition-all font-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8">
              <form onSubmit={(e) => { e.preventDefault(); handleBookAppointment(); }} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-rose-800 dark:text-slate-400 mb-2 uppercase tracking-widest">Select Mentor</label>
                  <div className="relative">
                    <select
                      value={selectedTeacher?.id || ''}
                      onChange={(e) => {
                        const teacher = teachers.find(t => t.id === e.target.value);
                        setSelectedTeacher(teacher);
                        setSelectedDate('');
                        setSelectedTime('');
                      }}
                      className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900 border border-rose-200/30 dark:border-indigo-500/40 rounded-xl text-rose-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-indigo-500 transition-all font-bold appearance-none cursor-pointer"
                      required
                    >
                      <option value="">Choose your mentor</option>
                      {teachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name} — {teacher.specialization || teacher.department}
                        </option>
                      ))}
                    </select>
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-rose-800 dark:text-slate-400 mb-2 uppercase tracking-widest">Preferred Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setSelectedTime('');
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900 border border-rose-200/30 dark:border-indigo-500/40 rounded-xl text-rose-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-indigo-500 transition-all font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-rose-800 dark:text-slate-400 mb-2 uppercase tracking-widest">Time Slot</label>
                    <div className="relative">
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900 border border-rose-200/30 dark:border-indigo-500/40 rounded-xl text-rose-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-indigo-500 transition-all font-bold appearance-none cursor-pointer"
                        required
                      >
                        <option value="">Choose slot</option>
                        {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'].map((time) => (
                          <option key={time} value={time}>{time}:00</option>
                        ))}
                      </select>
                      <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-rose-800 dark:text-slate-400 mb-2 uppercase tracking-widest">Discussion Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Enter discussion title..."
                    className="w-full px-4 py-3 bg-white/50 dark:bg-slate-900 border border-rose-200/30 dark:border-indigo-500/40 rounded-xl text-rose-900 dark:text-white placeholder-rose-200 dark:placeholder-indigo-400/30 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-indigo-500 transition-all font-bold"
                    required
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-rose-50 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="px-6 py-3 text-[10px] font-black text-rose-700 dark:text-indigo-400/60 uppercase tracking-widest hover:text-rose-900 dark:hover:text-indigo-400 transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedTeacher || !selectedDate || !selectedTime || !formData.subject}
                    className="px-8 py-3 bg-rose-600 dark:bg-indigo-600 hover:bg-rose-500 dark:hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-rose-200/50 dark:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
;