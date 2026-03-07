import React, { useState, useEffect, useMemo } from 'react';
import {
  Home, Users, Key, Bed, Plus, Search, Filter,
  MoreVertical, CheckCircle, AlertCircle, DollarSign,
  Briefcase, X, User as UserIcon, Calendar, BedDouble, MessageSquare, QrCode,
  Download, Printer, Eye, Trash2, Edit, ExternalLink, Star, Bath, Wifi, Tv,
  Snowflake, Wind, Volume2, MapPin, Phone, Mail, Clock, ChevronRight,
  Shield, Lock, Camera, Zap, Bell, Settings, HelpCircle, Info,
  Thermometer, Droplets, Sun, Moon, Coffee, Utensils, Pizza, Apple
} from 'lucide-react';
// ── Inline hostel data (replaces deleted api-mock) ───────────────────────────
const hostelRooms = [
  { id: 'r1', number: '101', type: 'Single', floor: 1, gender: 'Male', capacity: 1, occupied: 0, fee: 800, status: 'Available', amenities: ['WiFi', 'AC', 'Attached Bath'] },
  { id: 'r2', number: '102', type: 'Shared', floor: 1, gender: 'Male', capacity: 3, occupied: 2, fee: 500, status: 'Available', amenities: ['WiFi', 'Fan', 'Common Bath'] },
  { id: 'r3', number: '201', type: 'Deluxe', floor: 2, gender: 'Female', capacity: 2, occupied: 2, fee: 1200, status: 'Full', amenities: ['WiFi', 'AC', 'TV', 'Attached Bath'] },
  { id: 'r4', number: '202', type: 'Shared', floor: 2, gender: 'Female', capacity: 4, occupied: 1, fee: 450, status: 'Available', amenities: ['WiFi', 'Fan'] },
  { id: 'r5', number: '301', type: 'Suite', floor: 3, gender: 'Mixed', capacity: 2, occupied: 0, fee: 1500, status: 'Available', amenities: ['WiFi', 'AC', 'TV', 'Kitchen', 'Attached Bath'] },
  { id: 'r6', number: '302', type: 'Standard', floor: 3, gender: 'Male', capacity: 3, occupied: 3, fee: 600, status: 'Full', amenities: ['WiFi', 'Fan', 'Common Bath'] },
  { id: 'r7', number: '401', type: 'Deluxe', floor: 4, gender: 'Female', capacity: 2, occupied: 0, fee: 1100, status: 'Available', amenities: ['WiFi', 'AC', 'Attached Bath'] },
  { id: 'r8', number: '402', type: 'Single', floor: 4, gender: 'Mixed', capacity: 1, occupied: 0, fee: 850, status: 'Maintenance', amenities: ['WiFi', 'AC'] },
];

const hostelAllocations = [
  { id: 'a1', studentId: 's2', roomId: 'r2', roomNumber: '102', semester: 'Spring 2025' },
  { id: 'a2', studentId: 's3', roomId: 'r2', roomNumber: '102', semester: 'Spring 2025' },
  { id: 'a3', studentId: 's4', roomId: 'r3', roomNumber: '201', semester: 'Spring 2025' },
  { id: 'a4', studentId: 's5', roomId: 'r3', roomNumber: '201', semester: 'Spring 2025' },
  { id: 'a5', studentId: 's6', roomId: 'r4', roomNumber: '202', semester: 'Spring 2025' },
  { id: 'a6', studentId: 's7', roomId: 'r6', roomNumber: '302', semester: 'Spring 2025' },
  { id: 'a7', studentId: 's8', roomId: 'r6', roomNumber: '302', semester: 'Spring 2025' },
  { id: 'a8', studentId: 's9', roomId: 'r6', roomNumber: '302', semester: 'Spring 2025' },
];

const hostelStudents = [
  { id: 's1', name: 'Arun Sharma', rollNo: 'CS2021001', department: 'Computer Science' },
  { id: 's2', name: 'Priya Nair', rollNo: 'EC2021002', department: 'Electronics' },
  { id: 's3', name: 'Rohan Mehta', rollNo: 'ME2021003', department: 'Mechanical' },
  { id: 's4', name: 'Sneha Patel', rollNo: 'CE2021004', department: 'Civil' },
  { id: 's5', name: 'Vikram Singh', rollNo: 'CS2021005', department: 'Computer Science' },
  { id: 's6', name: 'Anjali Rao', rollNo: 'IT2021006', department: 'IT' },
  { id: 's7', name: 'Deepak Kumar', rollNo: 'CS2021007', department: 'Computer Science' },
  { id: 's8', name: 'Kavya Reddy', rollNo: 'ME2021008', department: 'Mechanical' },
  { id: 's9', name: 'Siddharth Joshi', rollNo: 'EC2021009', department: 'Electronics' },
  { id: 's10', name: 'Neha Gupta', rollNo: 'CS2021010', department: 'Computer Science' },
];

