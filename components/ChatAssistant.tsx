import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MessageCircle, X, Send, User, Bot, Mic, Trash2, Clock, Volume2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// Define message interface with timestamp
interface Message {
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

// Quick actions configuration
const QUICK_ACTIONS = [
  { label: 'Check Schedule', query: 'What is my class schedule?' },
  { label: 'Assignment Due', query: 'When is my next assignment due?' },
  { label: 'Exam Dates', query: 'What are the upcoming exam dates?' },
  { label: 'Attendance', query: 'What is my current attendance percentage?' },
  { label: 'Fee Status', query: 'What is my fee payment status?' },
  { label: 'Library Books', query: 'What books are available in the library?' },
];

// Voice recognition setup (webkitSpeechRecognition type)
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

// Storage key for chat history
const CHAT_STORAGE_KEY = 'zenithedu_chat_history_v2';

export const ChatAssistant: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'ai', 
      text: 'Hi! I am the ZenithEdu AI Assistant. Ask me about schedules, syllabus, or leave policies.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load chat history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Convert string timestamps back to Date objects
          const loadedMessages = parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(loadedMessages);
          
          // Try to extract user name from history
          extractUserNameFromHistory(loadedMessages);
        }
      } catch (e) {
        console.error('Failed to load chat history', e);
      }
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-50))); // Keep last 50 messages
    }
  }, [messages]);

  // Initialize voice recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setError('Voice recognition failed. Please try typing instead.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Extract user name from chat history
  const extractUserNameFromHistory = useCallback((history: Message[]) => {
    for (const msg of history) {
      if (msg.role === 'user') {
        const text = msg.text.toLowerCase();
        if (text.includes('my name is')) {
          const match = text.match(/my name is ([a-z ]+)/i);
          if (match) {
            setUserName(match[1].trim());
            break;
          }
        } else if (text.includes('call me')) {
          const match = text.match(/call me ([a-z ]+)/i);
          if (match) {
            setUserName(match[1].trim());
            break;
          }
        }
      }
    }
  }, []);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle sending messages
  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const userMsg = input.trim();
    const userMessage: Message = { 
      role: 'user', 
      text: userMsg,
      timestamp: new Date()
    };
    
    setInput('');
    setError(null);
    setIsTyping(true);

    const newMessages = [...messages, userMessage];
    const history = newMessages.slice(-5).map(m => `${m.role === 'user' ? 'Student' : 'Mentor'}: ${m.text}`);
      
    setMessages(newMessages);
    
    // Process AI response
    try {
      const response = await chatWithMentorAI(userMsg, history, userName);
      const aiMessage: Message = { 
        role: 'ai', 
        text: response,
        timestamp: new Date()
      };
      setMessages(current => [...current, aiMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError('Failed to get response. Please try again.');
        
      const errorMessage: Message = { 
        role: 'ai', 
        text: 'I apologize, but I encountered an error. Please try again or contact support if the issue persists.',
        timestamp: new Date()
      };
      setMessages(current => [...current, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [input, messages, userName]);

  // Handle quick action click
  const handleQuickAction = useCallback((query: string) => {
    setInput(query);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle voice input
  const toggleVoiceInput = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Voice recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setError(null);
      } catch (err) {
        console.error('Voice recognition error:', err);
        setError('Voice recognition failed to start.');
      }
    }
  }, [isListening]);

  // Clear chat history
  const clearChat = useCallback(() => {
    if (window.confirm('Clear all chat messages?')) {
      const initialMessage: Message = { 
        role: 'ai', 
        text: 'Hi! I am the ZenithEdu AI Assistant. Ask me about schedules, syllabus, or leave policies.',
        timestamp: new Date()
      };
      setMessages([initialMessage]);
      setUserName(null);
      localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  }, []);

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format timestamp
  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  // Memoized message list
  const messageList = useMemo(() => {
    return messages.map((msg, idx) => (
      <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white' : 'bg-gradient-to-br from-green-500 to-emerald-500 text-white'}`}>
          {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </div>
        <div className="flex flex-col max-w-[80%]">
          <div className={`p-3 rounded-2xl text-sm backdrop-blur-sm ${
            msg.role === 'user' 
              ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/25' 
              : 'bg-slate-800/50 text-slate-200 border border-white/10 rounded-tl-none shadow-lg'
          }`}>
            {msg.text}
          </div>
          <div className={`text-xs text-slate-500 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <Clock className="inline w-3 h-3 mr-1" />
            {formatTime(msg.timestamp)}
          </div>
        </div>
      </div>
    ));
  }, [messages, formatTime]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div 
          role="dialog" 
          aria-label="AI Assistant Chat"
          className="w-80 sm:w-96 h-[500px] rounded-2xl shadow-2xl mb-4 flex flex-col overflow-hidden animate-slide-up bg-slate-900/95 backdrop-blur-xl border border-white/10"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 p-4 flex justify-between items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
            <div className="flex items-center gap-2 text-white relative z-10">
              <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold">AI Assistant</span>
                {userName && (
                  <div className="text-xs text-white/80">Hi {userName}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 relative z-10">
              <button 
                onClick={clearChat}
                className="text-white/80 hover:text-white transition-all hover:bg-white/10 p-2 rounded-lg"
                title="Clear chat history"
                aria-label="Clear chat history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-all hover:bg-white/10 p-2 rounded-lg"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-4 mt-3 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-center justify-between backdrop-blur-sm">
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </span>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Actions */}
          <div className="p-4 bg-slate-800/50 backdrop-blur-sm border-b border-white/5">
            <div className="text-xs text-slate-400 mb-3 font-medium uppercase tracking-wider">
              Quick Actions
            </div>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickAction(action.query)}
                  className="px-3 py-2 text-xs bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-lg hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all duration-200 text-left"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div 
            role="log" 
            aria-live="polite"
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/30 backdrop-blur-sm custom-scrollbar"
          >
            {messageList}
            
            {isTyping && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm p-3 rounded-2xl rounded-tl-none border border-white/10 flex gap-1">
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-800/50 backdrop-blur-sm border-t border-white/5 flex gap-2">
            <input 
              ref={inputRef}
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your question..."
              aria-label="Chat input"
              className="flex-1 bg-slate-700/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none backdrop-blur-sm transition-all"
              disabled={isTyping}
            />
            <button 
              onClick={toggleVoiceInput}
              className={`p-3 transition-all rounded-xl ${isListening 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' 
                : 'text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 border border-white/10 hover:border-indigo-500/30'
              }`}
              disabled={!(
                'webkitSpeechRecognition' in window ||
                'SpeechRecognition' in window
              )}
              title={isListening ? 'Stop listening' : 'Voice input'}
              aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
            >
              {isListening ? <Volume2 className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/25"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 relative overflow-hidden ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600 shadow-red-500/25' 
            : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-700 shadow-indigo-500/25'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        {isOpen ? (
          <X className="w-6 h-6 text-white relative z-10" />
        ) : (
          <div className="relative z-10">
            <MessageCircle className="w-6 h-6 text-white" />
            {messages.length > 1 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                {Math.min(messages.length - 1, 9)}
              </span>
            )}
          </div>
        )}
      </button>
    </div>
  );
};

// Enhanced AI service with comprehensive responses and personalization
const responses = {
  greeting: [
    "Hello! I'm your ZenithEdu AI assistant. How can I help you today?",
    "Hi there! I'm here to help with your academic needs. What can I assist you with?",
    "Welcome! I'm your academic mentor. Feel free to ask me anything about your studies.",
    "Good day! I'm ready to help you navigate through ZenithEdu services.",
    "Hey! Need help with anything? I'm your go-to assistant for all academic matters."
  ],
  
  schedule: [
    "I can help you check your class schedule. You can find it in the Timetable section of your dashboard.",
    "Your class schedule is available in the Timetable section. Would you like me to guide you there?",
    "For your current schedule, please check the Timetable tab in your dashboard.",
    "Class timings and schedules are maintained in the Timetable section. You'll see all your upcoming classes there.",
    "To view your daily or weekly schedule, navigate to the Timetable section in your portal."
  ],
  
  syllabus: [
    "You can access your syllabus in the Academics section of your portal. Each course has detailed syllabus information.",
    "Syllabus information is available under the Academics tab. You'll find all your course materials there.",
    "Check the Academics section for complete syllabus details for all your courses.",
    "Course syllabi and curriculum details are maintained in the Academics section.",
    "For detailed course outlines and syllabus information, visit the Academics tab in your dashboard."
  ],
  
  attendance: [
    "Your attendance records are available in the Students section. You can track your attendance percentage there.",
    "To check your attendance, go to the Students section where you'll find detailed attendance reports.",
    "Attendance tracking is available in your student profile. Current attendance shows there.",
    "Your attendance percentage and detailed records are maintained in the Students section.",
    "For attendance reports and statistics, check the Students tab in your portal."
  ],
  
  fees: [
    "For fee information, check the Fees section in your dashboard. You'll see payment status and due dates.",
    "Fee details and payment status are available in the Fees tab. Any pending payments will be shown there.",
    "Your fee records are maintained in the Fees section. You can check payment history and upcoming dues.",
    "Payment history and current fee status are available in the Fees section of your portal.",
    "To view fee structure, payment deadlines, and transaction history, visit the Fees tab."
  ],
  
  library: [
    "The Library section shows all available books and your current borrowings. You can search for books there.",
    "Check the Library tab to browse available books and manage your borrowings.",
    "Library services are available through the Library section. You can search and request books there.",
    "Book catalog, borrowing history, and library services are accessible via the Library tab.",
    "For library resources, book searches, and borrowing management, visit the Library section."
  ],
  
  transport: [
    "Bus routes and transport information are available in the Transport section. You can track your bus there.",
    "For bus schedules and routes, check the Transport tab. Live tracking is available for active routes.",
    "Transport services including bus tracking are available in the Transport section.",
    "Bus route details, departure times, and live tracking are accessible through the Transport tab.",
    "To track your bus or view transport schedules, visit the Transport section in your portal."
  ],
  
  hostel: [
    "Hostel information and room details are available in the Hostel section of your portal.",
    "Check the Hostel tab for room allocation, fees, and hostel facilities information.",
    "Your hostel details and room information are maintained in the Hostel section.",
    "Room allocation, hostel fees, and facility information are available in the Hostel tab.",
    "For hostel-related services and room details, visit the Hostel section in your dashboard."
  ],
  
  exams: [
    "Exam schedules and results are available in the Academics section. You'll find all exam-related information there.",
    "Check the Academics tab for exam timetables, results, and examination guidelines.",
    "Examination information including schedules and results is maintained in the Academics section.",
    "For exam dates, results, and examination policies, visit the Academics tab in your portal.",
    "Exam-related services and information are accessible through the Academics section."
  ],
  
  assignments: [
    "Assignment details and submission deadlines are available in the Academics section.",
    "Check the Academics tab for your current assignments and submission requirements.",
    "Assignment tracking and submission information is maintained in the Academics section.",
    "For assignment deadlines and submission guidelines, visit the Academics tab.",
    "Your assignment status and upcoming deadlines are available in the Academics section."
  ],
  
  grades: [
    "Your grades and academic performance are available in the Academics section.",
    "Check the Academics tab to view your grades, GPA, and academic progress.",
    "Grade reports and academic performance metrics are maintained in the Academics section.",
    "For detailed grade reports and academic history, visit the Academics tab in your portal.",
    "Your current grades and academic achievements are accessible through the Academics section."
  ],
  
  courses: [
    "Course information and registration details are available in the Academics section.",
    "Check the Academics tab for course descriptions, prerequisites, and registration status.",
    "Course catalog and registration information is maintained in the Academics section.",
    "For course details and enrollment information, visit the Academics tab in your portal.",
    "Your current courses and academic program information are available in the Academics section."
  ],
  
  teachers: [
    "Teacher information and contact details are available in the Teachers section.",
    "Check the Teachers tab to find your instructors and their contact information.",
    "Faculty directory and teacher profiles are maintained in the Teachers section.",
    "For teacher contact information and office hours, visit the Teachers tab in your portal.",
    "Your instructors' profiles and contact details are accessible through the Teachers section."
  ],
  
  students: [
    "Student records and profiles are available in the Students section.",
    "Check the Students tab to access student information and class rosters.",
    "Student directory and academic records are maintained in the Students section.",
    "For student profiles and academic information, visit the Students tab in your portal.",
    "Student information and class details are accessible through the Students section."
  ],
  
  notices: [
    "College notices and announcements are available in the Notices section.",
    "Check the Notices tab for the latest announcements and important information.",
    "Official notices and circulars are maintained in the Notices section.",
    "For college announcements and important notices, visit the Notices tab in your portal.",
    "Current notices and college communications are accessible through the Notices section."
  ],
  
  events: [
    "College events and activities are announced through the Notices section.",
    "Check the Notices tab for upcoming events and college activities.",
    "Event schedules and college activities are posted in the Notices section.",
    "For information about college events and activities, visit the Notices tab.",
    "Upcoming events and college activities are announced through the Notices section."
  ],
  
  help: [
    "I'm here to help! You can ask me about schedules, syllabus, attendance, fees, library, transport, hostel, exams, assignments, grades, courses, teachers, students, or notices.",
    "I can assist with various academic services. Try asking about any specific service you need help with.",
    "Feel free to ask about any ZenithEdu service - I'm here to guide you through the system.",
    "Need help? I can provide information about all available services in your portal.",
    "I'm your academic assistant! Ask me about any aspect of your college life."
  ],
  
  general: [
    "ZenithEdu is a comprehensive college management system designed to streamline academic and administrative processes.",
    "Our mission is to provide quality education with modern technology integration for enhanced learning experiences.",
    "ZenithEdu offers various programs in engineering, management, sciences, and arts with experienced faculty.",
    "We focus on holistic development through academics, extracurricular activities, and industry partnerships.",
    "ZenithEdu is committed to fostering innovation, research, and excellence in education."
  ],
  
  admission: [
    "Admission information is available through the Admissions section. You can find application forms, eligibility criteria, and important dates there.",
    "For admission queries, check the Admissions tab for program details, fee structure, and application procedures.",
    "Admission requirements and procedures are maintained in the Admissions section of your portal.",
    "To apply for admission or check admission status, visit the Admissions tab in your dashboard.",
    "Admission counseling and guidance services are available through the Admissions section."
  ],
  
  campus: [
    "ZenithEdu campus features modern classrooms, well-equipped labs, library, sports facilities, and hostel accommodation.",
    "Our campus provides a safe and conducive learning environment with 24/7 security and medical facilities.",
    "Campus facilities include Wi-Fi connectivity, computer labs, auditorium, cafeteria, and recreational areas.",
    "The campus is located in a prime area with easy access to public transportation and essential services.",
    "We maintain a green campus with eco-friendly initiatives and sustainable practices."
  ],
  
  facilities: [
    "ZenithEdu offers state-of-the-art facilities including modern labs, digital library, sports complex, and hostel facilities.",
    "Our infrastructure includes smart classrooms, research centers, innovation labs, and medical facilities.",
    "Campus facilities provide comprehensive support for academic, research, and extracurricular activities.",
    "We maintain high-quality facilities to ensure the best learning environment for our students.",
    "Facilities are regularly updated to incorporate the latest technology and educational tools."
  ],
  
  contact: [
    "You can contact the administration office through the Contact section or call our helpline numbers.",
    "For urgent matters, visit the admin office or use the emergency contact numbers provided in your portal.",
    "Faculty contact information is available in the Teachers section for academic queries.",
    "Department contacts and office hours are listed in the respective sections of your portal.",
    "We offer multiple communication channels including email, phone, and in-person support."
  ],
  
  parent: [
    "Parent information and contact details are available in the Parents section.",
    "Check the Parents tab to find parent contacts, student relationships, and emergency information.",
    "Parent records and contact information are maintained in the Parents section.",
    "For parent contact details and student-parent relationships, visit the Parents tab in your portal.",
    "Parent information including contact numbers and emergency contacts is accessible through the Parents section."
  ],
  
  onlineClass: [
    "Online classes are available in the Online Classes section. Teachers can add class links and students can join live sessions.",
    "Check the Online Classes tab to view scheduled classes, join live sessions, and access class links.",
    "Online class schedules and links are maintained in the Online Classes section.",
    "For live classes and online learning sessions, visit the Online Classes tab in your portal.",
    "Teachers can create online classes with meeting links, and students can join when classes are live."
  ],
  
  thankYou: [
    "You're welcome! I'm always here to help.",
    "Glad I could assist! Let me know if you need anything else.",
    "Happy to help! Don't hesitate to ask more questions.",
    "My pleasure! Feel free to reach out anytime.",
    "You're most welcome! I'm here for all your academic queries."
  ],
  
  default: [
    "I'm here to help! You can ask me about schedules, syllabus, attendance, fees, library, transport, hostel, exams, assignments, grades, courses, teachers, students, or notices.",
    "I can assist with various academic services. Try asking about schedules, syllabus, or any specific service you need.",
    "Feel free to ask about any ZenithEdu service - I'm here to guide you through the system.",
    "I'm your academic assistant! Ask me about any aspect of your college life at ZenithEdu.",
    "Need help with anything? I'm here to assist you with all academic and administrative services."
  ]
};

// Context analysis function
const analyzeContext = (history: string[]): string => {
  const lastMessages = history.slice(-3).join(' ').toLowerCase();
  
  if (lastMessages.includes('exam') && lastMessages.includes('schedule')) {
    return 'exam_schedule';
  }
  if (lastMessages.includes('assignment') && lastMessages.includes('deadline')) {
    return 'assignment_deadline';
  }
  if (lastMessages.includes('fee') && lastMessages.includes('payment')) {
    return 'fee_payment';
  }
  if (lastMessages.includes('attendance') && lastMessages.includes('percentage')) {
    return 'attendance_percentage';
  }
  return 'general';
};

// Enhanced AI chat function with personalization
export const chatWithMentorAI = async (message: string, history: string[], userName: string | null = null): Promise<string> => {
  const lowerMessage = message.toLowerCase();
  const context = analyzeContext(history);
  
  // Personalized responses
  if (userName) {
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return `You're welcome, ${userName}! ${responses.thankYou[Math.floor(Math.random() * responses.thankYou.length)]}`;
    }
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      const greeting = responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
      return greeting.includes('Hello') 
        ? greeting.replace('Hello', `Hello ${userName}`)
        : `Hello ${userName}! ${greeting}`;
    }
  }
  
  // Check for keywords and return appropriate responses
  const keywordMap: { [key: string]: string[] } = {
    'hello|hi|hey|good': responses.greeting,
    'schedule|timetable|class|timing': responses.schedule,
    'syllabus|course|subject|curriculum': responses.syllabus,
    'attendance|present|absent': responses.attendance,
    'fee|payment|due|paid': responses.fees,
    'library|book|borrow|reading': responses.library,
    'bus|transport|route|commute': responses.transport,
    'hostel|room|accommodation|dorm': responses.hostel,
    'exam|test|examination|result': responses.exams,
    'assignment|homework|submit|deadline': responses.assignments,
    'grade|gpa|mark|score': responses.grades,
    'teacher|faculty|professor|instructor': responses.teachers,
    'student|classmate|peer|batch': responses.students,
    'notice|announcement|circular|information': responses.notices,
    'event|activity|function|program': responses.events,
    'help|assist|support|guide': responses.help,
    'what|about|zenithedu|college|institution': responses.general,
    'admission|apply|enroll|join|registration': responses.admission,
    'campus|location|building|ground|environment': responses.campus,
    'facility|infrastructure|equipment|lab|resource': responses.facilities,
    'contact|call|phone|email|reach|communicate': responses.contact,
    'parent|father|mother|guardian|family': responses.parent,
    'online|virtual|zoom|meet|video|live class': responses.onlineClass,
  };
  
  for (const [pattern, responseArray] of Object.entries(keywordMap)) {
    const regex = new RegExp(pattern);
    if (regex.test(lowerMessage)) {
      return responseArray[Math.floor(Math.random() * responseArray.length)];
    }
  }
  
  // Context-based responses
  if (context === 'exam_schedule') {
    return "Exam schedules are typically released 2-3 weeks before the exam period. Check the Academics section for the official timetable when it's published.";
  }
  
  if (context === 'assignment_deadline') {
    return "Assignment deadlines are strict. Make sure to submit at least 24 hours before the deadline to avoid any technical issues.";
  }
  
  // Default response
  return responses.default[Math.floor(Math.random() * responses.default.length)];
};

export const generateNoticeContent = async (topic: string, tone: string = 'Professional'): Promise<string> => {
  const templates = {
    Professional: `NOTICE\n\nSubject: ${topic}\n\nThis is to inform all students and faculty regarding ${topic}. Please take note of the important information provided above.\n\nFor further details, contact the administration office.\n\nAdministration\nZenithEdu`,
    Casual: `Hey Everyone!\n\nQuick update about ${topic} - make sure you're aware of this!\n\nIf you have questions, just ask the admin team.\n\nCheers,\nZenithEdu Team`,
    Urgent: `URGENT NOTICE\n\nAttention: ${topic}\n\nThis requires immediate action from all concerned. Please respond promptly.\n\nContact: Administration Office\n\nZenithEdu`
  };
  
  return templates[tone as keyof typeof templates] || templates.Professional;
};

export const getAIAnalyticsInsight = async (dataContext: string): Promise<string> => {
  const insights = [
    "Student attendance has improved by 15% this month. Keep up the good work!",
    "Fee collection is on track with 85% of students having paid their dues.",
    "Library usage has increased significantly this semester. Great to see students reading more!",
    "Transport services are running efficiently with minimal delays reported.",
    "Academic performance shows positive trends across most departments.",
    "Course enrollment numbers are higher than expected this semester.",
    "Student satisfaction scores have improved compared to last year.",
    "Hostel occupancy rates are at optimal levels with positive feedback.",
    "Examination results show improvement in core subject areas.",
    "Faculty engagement metrics indicate strong teaching performance."
  ];
  
  return insights[Math.floor(Math.random() * insights.length)];
};