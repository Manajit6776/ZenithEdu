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
import { useTheme } from '../src/contexts/ThemeContext';

export const Hostel: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isDark } = useTheme();
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
        <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Loading hostel data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Hostel Management</h1>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} mt-2 flex items-center gap-2`}>
            <MapPin className="w-4 h-4" />
            University Campus • Block A & B
            <span className="ml-4 flex items-center gap-1 text-xs">
              <Shield className={`w-3 h-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
              <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>24/7 Security</span>
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className={`px-4 py-2 ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'} border rounded-lg text-sm font-medium transition-colors flex items-center gap-2`}>
            <Printer className="w-4 h-4" />
            Report
          </button>
          <button className={`px-4 py-2 ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'} border rounded-lg text-sm font-medium transition-colors flex items-center gap-2`}>
            <Download className="w-4 h-4" />
            Export
          </button>
          {user?.role === 'Admin' && (
            <button
              onClick={handleAssignRoom}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-indigo-900/20 hover:shadow-xl hover:shadow-indigo-900/30 transform hover:scale-105 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Assign Room
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-sm font-medium mb-2`}>Occupancy</p>
              <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-1`}>{stats.occupancyRate}%</h3>
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{stats.totalOccupied} / {stats.totalCapacity} Beds</p>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-lg group-hover:scale-110 transition-transform">
              <Briefcase className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
            </div>
          </div>
          <div className={`mt-4 w-full h-1 ${isDark ? 'bg-slate-800' : 'bg-slate-200'} rounded-full overflow-hidden`}>
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
              style={{ width: `${stats.occupancyRate}%` }}
            />
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-sm font-medium mb-2`}>Available Beds</p>
              <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-1`}>{stats.availableBeds}</h3>
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Ready for allocation</p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform">
              <Bed className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-sm font-medium mb-2`}>Total Rooms</p>
              <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-1`}>{rooms.length}</h3>
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Across 4 Floors</p>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg group-hover:scale-110 transition-transform">
              <Home className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-sm font-medium mb-2`}>Revenue (Est)</p>
              <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-1`}>${stats.totalRevenue}</h3>
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Per Semester</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-lg group-hover:scale-110 transition-transform">
              <DollarSign className={`w-6 h-6 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-rose-500/30 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-sm font-medium mb-2`}>Maintenance</p>
              <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-1`}>{stats.maintenanceRooms}</h3>
              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Under repair</p>
            </div>
            <div className="p-3 bg-rose-500/10 rounded-lg group-hover:scale-110 transition-transform">
              <AlertCircle className={`w-6 h-6 ${isDark ? 'text-rose-400' : 'text-rose-600'}`} />
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
                  className={`flex items-center gap-2 px-4 py-2 ${isDark ? 'bg-white/10 hover:bg-white/20 border-white/10 text-slate-300' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'} border rounded-lg text-sm font-medium transition-colors`}
                >
                  <Filter className="w-4 h-4" />
                  Filters {showFilters ? '▲' : '▼'}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveView('grid')}
                    className={`p-2 rounded-lg ${activeView === 'grid' ? 'bg-indigo-600 text-white' : isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}
                  >
                    <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="w-full h-full bg-current rounded-sm" />
                      ))}
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveView('list')}
                    className={`p-2 rounded-lg ${activeView === 'list' ? 'bg-indigo-600 text-white' : isDark ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search rooms, students, or amenities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 ${isDark ? 'bg-white/10 border-white/20 text-slate-300 placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'} border rounded-lg focus:outline-none focus:border-indigo-500 transition-colors`}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={`${isDark ? 'bg-white/10 border-white/20 text-slate-300' : 'bg-white border-slate-200 text-slate-700'} border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500`}
              >
                <option value="number">Sort by Room Number</option>
                <option value="fee">Sort by Fee (High to Low)</option>
                <option value="capacity">Sort by Capacity</option>
                <option value="floor">Sort by Floor</option>
              </select>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className={`border-t ${isDark ? 'border-white/10' : 'border-slate-200'} pt-6`}>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'} font-medium`}>Advanced Filters</span>
                  <button
                    onClick={handleFilterReset}
                    className={`text-xs ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'} flex items-center gap-1`}
                  >
                    <X className="w-3 h-3" />
                    Clear all
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-2`}>Room Type</label>
                    <div className="flex flex-wrap gap-2">
                      {roomTypes.map(type => (
                        <button
                          key={type}
                          onClick={() => setFilterType(type)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filterType === type
                            ? 'bg-indigo-600 text-white'
                            : isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-2`}>Floor</label>
                    <div className="flex flex-wrap gap-2">
                      {floorOptions.map(floor => (
                        <button
                          key={floor}
                          onClick={() => setFilterFloor(floor)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filterFloor === floor
                            ? 'bg-emerald-600 text-white'
                            : isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                          {floor === 'All' ? 'All Floors' : `Floor ${floor}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-2`}>Gender</label>
                    <div className="flex flex-wrap gap-2">
                      {genderOptions.map(gender => (
                        <button
                          key={gender}
                          onClick={() => setFilterGender(gender)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filterGender === gender
                            ? 'bg-purple-600 text-white'
                            : isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
          <div className={`flex items-center justify-between text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} px-2`}>
            <span>Showing {filteredAndSortedRooms.length} of {rooms.length} rooms</span>
            {stats.availableBeds > 0 && (
              <span className={`${isDark ? 'text-emerald-400' : 'text-emerald-600'} font-medium`}>
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
              <Bed className={`w-16 h-16 ${isDark ? 'text-slate-600' : 'text-slate-300'} mx-auto mb-4`} />
              <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>No rooms found</h3>
              <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} mb-6 max-w-md mx-auto`}>
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
                  <span className={`text-xs font-medium ${isDark ? 'text-indigo-400' : 'text-indigo-600'} uppercase tracking-wider`}>My Room</span>
                  <span className={`text-xs px-2 py-0.5 ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'} rounded border`}>
                    ✓ Paid
                  </span>
                </div>
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mt-1`}>304-B</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Block A • Floor 3 • Deluxe</p>
              </div>
              <div className={`p-3 ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'} rounded-lg group-hover:rotate-12 transition-transform`}>
                <BedDouble className="w-6 h-6 text-indigo-400" />
              </div>
            </div>

            {/* Room Info */}
            <div className="space-y-4 mb-6 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}">
                  <Calendar className="w-4 h-4" />
                  <span>Until Jun 2025</span>
                </div>
                <div className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <DollarSign className="w-4 h-4" />
                  <span>$1,200/sem</span>
                </div>
              </div>

              <div className={`p-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'} rounded-lg border`}>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-2`}>Roommates</p>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-3">
                    {['Alex', 'Jordan', 'Sam'].map((name) => (
                      <img
                        key={name}
                        className={`w-8 h-8 rounded-full border-2 ${isDark ? 'border-slate-800' : 'border-white'} hover:scale-110 transition-transform cursor-pointer`}
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed= ${name}`}
                        alt={name}
                        title={name}
                      />
                    ))}
                  </div>
                  <button className={`w-8 h-8 rounded-full ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-500 hover:text-slate-900'} border flex items-center justify-center transition-colors`}>
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 relative z-10">
              <button className={`w-full py-3 ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'} border rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}>
                <Printer className="w-4 h-4" />
                Print Details
              </button>
              <button className={`w-full py-3 ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'} border rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}>
                <Settings className="w-4 h-4" />
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-900/30">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Digital Gate Pass</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Secure temporary exit pass</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className={`p-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'} rounded-lg border`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Current Pass</span>
                    <span className={`text-xs px-2 py-0.5 ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'} rounded border`}>
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Weekend Pass</p>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Expires in 12 hours</p>
                    </div>
                    <button className={`text-xs ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'}`}>
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-purple-900/20">
                    Generate New
                  </button>
                  <button className={`px-4 py-3 ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'} border rounded-lg text-sm font-medium transition-colors`}>
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
                <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-2`}>
                  <Utensils className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                  Today's Mess Menu
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
                  <Clock className="w-3 h-3 inline mr-1" />
                  Last updated: 2 hours ago
                </p>
              </div>
              <span className={`text-[10px] font-medium ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'} px-2 py-0.5 rounded border flex items-center gap-1`}>
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
            <div className={`mt-6 pt-6 border-t ${isDark ? 'border-white/10' : 'border-slate-200'} grid grid-cols-3 gap-4`}>
              <div className="text-center">
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Calories</p>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'} mt-1`}>2.1k</p>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>per day</p>
              </div>
              <div className="text-center">
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Rating</p>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'} mt-1`}>4.8</p>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>this week</p>
              </div>
              <div className="text-center">
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Meals</p>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'} mt-1`}>3</p>
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>today</p>
              </div>
            </div>

            <button className={`w-full mt-6 py-2 ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'} border rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2`}>
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
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Assign Room</h2>
                <p className={isDark ? 'text-slate-400 mt-1' : 'text-slate-600 mt-1'}>Allocate a room to a student</p>
              </div>
              <button
                onClick={() => setShowAllocationModal(false)}
                className={`p-2 ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'} transition-colors rounded-lg`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column - Room Selection */}
              <div className="space-y-6">
                <div>
                  <h3 className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-4 flex items-center gap-2`}>
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
                          : isDark ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Room {room.number}</h4>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>{room.type} • Floor {room.floor}</p>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>${room.fee}</div>
                            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>/sem</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Capacity:</span>
                          <span className={`text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>{room.capacity} beds</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button className={`w-full mt-4 py-2 ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'} border rounded-lg text-sm font-medium transition-colors`}>
                    View All Available Rooms
                  </button>
                </div>

                {/* Selected Room Info */}
                {selectedRoom && (
                  <div className={`p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'} rounded-lg border`}>
                    <h4 className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>Selected Room</h4>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className={isDark ? 'text-white' : 'text-slate-900'}>Room {selectedRoom.number}</p>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{selectedRoom.type}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>${selectedRoom.fee}</p>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>per semester</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Student Selection & Form */}
              <div className="space-y-6">
                <div>
                  <h3 className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-4 flex items-center gap-2`}>
                    <Users className="w-4 h-4" />
                    Select Student
                  </h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      className={`w-full pl-10 pr-4 py-2 ${isDark ? 'bg-white/10 border-white/20 text-slate-300 placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'} border rounded-lg focus:outline-none focus:border-indigo-500`}
                    />
                  </div>

                  <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
                    {getAvailableStudents().slice(0, 5).map(student => (
                      <button
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className={`w-full p-3 rounded-lg border transition-all text-left ${selectedStudent?.id === student.id
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : isDark ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-slate-200 bg-white hover:bg-slate-50'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="w-8 h-8 rounded-full border border-white/10"
                          />
                          <div className="flex-1">
                            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'} text-sm`}>{student.name}</h4>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{student.rollNo} • {student.program}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Allocation Form */}
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                      Semester
                    </label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className={`w-full px-3 py-2 ${isDark ? 'bg-white/10 border-white/20 text-slate-300' : 'bg-white border-slate-200 text-slate-700'} border rounded-lg focus:outline-none focus:border-indigo-500`}
                    >
                      <option value="Spring 2025">Spring 2025</option>
                      <option value="Fall 2024">Fall 2024</option>
                      <option value="Summer 2024">Summer 2024</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                      Duration
                    </label>
                    <div className="flex gap-2">
                      {['Full Semester', 'Half Semester', 'Monthly'].map(option => (
                        <button
                          key={option}
                          onClick={() => setFormData({ ...formData, duration: option })}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.duration === option
                            ? 'bg-indigo-600 text-white'
                            : isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-2`}>
                      Payment Type
                    </label>
                    <div className="flex gap-2">
                      {['Upfront', 'Installments', 'Financial Aid'].map(option => (
                        <button
                          key={option}
                          onClick={() => setFormData({ ...formData, paymentType: option })}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${formData.paymentType === option
                            ? 'bg-indigo-600 text-white'
                            : isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAllocationModal(false)}
                    className={`flex-1 px-4 py-3 border ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-700 hover:bg-slate-50'} rounded-lg transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAllocateRoom}
                    disabled={!selectedRoom || !selectedStudent}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    Assign Room
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
  const { isDark } = useTheme();
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
      className="glass-panel rounded-2xl p-6 hover:border-indigo-500/30 hover:shadow-lg transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`text-lg font-bold ${isDark ? 'text-white group-hover:text-indigo-400' : 'text-slate-900 group-hover:text-indigo-600'} transition-colors`}>
              Room {room.number}
            </h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider border ${getStatusColor(room.status)}`}>
              {room.status}
            </span>
          </div>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {room.type} • Floor {room.floor}
            <span className="ml-2 text-xs px-2 py-0.5 rounded border ${getGenderColor(room.gender)}">
              {room.gender}
            </span>
          </p>
        </div>
        <button className={`${isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'} transition-colors p-2 rounded-lg`}>
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Capacity Visual */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} font-medium`}>Occupancy</span>
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {room.occupied}/{room.capacity} beds
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: room.capacity }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${i < room.occupied
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                : room.status === 'Maintenance'
                  ? 'bg-amber-500/30'
                  : isDark ? 'bg-slate-700' : 'bg-slate-200'
                }`}
            />
          ))}
        </div>
      </div>

      {/* Amenities */}
      {room.amenities && room.amenities.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {room.amenities.slice(0, 3).map((amenity: string, index: number) => (
            <span key={index} className={`text-xs px-2 py-1 ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'} rounded border`}>
              {amenity}
            </span>
          ))}
          {room.amenities.length > 3 && (
            <span className="text-xs text-slate-500">+{room.amenities.length - 3}</span>
          )}
        </div>
      )}

      {/* Allocated Students */}
      {room.allocatedTo && Array.isArray(room.allocatedTo) && room.allocatedTo.length > 0 && (
        <div className={`mt-4 p-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'} rounded-lg border`}>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-2 flex items-center gap-1`}>
            <Users className="w-3 h-3" />
            Occupants:
          </p>
          <div className="flex flex-wrap gap-2">
            {room.allocatedTo.slice(0, 3).map((student: any, index: number) => (
              <div key={student.id || index} className={`flex items-center gap-1 text-xs ${isDark ? 'bg-white/10 border-white/20' : 'bg-slate-100 border-slate-200'} px-2 py-1 rounded border`}>
                <UserIcon className={`w-3 h-3 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
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

      <div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
        <div className="flex items-center gap-1.5">
          <DollarSign className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>${room.fee}</span>
          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>/sem</span>
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
            className={`text-xs font-medium ${isDark ? 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'} flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg`}
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
  const { isDark } = useTheme();
  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-xl p-4 ${isDark ? 'hover:bg-white/[0.02] hover:border-indigo-500/30 border-white/10' : 'hover:bg-slate-50 hover:border-indigo-200 border-slate-200'} border transition-all duration-300 cursor-pointer`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
            <Bed className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Room {room.number}</h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{room.type} • Floor {room.floor}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Occupancy</p>
            <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{room.occupied}/{room.capacity}</p>
          </div>

          <div className="text-center">
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Fee</p>
            <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>${room.fee}</p>
          </div>

          <div className="text-center">
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Status</p>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${room.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400' :
              room.status === 'Full' ? 'bg-slate-500/10 text-slate-400' :
                'bg-amber-500/10 text-amber-400'
              }`}>
              {room.status}
            </span>
          </div>

          <ChevronRight className="w-4 h-4 text-slate-400" />
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

  const { isDark } = useTheme();

  return (
    <div className={`group relative rounded-lg p-4 cursor-pointer transition-all ${current
      ? isDark ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'
      : isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-slate-200 hover:bg-slate-50'
      }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${current
            ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
            : isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'
            }`}>
            {getMealIcon(meal)}
          </div>
          <div>
            <h4 className={`text-sm font-medium ${current ? isDark ? 'text-white' : 'text-slate-900' : isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
              {meal}
            </h4>
            <p className={`text-xs ${current ? isDark ? 'text-emerald-400' : 'text-emerald-600' : isDark ? 'text-slate-500' : 'text-slate-500'
              }`}>
              {time}
            </p>
          </div>
        </div>
        {current && (
          <span className="text-[10px] font-medium bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
            Current
          </span>
        )}
      </div>

      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={index} className="text-xs text-slate-400 flex items-start gap-2">
            <div className={`w-1 h-1 rounded-full mt-1.5 ${current ? isDark ? 'bg-emerald-400' : 'bg-emerald-500' : isDark ? 'bg-slate-600' : 'bg-slate-400'
              }`} />
            {item}
          </li>
        ))}
      </ul>

      {!current && (
        <div className="absolute inset-0 rounded-lg border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
  const { isDark } = useTheme();
  const roomAllocations = allocations.filter(a => a.roomId === room.id);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-fade-in">
      <div className={`${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'} border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Room {room.number} Details</h2>
              <p className={isDark ? 'text-slate-400 mt-1' : 'text-slate-600 mt-1'}>{room.type} • Floor {room.floor} • Block {room.block || 'A'}</p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 ${isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'} transition-colors rounded-lg`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Room Info */}
            <div className="md:col-span-2 space-y-6">
              {/* Status & Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-panel rounded-xl p-4">
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Status</p>
                  <p className={`text-sm font-medium mt-1 ${room.status === 'Available' ? isDark ? 'text-emerald-400' : 'text-emerald-600' :
                    room.status === 'Full' ? isDark ? 'text-slate-300' : 'text-slate-700' : isDark ? 'text-amber-400' : 'text-amber-600'
                    }`}>
                    {room.status}
                  </p>
                </div>
                <div className="glass-panel rounded-xl p-4">
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Capacity</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'} mt-1`}>{room.capacity} Beds</p>
                </div>
                <div className="glass-panel rounded-xl p-4">
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Occupied</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'} mt-1`}>{room.occupied} Beds</p>
                </div>
                <div className="glass-panel rounded-xl p-4">
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Fee</p>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'} mt-1`}>${room.fee}/sem</p>
                </div>
              </div>

              {/* Amenities */}
              {room.amenities && room.amenities.length > 0 && (
                <div>
                  <h3 className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-3 flex items-center gap-2`}>
                    <Zap className="w-4 h-4" />
                    Amenities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((amenity: string, index: number) => (
                      <span
                        key={index}
                        className={`px-3 py-2 ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'} border rounded-lg text-sm flex items-center gap-2`}
                      >
                        {amenity === 'AC' && <Snowflake className="w-3 h-3" />}
                        {amenity === 'WiFi' && <Wifi className="w-3 h-3" />}
                        {amenity === 'TV' && <Tv className="w-3 h-3" />}
                        {amenity === 'Attached Bath' && <Bath className="w-3 h-3" />}
                        {!['AC', 'WiFi', 'TV', 'Attached Bath'].includes(amenity) && <CheckCircle className="w-3 h-3" />}
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Occupants */}
              {roomAllocations.length > 0 && (
                <div>
                  <h3 className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-3 flex items-center gap-2`}>
                    <Users className="w-4 h-4" />
                    Current Occupants
                  </h3>
                  <div className="space-y-3">
                    {roomAllocations.map((allocation) => (
                      <div key={allocation.id} className={`p-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'} rounded-lg border`}>
                        <div className="flex items-center gap-3">
                          <img
                            src={allocation.studentAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed= ${allocation.studentName}`}
                            alt={allocation.studentName}
                            className={`w-10 h-10 rounded-full border ${isDark ? 'border-white/10' : 'border-slate-200'}`}
                          />
                          <div className="flex-1">
                            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{allocation.studentName}</h4>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{allocation.studentId} • {allocation.semester}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Check-in</p>
                            <p className={`text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>{allocation.checkInDate || 'Jan 15, 2024'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Actions & Notes */}
            <div className="space-y-6">
              {/* Room Photo */}
              <div className="aspect-square rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                <BedDouble className="w-16 h-16 text-indigo-400" />
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Room Details
                </button>
                <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <Printer className="w-4 h-4" />
                  Print Details
                </button>
                <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
              </div>

              {/* Maintenance History */}
              <div>
                <h3 className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-3`}>Maintenance History</h3>
                <div className="space-y-2">
                  <div className={`flex items-center justify-between text-xs p-2 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} rounded`}>
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>AC Repair</span>
                    <span className={isDark ? 'text-slate-500' : 'text-slate-500'}>2 weeks ago</span>
                  </div>
                  <div className={`flex items-center justify-between text-xs p-2 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} rounded`}>
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Plumbing</span>
                    <span className={isDark ? 'text-slate-500' : 'text-slate-500'}>1 month ago</span>
                  </div>
                  <div className={`flex items-center justify-between text-xs p-2 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} rounded`}>
                    <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Painting</span>
                    <span className={isDark ? 'text-slate-500' : 'text-slate-500'}>3 months ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

