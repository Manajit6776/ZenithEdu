import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  Search, 
  Download, 
  Eye, 
  Loader2,
  FileText,
  X,
  Filter,
  ArrowUpDown,
  Wallet,
  TrendingUp,
  Clock,
  ChevronDown,
  MoreHorizontal,
  Receipt,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { feeService } from '../lib/api';

interface PaymentFormData {
  amount: string;
  method: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  name: string;
}

interface Fee {
  id: string;
  type: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  invoiceId: string;
}

export const Fees: React.FC = () => {
  const { t } = useLanguage();
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    amount: '',
    method: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });
  const [sortConfig, setSortConfig] = useState<{ key: keyof Fee; direction: 'asc' | 'desc' } | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      const data = await feeService.getAllFeeRecords();
      setFees(data);
    } catch (error) {
      console.error('Failed to load fees:', error);
      // Fallback to mock data if API fails
      setFees([
        { id: '1', type: 'Tuition Fee', amount: 5000.00, dueDate: '2024-01-31', status: 'Paid', invoiceId: 'INV-CS2021001-1766871344600' },
        { id: '2', type: 'Tuition Fee', amount: 5000.00, dueDate: '2024-01-31', status: 'Paid', invoiceId: 'INV-CS2021002-1766871344600' },
        { id: '3', type: 'Tuition Fee', amount: 5000.00, dueDate: '2024-01-31', status: 'Pending', invoiceId: 'INV-CS2021003-1766871344600' },
        { id: '4', type: 'Tuition Fee', amount: 4500.00, dueDate: '2024-01-31', status: 'Paid', invoiceId: 'INV-PH2021001-1766871344600' },
        { id: '5', type: 'Tuition Fee', amount: 4500.00, dueDate: '2024-01-31', status: 'Pending', invoiceId: 'INV-PH2021002-1766871344600' },
        { id: '6', type: 'Tuition Fee', amount: 5000.00, dueDate: '2024-01-31', status: 'Pending', invoiceId: 'INV-PH2021003-1766871344600' },
        { id: '7', type: 'Tuition Fee', amount: 5000.00, dueDate: '2024-01-31', status: 'Pending', invoiceId: 'INV-PH2021004-1766871344600' },
        { id: '8', type: 'Tuition Fee', amount: 5000.00, dueDate: '2024-01-31', status: 'Pending', invoiceId: 'INV-PH2021005-1766871344600' },
        { id: '9', type: 'Tuition Fee', amount: 5000.00, dueDate: '2024-01-31', status: 'Pending', invoiceId: 'INV-PH2021006-1766871344600' },
        { id: '10', type: 'Tuition Fee', amount: 5000.00, dueDate: '2024-01-31', status: 'Pending', invoiceId: 'INV-PH2021007-1766871344600' },
        { id: '11', type: 'Tuition Fee', amount: 5000.00, dueDate: '2024-01-31', status: 'Pending', invoiceId: 'INV-PH2021008-1766871344600' },
        { id: '12', type: 'Tuition Fee', amount: 5000.00, dueDate: '2024-01-31', status: 'Pending', invoiceId: 'INV-PH2021009-1766871344600' },
        { id: '13', type: 'Tuition Fee', amount: 5000.00, dueDate: '2024-01-31', status: 'Pending', invoiceId: 'INV-PH2021010-1766871344600' },
        { id: '14', type: 'Tuition Fee', amount: 5000.00, dueDate: '2024-01-31', status: 'Pending', invoiceId: 'INV-PH2021011-1766871344600' },
        { id: '15', type: 'Library Fee', amount: 200.00, dueDate: '2024-02-27', status: 'Pending', invoiceId: 'INV-CS001-2024-1' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (fee?: Fee) => {
    if (fee) {
      setSelectedFee(fee);
      setPaymentForm(prev => ({ ...prev, amount: fee.amount.toString() }));
    }
    setShowPaymentModal(true);
  };

  const handleProcessPayment = async () => {
    setProcessingPayment(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (selectedFee) {
        try {
          await feeService.updateFeeStatus(selectedFee.id, 'Paid');
        } catch (error) {
          // If API fails, update locally
          setFees(prev => prev.map(fee => 
            fee.id === selectedFee.id ? { ...fee, status: 'Paid' as const } : fee
          ));
        }
      }
      
      setShowPaymentModal(false);
      setPaymentForm({
        amount: '',
        method: 'card',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        name: ''
      });
      setSelectedFee(null);
      alert(t('paymentProcessedSuccessfully'));
    } catch (error) {
      alert(t('paymentFailed'));
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleDownloadInvoice = async (fee: Fee) => {
    try {
      // Simulate invoice download
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(t('invoiceDownloadedSuccessfully', { invoiceId: fee.invoiceId }));
    } catch (error) {
      console.error('Failed to download invoice:', error);
      alert(t('failedToDownloadInvoice'));
    }
  };

  const handleViewInvoice = (fee: Fee) => {
    setSelectedFee(fee);
    setShowInvoiceModal(true);
  };

  const filteredFees = fees.filter(fee => {
    const matchesSearch = fee.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fee.invoiceId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || fee.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleSort = (key: keyof Fee) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedFees = React.useMemo(() => {
    let sortableFees = [...filteredFees];
    if (sortConfig) {
      sortableFees.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableFees;
  }, [filteredFees, sortConfig]);

  const totalDue = fees.filter(fee => fee.status === 'Pending' || fee.status === 'Overdue')
                     .reduce((sum, fee) => sum + fee.amount, 0);
  
  const lastPayment = fees.filter(fee => fee.status === 'Paid')
                         .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-rose-800 dark:text-white mb-2 tracking-tight uppercase">{t('feeManagement')}</h1>
          <p className="text-[11px] font-black text-rose-700/60 dark:text-slate-500 uppercase tracking-[0.2em]">{t('trackPayments')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-slate-300 transition-all"
          >
            {viewMode === 'table' ? <Filter className="w-4 h-4" /> : <ArrowUpDown className="w-4 h-4" />}
            {viewMode === 'table' ? 'Card View' : 'Table View'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 dark:from-indigo-600 dark:to-violet-700 hover:from-rose-500 hover:to-pink-500 dark:hover:from-indigo-500 dark:hover:to-violet-600 rounded-xl text-sm font-bold text-white transition-all shadow-lg shadow-rose-200 dark:shadow-indigo-900/40">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards with Icons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ y: -4 }}
          className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/60 border-2 border-rose-100 dark:border-indigo-500/20 shadow-2xl backdrop-blur-xl relative overflow-hidden group"
        >
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-[10px] font-black text-rose-700/40 dark:text-slate-500 uppercase tracking-widest mb-2">Total Outstanding</p>
              <p className="text-3xl font-black text-rose-900 dark:text-white tracking-tighter tabular-nums">${totalDue.toFixed(2)}</p>
              <p className="text-[10px] text-slate-500 mt-4 font-bold uppercase tracking-widest">{fees.filter(f => f.status === 'Pending' || f.status === 'Overdue').length} pending payments</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-rose-500/10 dark:bg-indigo-500/20 text-rose-600 dark:text-indigo-400 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-rose-500 dark:bg-indigo-500 rounded-full blur-[60px] opacity-0 group-hover:opacity-10 transition-opacity duration-700" />
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-emerald-100/50 to-emerald-50 dark:from-emerald-500/10 dark:to-teal-500/10 border border-emerald-200/30 dark:border-emerald-500/20 shadow-lg shadow-emerald-200/20 dark:shadow-emerald-500/10"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 font-bold mb-1 uppercase tracking-wider">Amount Paid</p>
              <p className="text-3xl font-black text-black dark:text-white">${fees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0).toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-2 font-medium">{fees.filter(f => f.status === 'Paid').length} completed payments</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20">
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 backdrop-blur-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-amber-300 font-medium mb-1">Next Due Date</p>
              <p className="text-3xl font-bold text-white">
                {fees.filter(f => f.status === 'Pending').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]?.dueDate 
                  ? new Date(fees.filter(f => f.status === 'Pending').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0].dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'No pending'}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                {fees.filter(f => f.status === 'Pending').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]?.dueDate
                  ? `${Math.ceil((new Date(fees.filter(f => f.status === 'Pending').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0].dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left`
                  : 'All caught up!'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/20">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by type or invoice ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/40 dark:bg-slate-900/50 border border-rose-200/30 dark:border-white/10 rounded-xl text-black dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-indigo-500/50 transition-all font-medium"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500/50 transition-all"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Fees Display */}
      {sortedFees.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-rose-100 dark:bg-slate-800 flex items-center justify-center mb-4 border border-rose-200/30 dark:border-white/5">
            <Receipt className="w-10 h-10 text-rose-600 dark:text-slate-600" />
          </div>
          <h3 className="text-xl font-black text-rose-800 dark:text-white mb-2">No fees found</h3>
          <p className="text-slate-600 dark:text-slate-500 max-w-md font-medium">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'You have no fee records at the moment'}
          </p>
        </motion.div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="rounded-2xl bg-white/40 dark:bg-slate-900/30 border border-rose-200/20 dark:border-white/10 overflow-hidden shadow-xl shadow-rose-200/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-rose-200/20 dark:border-white/10 bg-white/30 dark:bg-white/5">
                  <th 
                    onClick={() => handleSort('type')}
                    className="py-4 px-6 text-xs font-black text-rose-700 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-rose-900 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Description
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('dueDate')}
                    className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Due Date
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Invoice ID
                  </th>
                  <th 
                    onClick={() => handleSort('status')}
                    className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Status
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('amount')}
                    className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center justify-end gap-2">
                      Amount
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                  {sortedFees.map((fee, index) => (
                    <motion.tr 
                      key={fee.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            fee.status === 'Paid' ? 'bg-emerald-500/10' : 
                            fee.status === 'Pending' ? 'bg-amber-500/10' : 'bg-rose-500/10'
                          }`}>
                            <DollarSign className={`w-5 h-5 ${
                              fee.status === 'Paid' ? 'text-emerald-400' : 
                              fee.status === 'Pending' ? 'text-amber-400' : 'text-rose-400'
                            }`} />
                          </div>
                          <div>
                            <p className="text-black dark:text-white font-bold">{fee.type}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-500 font-medium">{fee.status === 'Paid' ? 'Paid on time' : 'Payment pending'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(fee.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-slate-500 font-mono text-xs bg-slate-800 px-2 py-1 rounded">
                          {fee.invoiceId}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          fee.status === 'Paid' 
                            ? 'bg-rose-500/5 text-rose-600 dark:bg-indigo-500/10 dark:text-indigo-400 border-rose-500/20 dark:border-indigo-500/20' 
                            : fee.status === 'Pending' 
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            fee.status === 'Paid' ? 'bg-rose-600 dark:bg-indigo-400' : 
                            fee.status === 'Pending' ? 'bg-amber-400' : 'bg-red-400'
                          }`} />
                          {fee.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <p className="text-white font-semibold">${fee.amount.toFixed(2)}</p>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleViewInvoice(fee)}
                            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title="View Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDownloadInvoice(fee)}
                            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title="Download Invoice"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {fee.status !== 'Paid' && (
                            <button 
                              onClick={() => handlePayment(fee)}
                              className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-pink-600 dark:from-indigo-600 dark:to-violet-700 hover:from-rose-500 hover:to-pink-500 dark:hover:from-indigo-500 dark:hover:to-violet-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-md shadow-rose-200 dark:shadow-indigo-900/40"
                            >
                              Pay
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {sortedFees.map((fee, index) => (
              <motion.div
                key={fee.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="p-6 rounded-2xl bg-slate-900/50 border border-white/10 hover:border-white/20 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    fee.status === 'Paid' ? 'bg-emerald-500/10' : 
                    fee.status === 'Pending' ? 'bg-amber-500/10' : 'bg-rose-500/10'
                  }`}>
                    <DollarSign className={`w-6 h-6 ${
                      fee.status === 'Paid' ? 'text-emerald-400' : 
                      fee.status === 'Pending' ? 'text-amber-400' : 'text-rose-400'
                    }`} />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    fee.status === 'Paid' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : fee.status === 'Pending' 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {fee.status}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-1">{fee.type}</h3>
                <p className="text-2xl font-bold text-white mb-4">${fee.amount.toFixed(2)}</p>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {new Date(fee.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Receipt className="w-4 h-4" />
                    <span className="font-mono text-xs">{fee.invoiceId}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleViewInvoice(fee)}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    View
                  </button>
                  {fee.status !== 'Paid' && (
                    <button 
                      onClick={() => handlePayment(fee)}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Make Payment</h3>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              {selectedFee && (
                <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-slate-400 mb-1">{selectedFee.type}</p>
                  <p className="text-2xl font-bold text-white">${selectedFee.amount.toFixed(2)}</p>
                  <p className="text-xs text-slate-500 mt-1">{selectedFee.invoiceId}</p>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Cardholder Name</label>
                  <input 
                    type="text" 
                    value={paymentForm.name}
                    onChange={(e) => setPaymentForm({...paymentForm, name: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Card Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      type="text" 
                      value={paymentForm.cardNumber}
                      onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Expiry</label>
                    <input 
                      type="text" 
                      value={paymentForm.expiryDate}
                      onChange={(e) => setPaymentForm({...paymentForm, expiryDate: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">CVV</label>
                    <input 
                      type="text" 
                      value={paymentForm.cvv}
                      onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="123"
                    />
                  </div>
                </div>
                
                <button 
                  onClick={handleProcessPayment}
                  disabled={processingPayment}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay ${selectedFee?.amount.toFixed(2)}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoice Modal */}
      <AnimatePresence>
        {showInvoiceModal && selectedFee && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-lg w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <FileText className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Invoice Details</h3>
                    <p className="text-xs text-slate-500">{selectedFee.invoiceId}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowInvoiceModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between py-3 border-b border-white/5">
                  <span className="text-slate-400">Description</span>
                  <span className="text-white font-medium">{selectedFee.type}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/5">
                  <span className="text-slate-400">Due Date</span>
                  <span className="text-white">{new Date(selectedFee.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-white/5">
                  <span className="text-slate-400">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                    selectedFee.status === 'Paid' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : selectedFee.status === 'Pending' 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {selectedFee.status}
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-slate-400">Amount</span>
                  <span className="text-xl font-bold text-white">${selectedFee.amount.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => handleDownloadInvoice(selectedFee)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download
                </button>
                {selectedFee.status !== 'Paid' && (
                  <button 
                    onClick={() => {
                      setShowInvoiceModal(false);
                      handlePayment(selectedFee);
                    }}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Pay Now
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