const hostelApi = {
  getHostelRooms: () => Promise.resolve([...hostelRooms]),
  getHostelAllocations: () => Promise.resolve([...hostelAllocations]),
  getStudents: () => Promise.resolve([...hostelStudents]),
  allocateRoom: (data: { studentId: string; studentName: string; roomId: string; roomNumber: string; semester: string }) => {
    const room = hostelRooms.find(r => r.id === data.roomId);
    if (!room) throw new Error('Room not found');
    if (room.occupied >= room.capacity) throw new Error('Room is at full capacity');
    room.occupied += 1;
    if (room.occupied >= room.capacity) room.status = 'Full';
    hostelAllocations.push({ id: `a${Date.now()}`, studentId: data.studentId, roomId: data.roomId, roomNumber: data.roomNumber, semester: data.semester });
    return Promise.resolve({ success: true });
  },
};
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const Hostel: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [filterType, setFilterType] = useState<string>('All');
  const [filterFloor, setFilterFloor] = useState<string>('All');
  const [filterGender, setFilterGender] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [rooms, setRooms] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [showRoomDetailsModal, setShowRoomDetailsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'number' | 'fee' | 'capacity' | 'floor'>('number');
  const [formData, setFormData] = useState({
    semester: 'Spring 2025',
    duration: 'Full Semester',
    paymentType: 'Upfront'
  });

  // Room types for filter
  const roomTypes = ['All', 'Single', 'Shared', 'Deluxe', 'Suite', 'Standard'];
  const floorOptions = ['All', '1', '2', '3', '4'];
  const genderOptions = ['All', 'Male', 'Female', 'Mixed'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsData, allocationsData, studentsData] = await Promise.all([
        hostelApi.getHostelRooms(),
        hostelApi.getHostelAllocations(),
        hostelApi.getStudents()
      ]);

      setRooms(roomsData);
      setAllocations(allocationsData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Failed to load hostel data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate enhanced stats
  const stats = useMemo(() => {
    const totalCapacity = rooms.reduce((acc, room) => acc + room.capacity, 0);
    const totalOccupied = rooms.reduce((acc, room) => acc + room.occupied, 0);
    const occupancyRate = Math.round((totalOccupied / totalCapacity) * 100);
    const availableBeds = totalCapacity - totalOccupied;
    const totalRevenue = rooms.reduce((acc, room) => acc + (room.fee * room.occupied), 0);
    const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance').length;

    // Gender distribution
    const maleRooms = rooms.filter(r => r.gender === 'Male').length;
    const femaleRooms = rooms.filter(r => r.gender === 'Female').length;
    const mixedRooms = rooms.filter(r => r.gender === 'Mixed').length;

    return {
      totalCapacity,
      totalOccupied,
      occupancyRate,
      availableBeds,
      totalRevenue: Math.round(totalRevenue / 1000) + 'k',
      maintenanceRooms,
      maleRooms,
      femaleRooms,
      mixedRooms,
      avgFee: Math.round(rooms.reduce((acc, r) => acc + r.fee, 0) / rooms.length)
    };
  }, [rooms]);

  // Enhanced filtering and sorting
  const filteredAndSortedRooms = useMemo(() => {
    let filtered = rooms.filter(room => {
      const matchesSearch =
        room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (room.allocatedTo?.some((student: any) =>
          typeof student === 'object' && student.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )) ||
        room.amenities?.some((amenity: string) =>
          amenity.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesType = filterType === 'All' || room.type === filterType;
      const matchesFloor = filterFloor === 'All' || room.floor.toString() === filterFloor;
      const matchesGender = filterGender === 'All' || room.gender === filterGender;

      return matchesSearch && matchesType && matchesFloor && matchesGender;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'fee':
          return b.fee - a.fee;
        case 'capacity':
          return b.capacity - a.capacity;
        case 'floor':
          return a.floor - b.floor;
        default:
          return a.number.localeCompare(b.number);
      }
    });

    return filtered;
  }, [rooms, searchTerm, filterType, filterFloor, filterGender, sortBy]);

  const handleAssignRoom = () => {
    setShowAllocationModal(true);
  };

  const handleRoomClick = (room: any) => {
    setSelectedRoom(room);
    setShowRoomDetailsModal(true);
  };

  const handleAllocateRoom = async () => {
    if (!selectedRoom || !selectedStudent) return;

    try {
      await hostelApi.allocateRoom({
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        roomId: selectedRoom.id,
        roomNumber: selectedRoom.number,
        semester: formData.semester
      });

      setShowAllocationModal(false);
      setSelectedRoom(null);
      setSelectedStudent(null);
      setFormData({
        semester: 'Spring 2025',
        duration: 'Full Semester',
        paymentType: 'Upfront'
      });
      loadData();

      // Show success notification
      alert(`Room ${selectedRoom.number} allocated to ${selectedStudent.name} successfully!`);
    } catch (error) {
      console.error('Failed to allocate room:', error);
      alert(error instanceof Error ? error.message : 'Failed to allocate room');
    }
  };

  const handleFilterReset = () => {
    setFilterType('All');
    setFilterFloor('All');
    setFilterGender('All');
    setSearchTerm('');
    setSortBy('number');
  };

  const getAvailableStudents = () => {
    return students.filter(student =>
      !allocations.some(allocation => allocation.studentId === student.id)
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-400">Loading hostel data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-rose-800 dark:text-blue-300 uppercase tracking-tight">Hostel Operations</h1>
          <p className="text-[11px] font-black text-rose-700/60 dark:text-blue-800 uppercase tracking-widest mt-1 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" />
            University Campus • Block A & B
            <span className="ml-4 flex items-center gap-1.5 bg-rose-500/10 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-rose-500/20 dark:border-blue-500/20">
              <Shield className="w-3 h-3 text-rose-600 dark:text-blue-400" />
              <span className="text-rose-600 dark:text-blue-400">Secure Environment</span>
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-rose-50 dark:bg-white/5 border border-rose-200 dark:border-white/10 text-rose-700 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-rose-100 dark:hover:bg-white/10 flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print Log
          </button>
          <button className="px-4 py-2 bg-rose-50 dark:bg-white/5 border border-rose-200 dark:border-white/10 text-rose-700 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-rose-100 dark:hover:bg-white/10 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Sync Data
          </button>
          {user?.role === 'Admin' && (
            <button
              onClick={handleAssignRoom}
              className="px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 dark:from-blue-600 dark:to-blue-700 hover:from-rose-500 hover:to-pink-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-200/50 dark:shadow-blue-900/40 transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Initiate Allocation
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white/40 dark:bg-slate-900/40 rounded-3xl p-6 border border-rose-100/50 dark:border-blue-500/10 shadow-xl shadow-rose-200/5 relative overflow-hidden group hover:border-rose-300 dark:hover:border-blue-500/30 transition-all backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-[10px] font-black text-rose-700/60 dark:text-blue-500/60 uppercase tracking-widest mb-3">Occupancy Index</p>
              <h3 className="text-3xl font-black text-rose-950 dark:text-blue-300 mb-1 uppercase tracking-tight">{stats.occupancyRate}%</h3>
              <p className="text-[10px] text-rose-700/40 dark:text-blue-800 font-black uppercase tracking-widest">{stats.totalOccupied} / {stats.totalCapacity} ACTIVE UNITS</p>
            </div>
            <div className="p-3.5 bg-rose-500/10 dark:bg-blue-500/10 rounded-2xl border border-rose-500/10 dark:border-blue-500/20 group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6 text-rose-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-5 w-full h-1.5 bg-rose-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-pink-600 dark:from-blue-600 dark:to-blue-700 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(225,29,72,0.3)]"
              style={{ width: `${stats.occupancyRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white/40 dark:bg-slate-900/40 rounded-3xl p-6 border border-rose-100/50 dark:border-emerald-500/10 shadow-xl shadow-rose-200/5 relative overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-[10px] font-black text-emerald-700/60 dark:text-emerald-500/60 uppercase tracking-widest mb-3">Available Spectrum</p>
              <h3 className="text-3xl font-black text-rose-950 dark:text-emerald-300 mb-1 uppercase tracking-tight">{stats.availableBeds}</h3>
              <p className="text-[10px] text-emerald-700/40 dark:text-emerald-800 font-black uppercase tracking-widest">READY FOR DEPLOYMENT</p>
            </div>
            <div className="p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/10 group-hover:scale-110 transition-transform">
              <Bed className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-2">Total Rooms</p>
              <h3 className="text-3xl font-bold text-white mb-1">{rooms.length}</h3>
              <p className="text-xs text-slate-500">Across 4 Floors</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg group-hover:scale-110 transition-transform">
              <Home className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-2">Revenue (Est)</p>
              <h3 className="text-3xl font-bold text-white mb-1">${stats.totalRevenue}</h3>
              <p className="text-xs text-slate-500">Per Semester</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-lg group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-rose-500/30 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-2">Maintenance</p>
              <h3 className="text-3xl font-bold text-white mb-1">{stats.maintenanceRooms}</h3>
              <p className="text-xs text-slate-500">Under repair</p>
            </div>
            <div className="p-3 bg-rose-500/10 rounded-lg group-hover:scale-110 transition-transform">
              <AlertCircle className="w-6 h-6 text-rose-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column - Room Management */}
        <div className="lg:col-span-2 space-y-6">

          {/* Enhanced Filters and Controls */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filters {showFilters ? '▲' : '▼'}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveView('grid')}
                    className={`p-2 rounded-lg ${activeView === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                  >
                    <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-full h-full bg-current rounded-sm" />
                      ))}
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveView('list')}
                    className={`p-2 rounded-lg ${activeView === 'list' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                  >
                    <div className="w-4 h-4 flex flex-col gap-0.5">
                      <div className="w-full h-1 bg-current rounded-sm" />
                      <div className="w-full h-1 bg-current rounded-sm" />
                      <div className="w-full h-1 bg-current rounded-sm" />
                    </div>
                  </button>
                </div>
              </div>

              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400/60 dark:text-blue-700" />
                <input
                  type="text"
                  placeholder="Search rooms, students, or amenities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/60 dark:bg-slate-950/50 border border-rose-200 dark:border-blue-500/10 rounded-xl text-rose-950 dark:text-blue-300 placeholder-rose-300 dark:placeholder-blue-900 focus:outline-none focus:ring-4 focus:ring-rose-200 dark:focus:ring-blue-500/20 focus:border-rose-300 dark:focus:border-blue-500 transition-all font-black uppercase text-[10px] tracking-widest shadow-inner shadow-rose-200/10"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white/10 border border-white/20 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="number">Sort by Room Number</option>
                <option value="fee">Sort by Fee (High to Low)</option>
                <option value="capacity">Sort by Capacity</option>
                <option value="floor">Sort by Floor</option>
              </select>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t border-white/10 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-slate-300 font-medium">Advanced Filters</span>
                  <button
                    onClick={handleFilterReset}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear all
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Room Type</label>
                    <div className="flex flex-wrap gap-2">
                      {roomTypes.map(type => (
                        <button
                          key={type}
                          onClick={() => setFilterType(type)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filterType === type
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                            }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Floor</label>
                    <div className="flex flex-wrap gap-2">
                      {floorOptions.map(floor => (
                        <button
                          key={floor}
                          onClick={() => setFilterFloor(floor)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filterFloor === floor
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                            }`}
                        >
                          {floor === 'All' ? 'All Floors' : `Floor ${floor}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-2">Gender</label>
                    <div className="flex flex-wrap gap-2">
                      {genderOptions.map(gender => (
                        <button
                          key={gender}
                          onClick={() => setFilterGender(gender)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filterGender === gender
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                            }`}
                        >
                          {gender}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-slate-400 px-2">
            <span>Showing {filteredAndSortedRooms.length} of {rooms.length} rooms</span>
            {stats.availableBeds > 0 && (
              <span className="text-emerald-400 font-medium">
                {stats.availableBeds} beds available for allocation
              </span>
            )}
          </div>

          {/* Room Grid/List */}
          {activeView === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredAndSortedRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onClick={() => handleRoomClick(room)}
                  onAllocate={user?.role === 'Admin' ? () => {
                    setSelectedRoom(room);
                    setShowAllocationModal(true);
                  } : undefined}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedRooms.map((room) => (
                <RoomListItem
                  key={room.id}
                  room={room}
                  onClick={() => handleRoomClick(room)}
                />
              ))}
            </div>
          )}

          {filteredAndSortedRooms.length === 0 && (
            <div className="text-center py-16 glass-panel rounded-2xl">
              <Bed className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No rooms found</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Try adjusting your filters or search criteria to find available rooms
              </p>
              <button
                onClick={handleFilterReset}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Quick Actions & Info */}
        <div className="space-y-6">
          {/* Enhanced My Room Card */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">My Room</span>
                  <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                    ✓ Paid
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mt-1">304-B</h3>
                <p className="text-xs text-slate-400">Block A • Floor 3 • Deluxe</p>
              </div>
              <div className="p-3 bg-indigo-500/10 rounded-lg group-hover:rotate-12 transition-transform">
                <BedDouble className="w-6 h-6 text-indigo-400" />
              </div>
            </div>

            {/* Room Info */}
            <div className="space-y-4 mb-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>Until Jun 2025</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <DollarSign className="w-4 h-4" />
                  <span>$1,200/sem</span>
                </div>
              </div>

              <div className="p-3 bg-rose-500/5 dark:bg-blue-500/5 rounded-2xl border border-rose-100 dark:border-blue-500/10">
                <p className="text-[9px] font-black uppercase tracking-widest text-rose-700/40 dark:text-blue-900 mb-2">Roommates</p>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-3">
                    {['Alex', 'Jordan', 'Sam'].map((name) => (
                      <img
                        key={name}
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 hover:scale-110 transition-transform cursor-pointer shadow-sm"
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed= ${name}`}
                        alt={name}
                        title={name}
                      />
                    ))}
                  </div>
                  <button className="w-8 h-8 rounded-full bg-rose-500/10 dark:bg-blue-500/10 hover:bg-rose-500/20 dark:hover:bg-blue-500/20 border border-rose-500/20 dark:border-blue-500/20 flex items-center justify-center text-rose-600 dark:text-blue-400 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 relative z-10">
              <button className="py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition-colors flex items-center justify-center gap-1">
                <Eye className="w-3 h-3" />
                Details
              </button>
              <button className="py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition-colors flex items-center justify-center gap-1">
                <Settings className="w-3 h-3" />
                Services
              </button>
              <button className="py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-xs font-medium text-amber-400 transition-colors flex items-center justify-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Report Issue
              </button>
              <button className="py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-medium text-emerald-400 transition-colors flex items-center justify-center gap-1">
                <Bell className="w-3 h-3" />
                Cleaning
              </button>
            </div>
          </div>

          {/* Enhanced Digital Gate Pass */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-600 to-pink-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center shadow-lg shadow-rose-900/10 dark:shadow-blue-900/40">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-rose-950 dark:text-blue-300 uppercase tracking-tight">Gate Pass</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-700/40 dark:text-blue-900">Secure Exit Pass</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Current Pass</span>
                    <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Weekend Pass</p>
                      <p className="text-xs text-slate-400">Expires in 12 hours</p>
                    </div>
                    <button className="text-xs text-indigo-400 hover:text-indigo-300">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-3 bg-gradient-to-r from-rose-600 to-pink-600 dark:from-blue-600 dark:to-blue-700 hover:from-rose-500 hover:to-pink-500 text-white text-[10px] font-black rounded-xl transition-all shadow-lg shadow-rose-900/10 dark:shadow-blue-900/40 uppercase tracking-widest">
                    Generate New
                  </button>
                  <button className="px-4 py-3 bg-rose-500/10 dark:bg-blue-500/10 hover:bg-rose-500/20 dark:hover:bg-blue-500/20 border border-rose-500/20 dark:border-blue-500/20 text-rose-600 dark:text-blue-400 rounded-xl transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Mess Menu */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-amber-400" />
                  Today's Mess Menu
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Last updated: 2 hours ago
                </p>
              </div>
              <span className="text-[10px] font-medium bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                <Coffee className="w-3 h-3" />
                Open Now
              </span>
            </div>

            {/* Meal Schedule */}
            <div className="space-y-3">
              <MealCard
                meal="Breakfast"
                time="07:00 - 09:00"
                items={['Pancakes with Maple Syrup', 'Scrambled Eggs', 'Fresh Fruits', 'Coffee & Tea']}
                current={false}
              />
              <MealCard
                meal="Lunch"
                time="12:00 - 14:00"
                items={['Grilled Chicken', 'Basmati Rice', 'Mixed Vegetables', 'Salad Bar', 'Fresh Juice']}
                current={true}
              />
              <MealCard
                meal="Dinner"
                time="19:00 - 21:00"
                items={['Pasta Alfredo', 'Garlic Bread', 'Minestrone Soup', 'Dessert']}
                current={false}
              />
            </div>

            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-slate-400">Calories</p>
                <p className="text-lg font-bold text-white mt-1">2.1k</p>
                <p className="text-xs text-slate-500">per day</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400">Rating</p>
                <p className="text-lg font-bold text-white mt-1">4.8</p>
                <p className="text-xs text-slate-500">this week</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400">Meals</p>
                <p className="text-lg font-bold text-white mt-1">3</p>
                <p className="text-xs text-slate-500">today</p>
              </div>
            </div>

            <button className="w-full mt-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <Eye className="w-4 h-4" />
              View Full Menu
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Allocation Modal */}
      {showAllocationModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="glass-panel rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">Assign Room</h2>
                <p className="text-slate-400 mt-1">Allocate a room to a student</p>
              </div>
              <button
                onClick={() => setShowAllocationModal(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column - Room Selection */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                    <BedDouble className="w-4 h-4" />
                    Select Room
                  </h3>
                  <div className="space-y-3">
                    {rooms.filter(r => r.status === 'Available').slice(0, 5).map(room => (
                      <button
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        className={`w-full p-4 rounded-lg border transition-all text-left ${selectedRoom?.id === room.id
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                          }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-white">Room {room.number}</h4>
                            <p className="text-xs text-slate-400 mt-1">{room.type} • Floor {room.floor}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-white">${room.fee}</div>
                            <div className="text-xs text-slate-400">/sem</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-slate-400">Capacity:</span>
                          <span className="text-xs text-white">{room.capacity} beds</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-lg text-sm font-medium transition-colors">
                    View All Available Rooms
                  </button>
                </div>

                {/* Selected Room Info */}
                {selectedRoom && (
                  <div className="p-6 bg-rose-50/50 dark:bg-indigo-950/30 rounded-[1.5rem] border border-rose-200 dark:border-white/5 shadow-inner">
                    <h4 className="text-[10px] font-black text-rose-700/60 dark:text-slate-500 mb-3 uppercase tracking-widest">Target Unit</h4>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-black text-rose-950 dark:text-white uppercase tracking-tight">Room {selectedRoom.number}</p>
                        <p className="text-[10px] font-black text-rose-400 dark:text-slate-500 uppercase tracking-widest">{selectedRoom.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-rose-600 dark:text-indigo-400">${selectedRoom.fee}</p>
                        <p className="text-[9px] font-black text-rose-400 dark:text-slate-600 uppercase tracking-widest">per cycle</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Student Selection & Form */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-black text-rose-700/60 dark:text-slate-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
                    <Users className="w-3.5 h-3.5" />
                    Resident Selection
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 dark:text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search residents..."
                      className="w-full pl-12 pr-6 py-3.5 bg-rose-50/50 dark:bg-slate-950/50 border border-rose-200 dark:border-white/10 text-rose-950 dark:text-slate-200 placeholder:text-rose-300 dark:placeholder:text-slate-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-200 dark:focus:ring-indigo-500/20 transition-all text-xs font-bold"
                    />
                  </div>

                  <div className="mt-5 space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {getAvailableStudents().slice(0, 5).map(student => (
                      <button
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className={`w-full p-4 rounded-2xl border transition-all text-left group shadow-sm ${selectedStudent?.id === student.id
                          ? 'border-rose-500 bg-rose-500/10 dark:border-indigo-500 dark:bg-indigo-500/10'
                          : 'border-rose-100 bg-white/60 dark:border-white/5 dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-white/10'
                          }`}
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className={`w-10 h-10 rounded-2xl border-2 object-cover transition-all ${selectedStudent?.id === student.id ? 'border-rose-500 dark:border-indigo-500' : 'border-rose-100 dark:border-white/10 group-hover:border-rose-300'}`}
                          />
                          <div className="flex-1">
                            <h4 className="font-black text-rose-950 dark:text-white text-xs uppercase tracking-tight">{student.name}</h4>
                            <p className="text-[9px] font-black text-rose-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">{student.rollNo} • {student.program}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Allocation Form */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-rose-700/60 dark:text-slate-500 mb-2 uppercase tracking-widest">
                      Academic Term
                    </label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full px-4 py-3 bg-rose-50/50 dark:bg-slate-950/50 border border-rose-200 dark:border-white/10 text-rose-950 dark:text-slate-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-200 dark:focus:ring-indigo-500/20 text-xs font-bold"
                    >
                      <option value="Spring 2025">Spring 2025</option>
                      <option value="Fall 2024">Fall 2024</option>
                      <option value="Summer 2024">Summer 2024</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-rose-700/60 dark:text-slate-500 mb-3 uppercase tracking-widest">
                      Tenure Mode
                    </label>
                    <div className="flex gap-2 p-1 bg-rose-50/50 dark:bg-slate-950/50 border border-rose-100 dark:border-white/10 rounded-2xl">
                      {['Full Semester', 'Half Semester', 'Monthly'].map(option => (
                        <button
                          key={option}
                          onClick={() => setFormData({ ...formData, duration: option })}
                          className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${formData.duration === option
                            ? 'bg-white dark:bg-indigo-600 text-rose-700 dark:text-white shadow-sm'
                            : 'text-rose-400 dark:text-slate-500 hover:text-rose-600'
                            }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-rose-700/60 dark:text-slate-500 mb-3 uppercase tracking-widest">
                      Financial Arrangement
                    </label>
                    <div className="flex gap-2 p-1 bg-rose-50/50 dark:bg-slate-950/50 border border-rose-100 dark:border-white/10 rounded-2xl">
                      {['Upfront', 'Installments', 'Aid'].map(option => (
                        <button
                          key={option}
                          onClick={() => setFormData({ ...formData, paymentType: option })}
                          className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${formData.paymentType === option
                            ? 'bg-white dark:bg-indigo-600 text-rose-700 dark:text-white shadow-sm'
                            : 'text-rose-400 dark:text-slate-500 hover:text-rose-600'
                            }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <button
                    onClick={() => setShowAllocationModal(false)}
                    className="flex-1 px-6 py-4 bg-rose-50 dark:bg-white/5 border border-rose-200 dark:border-white/10 text-rose-700 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all hover:bg-rose-100 dark:hover:bg-white/10 shadow-sm"
                  >
                    Abort
                  </button>
                  <button
                    onClick={handleAllocateRoom}
                    disabled={!selectedRoom || !selectedStudent}
                    className="flex-3 px-10 py-4 bg-gradient-to-r from-rose-600 to-pink-600 dark:from-indigo-600 dark:to-violet-700 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all hover:from-rose-500 hover:to-pink-500 dark:hover:from-indigo-500 dark:hover:to-violet-600 shadow-lg shadow-rose-200/50 dark:shadow-indigo-900/40 disabled:opacity-50 disabled:grayscale transform active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    Finalize Allocation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Details Modal */}
      {showRoomDetailsModal && selectedRoom && (
        <RoomDetailsModal
          room={selectedRoom}
          onClose={() => setShowRoomDetailsModal(false)}
          allocations={allocations}
        />
      )}
    </div>
  );
};

// Enhanced Room Card Component
const RoomCard: React.FC<{ room: any; onClick: () => void; onAllocate?: () => void; key?: string }> = ({ room, onClick, onAllocate }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Full': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'Maintenance': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'Male': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Female': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      case 'Mixed': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white/40 dark:bg-slate-900/40 rounded-[2.5rem] p-8 border border-rose-100 dark:border-white/5 backdrop-blur-md shadow-lg shadow-rose-200/5 hover:border-rose-400 dark:hover:border-indigo-500 hover:shadow-2xl hover:shadow-rose-200/20 transition-all cursor-pointer group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-3xl rounded-full -mr-12 -mt-12"></div>
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-xl font-black text-rose-950 dark:text-white group-hover:text-rose-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
              Unit {room.number}
            </h3>
            <span className={`text-[9px] px-3 py-1 rounded-full uppercase font-black tracking-[0.1em] border shadow-sm ${getStatusColor(room.status)}`}>
              {room.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
             <p className="text-[10px] font-black text-rose-700/60 dark:text-slate-500 uppercase tracking-widest">
              {room.type} • Level {room.floor}
            </p>
            <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border transition-colors ${getGenderColor(room.gender)}`}>
              {room.gender}
            </span>
          </div>
        </div>
        <button className="text-rose-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-white transition-colors p-2 bg-rose-50/50 dark:bg-white/5 rounded-2xl border border-rose-100 dark:border-white/5">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Capacity Visual */}
      <div className="space-y-4 mb-8 bg-rose-50/30 dark:bg-slate-950/20 p-5 rounded-[1.5rem] border border-rose-100 dark:border-white/5 relative z-10">
        <div className="flex justify-between items-center px-1">
          <span className="text-[9px] text-rose-700/60 dark:text-slate-500 font-black uppercase tracking-widest">Occupancy Vector</span>
          <span className="text-[10px] text-rose-950 dark:text-slate-300 font-black uppercase tracking-tight">
            {room.occupied} / {room.capacity} UNITS ACTIVE
          </span>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: room.capacity }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all duration-700 shadow-sm ${i < room.occupied
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 dark:from-indigo-600 dark:to-violet-700 shadow-rose-200/50'
                : room.status === 'Maintenance'
                  ? 'bg-amber-500/30 border border-amber-500/20'
                  : 'bg-rose-100 dark:bg-slate-800'
                }`}
            />
          ))}
        </div>
      </div>

      {/* Amenities */}
      {room.amenities && room.amenities.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 relative z-10">
          {room.amenities.slice(0, 3).map((amenity: string, index: number) => (
            <span key={index} className="text-[8px] px-3 py-1.5 bg-white/60 dark:bg-white/5 rounded-full border border-rose-100 dark:border-white/10 text-rose-700/60 dark:text-slate-400 font-black uppercase tracking-widest shadow-sm">
              {amenity}
            </span>
          ))}
          {room.amenities.length > 3 && (
            <span className="text-[10px] text-rose-400 font-black flex items-center px-2">+{room.amenities.length - 3}</span>
          )}
        </div>
      )}

      {/* Allocated Students */}
      {room.allocatedTo && Array.isArray(room.allocatedTo) && room.allocatedTo.length > 0 && (
        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
          <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
            <Users className="w-3 h-3" />
            Occupants:
          </p>
          <div className="flex flex-wrap gap-2">
            {room.allocatedTo.slice(0, 3).map((student: any, index: number) => (
              <div key={student.id || index} className="flex items-center gap-1 text-xs bg-white/10 px-2 py-1 rounded border border-white/20">
                <UserIcon className="w-3 h-3 text-indigo-400" />
                <span className="text-slate-300">
                  {typeof student === 'object' ? student.name : `Student ${index + 1}`}
                </span>
              </div>
            ))}
            {room.allocatedTo.length > 3 && (
              <span className="text-xs text-slate-400">+{room.allocatedTo.length - 3} more</span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-sm font-semibold text-white">${room.fee}</span>
          <span className="text-xs text-slate-500">/sem</span>
        </div>
        <div className="flex items-center gap-2">
          {room.status === 'Available' && onAllocate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAllocate();
              }}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg border border-indigo-500/20"
            >
              <Key className="w-3 h-3" />
              Allocate
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg"
          >
            <Eye className="w-3 h-3" />
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

// Room List Item for list view
const RoomListItem: React.FC<{ room: any; onClick: () => void; key?: string }> = ({ room, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white/40 dark:bg-slate-900/40 rounded-[2rem] p-5 border border-rose-100 dark:border-white/10 backdrop-blur-md shadow-lg shadow-rose-200/5 hover:border-rose-400 dark:hover:border-indigo-500 hover:shadow-xl hover:shadow-rose-200/10 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-rose-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:to-violet-500/20 flex items-center justify-center border border-rose-100 dark:border-white/5 shadow-inner">
            <Bed className="w-7 h-7 text-rose-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-rose-950 dark:text-white uppercase tracking-tight">Unit {room.number}</h3>
            <p className="text-[10px] font-black text-rose-700/60 dark:text-slate-500 uppercase tracking-widest mt-1">{room.type} • Level {room.floor}</p>
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div className="text-center hidden md:block">
            <p className="text-[8px] font-black text-rose-400 dark:text-slate-500 uppercase tracking-widest mb-1">Density</p>
            <p className="text-sm font-black text-rose-950 dark:text-white uppercase">{room.occupied} / {room.capacity}</p>
          </div>

          <div className="text-center hidden md:block">
            <p className="text-[8px] font-black text-rose-400 dark:text-slate-500 uppercase tracking-widest mb-1">Levy</p>
            <p className="text-sm font-black text-rose-950 dark:text-white uppercase">${room.fee}</p>
          </div>

          <div className="text-center">
            <p className="text-[8px] font-black text-rose-400 dark:text-slate-500 uppercase tracking-widest mb-1">Status</p>
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${
              room.status === 'Available' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-sm shadow-emerald-200/20' :
              room.status === 'Full' ? 'bg-rose-100 text-rose-400 border-rose-200' :
                'bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-sm shadow-amber-200/20'
              }`}>
              {room.status}
            </span>
          </div>

          <div className="p-3 bg-rose-50/50 dark:bg-white/5 rounded-2xl group-hover:translate-x-1 transition-transform border border-rose-100 dark:border-white/5">
            <ChevronRight className="w-4 h-4 text-rose-300 dark:text-slate-600 group-hover:text-rose-600 dark:group-hover:text-indigo-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Meal Card Component
const MealCard: React.FC<{
  meal: string;
  time: string;
  items: string[];
  current: boolean
}> = ({ meal, time, items, current }) => {
  const getMealIcon = (meal: string) => {
    switch (meal.toLowerCase()) {
      case 'breakfast': return <Coffee className="w-4 h-4" />;
      case 'lunch': return <Utensils className="w-4 h-4" />;
      case 'dinner': return <Pizza className="w-4 h-4" />;
      default: return <Apple className="w-4 h-4" />;
    }
  };

  return (
    <div className={`group relative rounded-[1.5rem] p-5 cursor-pointer transition-all border backdrop-blur-sm ${current
      ? 'bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-200/20'
      : 'bg-white/40 dark:bg-white/5 border-rose-100 dark:border-white/10 hover:bg-white/60 shadow-sm'
      }`}>
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl border transition-all ${current
            ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/20 scale-110 shadow-lg shadow-emerald-200/50'
            : 'bg-rose-500/10 dark:bg-white/10 text-rose-600 dark:text-slate-400 border-rose-500/10 dark:border-white/5'
            }`}>
            {getMealIcon(meal)}
          </div>
          <div>
            <h4 className={`text-sm font-black uppercase tracking-tight ${current ? 'text-emerald-950 dark:text-white' : 'text-rose-950 dark:text-slate-300'
              }`}>
              {meal}
            </h4>
            <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${current ? 'text-emerald-600' : 'text-rose-400/60 dark:text-slate-500'
              }`}>
              {time}
            </p>
          </div>
        </div>
        {current && (
          <div className="flex flex-col items-end">
             <span className="text-[8px] font-black bg-emerald-500 text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-200/50">
              LIVE
            </span>
          </div>
        )}
      </div>

      <ul className="space-y-2.5 bg-white/30 dark:bg-black/20 p-4 rounded-2xl border border-white dark:border-white/5 shadow-inner">
        {items.map((item, index) => (
          <li key={index} className="text-[10px] font-black text-rose-900/70 dark:text-slate-400 flex items-start gap-3 uppercase tracking-tight leading-none">
            <div className={`w-1.5 h-1.5 rounded-full mt-0.5 shadow-sm ${current ? 'bg-emerald-500' : 'bg-rose-300 dark:bg-slate-600'
              }`} />
            {item}
          </li>
        ))}
      </ul>

      {!current && (
        <div className="absolute inset-0 rounded-[1.5rem] border-2 border-rose-200/0 group-hover:border-rose-200 dark:group-hover:border-indigo-500/30 transition-all pointer-events-none"></div>
      )}
    </div>
  );
};

// Room Details Modal Component
const RoomDetailsModal: React.FC<{
  room: any;
  onClose: () => void;
  allocations: any[]
}> = ({ room, onClose, allocations }) => {
  const roomAllocations = allocations.filter(a => a.roomId === room.id);

  return (
    <div className="fixed inset-0 bg-rose-950/20 dark:bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 z-[9999] animate-fade-in">
      <div className="bg-white/80 dark:bg-slate-950/90 border border-rose-100 dark:border-white/10 rounded-[3rem] max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_100px_rgba(225,29,72,0.1)] relative overflow-hidden backdrop-blur-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/5 blur-[120px] rounded-full -mr-[250px] -mt-[250px] pointer-events-none"></div>
        <div className="p-10 relative z-10">
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 rounded-2xl bg-rose-600 dark:bg-indigo-600 flex items-center justify-center shadow-lg shadow-rose-200 dark:shadow-indigo-900/50">
                  <BedDouble className="w-8 h-8 text-white" />
                </div>
                <div>
                   <h2 className="text-4xl font-black text-rose-950 dark:text-white uppercase tracking-tight">Core Unit {room.number}</h2>
                   <p className="text-[11px] font-black text-rose-700/60 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">{room.type} • Level {room.floor} • Sector {room.block || 'Alpha'}</p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 text-rose-400 hover:text-rose-700 dark:text-slate-500 dark:hover:text-white transition-all rounded-2xl bg-rose-50 dark:bg-white/5 border border-rose-100 dark:border-white/10 hover:rotate-90"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column - Room Info */}
            <div className="lg:col-span-8 space-y-10">
              {/* Status & Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/60 dark:bg-white/5 border border-rose-100 dark:border-white/5 rounded-3xl p-6 shadow-sm">
                  <p className="text-[8px] font-black text-rose-400 dark:text-slate-500 uppercase tracking-widest mb-2">Availability</p>
                  <p className={`text-sm font-black uppercase tracking-tight ${room.status === 'Available' ? 'text-emerald-600' :
                    room.status === 'Full' ? 'text-rose-400' : 'text-amber-600'
                    }`}>
                    {room.status}
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-white/5 border border-rose-100 dark:border-white/5 rounded-3xl p-6 shadow-sm">
                  <p className="text-[8px] font-black text-rose-400 dark:text-slate-500 uppercase tracking-widest mb-2">Total Capacity</p>
                  <p className="text-sm font-black text-rose-950 dark:text-white uppercase tracking-tight">{room.capacity} Units</p>
                </div>
                <div className="bg-white/60 dark:bg-white/5 border border-rose-100 dark:border-white/5 rounded-3xl p-6 shadow-sm">
                  <p className="text-[8px] font-black text-rose-400 dark:text-slate-500 uppercase tracking-widest mb-2">Current Load</p>
                  <p className="text-sm font-black text-rose-950 dark:text-white uppercase tracking-tight">{room.occupied} Active</p>
                </div>
                <div className="bg-white/60 dark:bg-white/5 border border-rose-100 dark:border-white/5 rounded-3xl p-6 shadow-sm">
                  <p className="text-[8px] font-black text-rose-400 dark:text-slate-500 uppercase tracking-widest mb-2">Cycle Levy</p>
                  <p className="text-sm font-black text-rose-950 dark:text-white uppercase tracking-tight">${room.fee}</p>
                </div>
              </div>

              {/* Amenities */}
              {room.amenities && room.amenities.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black text-rose-700/60 dark:text-slate-400 mb-5 flex items-center gap-3 uppercase tracking-widest">
                    <Zap className="w-4 h-4" />
                    Infrastructure Specs
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {room.amenities.map((amenity: string, index: number) => (
                      <span
                        key={index}
                        className="px-5 py-3 bg-white/60 dark:bg-white/5 border border-rose-100 dark:border-white/10 text-rose-900/80 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm"
                      >
                        {amenity === 'AC' && <Snowflake className="w-3.5 h-3.5" />}
                        {amenity === 'WiFi' && <Wifi className="w-3.5 h-3.5" />}
                        {amenity === 'TV' && <Tv className="w-3.5 h-3.5" />}
                        {amenity === 'Attached Bath' && <Bath className="w-3.5 h-3.5" />}
                        {!['AC', 'WiFi', 'TV', 'Attached Bath'].includes(amenity) && <CheckCircle className="w-3.5 h-3.5" />}
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Occupants */}
              {roomAllocations.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black text-rose-700/60 dark:text-slate-400 mb-5 flex items-center gap-3 uppercase tracking-widest">
                    <Users className="w-4 h-4" />
                    Active Manifest
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roomAllocations.map((allocation) => (
                      <div key={allocation.id} className="p-5 bg-white/60 dark:bg-white/5 border border-rose-100 dark:border-white/10 rounded-3xl shadow-sm group hover:border-rose-300 dark:hover:border-indigo-500 transition-all">
                        <div className="flex items-center gap-4">
                          <img
                            src={allocation.studentAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed= ${allocation.studentName}`}
                            alt={allocation.studentName}
                            className="w-14 h-14 rounded-2xl border-2 border-rose-100 dark:border-white/10 object-cover shadow-sm group-hover:scale-105 transition-transform"
                          />
                          <div className="flex-1">
                            <h4 className="font-black text-rose-950 dark:text-white text-sm uppercase tracking-tight">{allocation.studentName}</h4>
                            <p className="text-[9px] font-black text-rose-400 dark:text-slate-500 uppercase tracking-widest mt-1">{allocation.studentId} • {allocation.semester}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] font-black text-rose-300 dark:text-slate-600 uppercase tracking-widest">Deploy Date</p>
                            <p className="text-[10px] font-black text-rose-700 dark:text-white uppercase tracking-tight">{allocation.checkInDate || 'Jan 15, 2024'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Actions & Notes */}
            <div className="lg:col-span-4 space-y-8">
              {/* Room Visual */}
              <div className="aspect-square rounded-[2.5rem] bg-gradient-to-br from-rose-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:to-violet-500/20 flex flex-col items-center justify-center border border-rose-100 dark:border-white/5 shadow-inner relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-8">
                   <p className="text-[10px] font-black text-rose-950 dark:text-white uppercase tracking-[0.2em] text-center leading-loose">Visual representation of high-density unit configuration</p>
                </div>
                <BedDouble className="w-24 h-24 text-rose-600 dark:text-indigo-400 drop-shadow-2xl" />
                <div className="mt-6 flex flex-col items-center">
                   <p className="text-[10px] font-black text-rose-400 dark:text-slate-500 uppercase tracking-widest">Digital Twin ID</p>
                   <p className="text-sm font-black text-rose-950 dark:text-white uppercase tracking-[0.1em]">UNIT-{room.number}-X9</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <button className="w-full py-4 bg-rose-600 dark:bg-indigo-600 hover:bg-rose-700 dark:hover:bg-indigo-700 text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-200 dark:shadow-indigo-900/30 transform active:scale-95 flex items-center justify-center gap-3">
                  <Edit className="w-4 h-4" />
                  Edit Configuration
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <button className="py-4 bg-white/60 dark:bg-white/5 border border-rose-100 dark:border-white/10 text-rose-700 dark:text-slate-300 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center gap-2 shadow-sm">
                    <Printer className="w-4 h-4" />
                    Hardcopy
                  </button>
                  <button className="py-4 bg-white/60 dark:bg-white/5 border border-rose-100 dark:border-white/10 text-rose-700 dark:text-slate-300 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center gap-2 shadow-sm">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              {/* Maintenance History */}
              <div className="bg-rose-50/50 dark:bg-black/20 rounded-[2rem] p-8 border border-rose-100 dark:border-white/5">
                <h3 className="text-[10px] font-black text-rose-700/60 dark:text-slate-400 mb-6 uppercase tracking-widest">Service Log</h3>
                <div className="space-y-4">
                  {[
                    { label: 'HVAC RECTIFICATION', time: '14D AGO' },
                    { label: 'HYDRAULIC AUDIT', time: '30D AGO' },
                    { label: 'PIGMENT REFRESH', time: '90D AGO' }
                  ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-help">
                      <span className="text-[10px] font-black text-rose-950 dark:text-slate-300 uppercase tracking-tight group-hover:text-rose-600 dark:group-hover:text-indigo-400 transition-colors">{log.label}</span>
                      <span className="text-[9px] font-black text-rose-300 dark:text-slate-600 uppercase tracking-widest">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

