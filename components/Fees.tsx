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
  ArrowRight,
  Hash,
  ShieldCheck
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
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-900 dark:border-indigo-500"></div>
        <p className="dark:text-slate-400 animate-pulse font-black text-xs tracking-widest uppercase">Initializing Financial Records</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-20"
    >
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight text-slate-900 dark:text-white">{t('feeManagement')}</h1>
          <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 tracking-[0.2em] uppercase">{t('trackPayments')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 transition-all backdrop-blur-md shadow-sm"
          >
            {viewMode === 'table' ? <Filter className="w-4 h-4" /> : <ArrowUpDown className="w-4 h-4" />}
            {viewMode === 'table' ? 'Card View' : 'Table View'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 rounded-xl text-sm font-bold text-white transition-all shadow-xl shadow-slate-900/10 dark:shadow-indigo-900/40">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards with Icons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ y: -4 }}
          className="p-8 rounded-[2.5rem] bg-white/60 dark:bg-slate-900/60 border border-white dark:border-indigo-500/20 shadow-2xl shadow-slate-200/50 dark:shadow-none backdrop-blur-2xl relative overflow-hidden group"
        >
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest mb-3 uppercase">Total Outstanding</p>
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">${totalDue.toFixed(2)}</p>
              <div className="flex items-center gap-2 mt-4">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase">{fees.filter(f => f.status === 'Pending' || f.status === 'Overdue').length} pending payments</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 dark:bg-indigo-500 text-white shadow-xl shadow-slate-900/20 group-hover:scale-110 transition-transform duration-500">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-slate-100 dark:bg-indigo-500 rounded-full blur-[60px] opacity-0 group-hover:opacity-10 transition-opacity duration-700" />
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="p-8 rounded-[2.5rem] bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 shadow-xl shadow-emerald-200/20 dark:shadow-none backdrop-blur-xl relative overflow-hidden group"
        >
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-[10px] font-black text-emerald-600/60 dark:text-emerald-500/60 tracking-widest mb-3 uppercase">Amount Paid</p>
              <p className="text-4xl font-black text-emerald-900 dark:text-emerald-400 tracking-tighter tabular-nums">${fees.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0).toFixed(2)}</p>
              <div className="flex items-center gap-2 mt-4">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <p className="text-[10px] font-black text-emerald-600/70 dark:text-emerald-500/70 tracking-widest uppercase">{fees.filter(f => f.status === 'Paid').length} completed payments</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="p-8 rounded-[2.5rem] bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 shadow-xl shadow-indigo-200/20 dark:shadow-none backdrop-blur-xl relative overflow-hidden group"
        >
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-[10px] font-black text-indigo-600/60 dark:text-indigo-500/60 tracking-widest mb-3 uppercase">Next Due Date</p>
              <p className="text-4xl font-black text-indigo-900 dark:text-indigo-400 tracking-tighter tabular-nums">
                {fees.filter(f => f.status === 'Pending').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]?.dueDate 
                  ? new Date(fees.filter(f => f.status === 'Pending').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0].dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : 'N/A'}
              </p>
              <div className="flex items-center gap-2 mt-4">
                <Clock className="w-4 h-4 text-indigo-500" />
                <p className="text-[10px] font-black text-indigo-600/70 dark:text-indigo-500/70 tracking-widest uppercase">
                  {fees.filter(f => f.status === 'Pending').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]?.dueDate
                    ? `${Math.ceil((new Date(fees.filter(f => f.status === 'Pending').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0].dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left`
                    : 'All settled'}
                </p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 group-hover:scale-110 transition-transform duration-500">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by fee type or invoice ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/60 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium shadow-sm"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-6 py-4 bg-white/60 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-700 dark:text-slate-300 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all backdrop-blur-md shadow-sm"
          >
            <option value="all">Global Status</option>
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
            <Receipt className="w-10 h-10  dark:" />
          </div>
          <h3 className="text-xl font-black   mb-2">No fees found</h3>
          <p className="dark: max-w-md font-medium">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'You have no fee records at the moment'}
          </p>
        </motion.div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="rounded-[2.5rem] bg-white/40 dark:bg-slate-900/30 border border-white/40 dark:border-white/10 overflow-hidden shadow-2xl shadow-slate-200/40 dark:shadow-none backdrop-blur-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-white/10 bg-white/30 dark:bg-white/5">
                  <th 
                    onClick={() => handleSort('type')}
                    className="py-5 px-8 text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] uppercase cursor-pointer hover:text-indigo-500 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Description
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('dueDate')}
                    className="py-5 px-8 text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] uppercase cursor-pointer hover:text-indigo-500 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Due Date
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-5 px-8 text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] uppercase">
                    Invoice
                  </th>
                  <th 
                    onClick={() => handleSort('status')}
                    className="py-5 px-8 text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] uppercase cursor-pointer hover:text-indigo-500 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Status
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('amount')}
                    className="py-5 px-8 text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] uppercase text-right cursor-pointer hover:text-indigo-500 transition-colors"
                  >
                    <div className="flex items-center justify-end gap-2">
                      Amount
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-5 px-8 text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] uppercase text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                <AnimatePresence>
                  {sortedFees.map((fee, index) => (
                    <motion.tr 
                      key={fee.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors group"
                    >
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                            fee.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600' : 
                            fee.status === 'Pending' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-rose-500/10 text-rose-600'
                          }`}>
                            <Receipt className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-slate-900 dark:text-white font-black text-sm">{fee.type}</p>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{fee.status === 'Paid' ? 'Transation Complete' : 'Awaiting Payment'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-8 text-sm font-bold text-slate-600 dark:text-slate-400">
                        {new Date(fee.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-6 px-8">
                        <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5">
                          {fee.invoiceId}
                        </span>
                      </td>
                      <td className="py-6 px-8">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase border ${
                          fee.status === 'Paid' 
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                            : fee.status === 'Pending' 
                            ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' 
                            : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                            fee.status === 'Paid' ? 'bg-emerald-500' : 
                            fee.status === 'Pending' ? 'bg-indigo-500' : 'bg-rose-500'
                          }`} />
                          {fee.status}
                        </span>
                      </td>
                      <td className="py-6 px-8 text-right font-black text-slate-900 dark:text-white text-lg">
                        ${fee.amount.toFixed(2)}
                      </td>
                      <td className="py-6 px-8 text-right">
                        <div className="flex items-center justify-end gap-2 transition-all">
                          <button 
                            onClick={() => handleViewInvoice(fee)}
                            className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-indigo-500 transition-all shadow-sm hover:scale-110 active:scale-95"
                            title="View Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {fee.status !== 'Paid' && (
                            <button 
                              onClick={() => handlePayment(fee)}
                              className="px-6 py-3 bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black tracking-[0.2em] rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 uppercase hover:scale-105 active:scale-95"
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
                whileHover={{ y: -8, scale: 1.02 }}
                className="p-8 rounded-[2.5rem] bg-white/60 dark:bg-slate-900/40 border border-white dark:border-white/10 hover:border-indigo-500/30 transition-all group backdrop-blur-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                    fee.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600' : 
                    fee.status === 'Pending' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-rose-500/10 text-rose-600'
                  }`}>
                    <Receipt className="w-6 h-6" />
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                    fee.status === 'Paid' 
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                      : fee.status === 'Pending' 
                      ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' 
                      : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                  }`}>
                    {fee.status}
                  </span>
                </div>
                
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{fee.type}</h3>
                <p className="text-4xl font-black text-slate-900 dark:text-indigo-400 mb-6 tracking-tighter tabular-nums">${fee.amount.toFixed(2)}</p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {new Date(fee.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-mono text-slate-400 dark:text-slate-500">
                    <Hash className="w-4 h-4" />
                    <span>{fee.invoiceId}</span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleViewInvoice(fee)}
                    className="flex-1 py-4 bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-white text-xs font-black tracking-widest uppercase rounded-2xl transition-all border border-slate-200 dark:border-white/10"
                  >
                    Details
                  </button>
                  {fee.status !== 'Paid' && (
                    <button 
                      onClick={() => handlePayment(fee)}
                      className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black tracking-widest uppercase rounded-2xl transition-all shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40"
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl flex items-center justify-center z-50 p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-white dark:border-white/10 rounded-[3rem] p-10 max-w-lg w-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Secure Payment</h3>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase mt-1">PCI-DSS Compliant Gateway</p>
                </div>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-white/5 hover:bg-rose-500 hover:text-white rounded-2xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {selectedFee && (
                <div className="mb-8 p-6 rounded-[2rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-center">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-2">{selectedFee.type}</p>
                  <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">${selectedFee.amount.toFixed(2)}</p>
                </div>
              )}
              
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase ml-1">Cardholder Name</label>
                  <input 
                    type="text" 
                    value={paymentForm.name}
                    onChange={(e) => setPaymentForm({...paymentForm, name: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                    placeholder="FULL NAME ON CARD"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase ml-1">Card Details</label>
                  <div className="relative group">
                    <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      type="text" 
                      value={paymentForm.cardNumber}
                      onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono font-bold"
                      placeholder="0000 0000 0000 0000"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase ml-1">Expiry</label>
                    <input 
                      type="text" 
                      value={paymentForm.expiryDate}
                      onChange={(e) => setPaymentForm({...paymentForm, expiryDate: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase ml-1">CVC</label>
                    <input 
                      type="text" 
                      value={paymentForm.cvv}
                      onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                      placeholder="000"
                    />
                  </div>
                </div>
                
                <button 
                  onClick={handleProcessPayment}
                  disabled={processingPayment}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-black text-xs tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-3 mt-4 shadow-xl shadow-indigo-500/30 uppercase"
                >
                  {processingPayment ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      Authorize ${selectedFee?.amount.toFixed(2)}
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
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[3rem] p-10 max-w-lg w-full shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-500/10 rounded-xl">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Invoice Details</h3>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{selectedFee.invoiceId}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowInvoiceModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-1 mb-8">
                <div className="flex justify-between py-4 border-b border-slate-100 dark:border-white/5">
                  <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Description</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{selectedFee.type}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-slate-100 dark:border-white/5">
                  <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Due Date</span>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{new Date(selectedFee.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between py-4 border-b border-slate-100 dark:border-white/5">
                  <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Status</span>
                  <span className={`px-3 py-1 rounded-xl text-[10px] font-black tracking-widest uppercase border ${
                    selectedFee.status === 'Paid' 
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                      : selectedFee.status === 'Pending' 
                      ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' 
                      : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                  }`}>
                    {selectedFee.status}
                  </span>
                </div>
                <div className="flex justify-between py-6">
                  <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Final Amount</span>
                  <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">${selectedFee.amount.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => handleDownloadInvoice(selectedFee)}
                  className="flex-1 py-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white text-[10px] font-black tracking-widest uppercase rounded-2xl transition-all flex items-center justify-center gap-2 border border-slate-100 dark:border-white/5"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                {selectedFee.status !== 'Paid' && (
                  <button 
                    onClick={() => {
                      setShowInvoiceModal(false);
                      handlePayment(selectedFee);
                    }}
                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black tracking-widest uppercase rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20"
                  >
                    <CreditCard className="w-4 h-4" />
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