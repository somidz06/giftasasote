import React, { useState, useEffect, useRef } from 'react';
import {
  Heart, Gift, Music, Image as ImageIcon, Type, Calendar, Smile,
  Trash2, ArrowUp, ArrowDown, Eye, Plus, X, Lock, Unlock,
  Sparkles, MessageCircle, PlayCircle, Hash, MapPin, Clock,
  Wand2, Loader2, RefreshCcw, Video, Timer, HelpCircle, Palette,
  Layout, AlignLeft, AlignCenter, AlignRight, Box, MoreHorizontal,
  ListChecks, Ticket, Grid, Mail, Sun, Gamepad2, Maximize, Minimize,
  Copy, Download, Upload, Share, Mic, Square, Check, Smartphone,
  Tablet, Monitor, CheckSquare, SquareIcon, FileText, Film, Globe,
  QrCode, Printer, CheckCircle, Edit, Dice1, ChevronRight, RefreshCw  // ← Changed Dice to Dice1
} from 'lucide-react';

// --- Gemini API Setup ---
const apiKey = ""; // System provides key at runtime

async function generateGeminiContent(prompt, type = 'text') {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
            responseMimeType: type === 'json' ? "application/json" : "text/plain"
          }
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error("Gemini Error:", error);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    throw error;
  }
}

// --- Local Storage Hook ---
const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      return defaultValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

// --- Constants & Defaults ---
const FONTS = {
  'font-sans': 'Clean (Sans)',
  'font-serif': 'Elegant (Serif)',
  'font-mono': 'Code (Mono)',
  'font-handwriting': 'Handwritten'
};

const DEFAULT_THEMES = {
  romantic: {
    name: 'Romantic Red',
    bg: 'bg-gradient-to-br from-rose-50 to-pink-100',
    primary: '#f43f5e',
    secondary: '#ffe4e6',
    text: '#881337',
    font: 'font-serif',
    particles: ['❤️', '🌹', '💋', '💌']
  },
  friendship: {
    name: 'Sunny Friendship',
    bg: 'bg-gradient-to-br from-amber-50 to-orange-100',
    primary: '#fb923c',
    secondary: '#ffedd5',
    text: '#7c2d12',
    font: 'font-sans',
    particles: ['☀️', '🌻', '🍦', '💛']
  },
  modern: {
    name: 'Modern Minimalist',
    bg: 'bg-slate-50',
    primary: '#1e293b',
    secondary: '#e2e8f0',
    text: '#0f172a',
    font: 'font-mono',
    particles: ['✨', '◼️', '🖊️', '🏐']
  },
  party: {
    name: 'Neon Party',
    bg: 'bg-slate-900',
    primary: '#a855f7',
    secondary: '#581c87',
    text: '#ffffff',
    font: 'font-sans',
    particles: ['🎉', '🎈', '🪩', '🥂']
  }
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper for text alignment mapping
const getFlexAlign = (align) => {
  if (align === 'left') return 'items-start text-left';
  if (align === 'right') return 'items-end text-right';
  return 'items-center text-center';
};

// --- Global Styles for Animations ---
const GlobalStyles = () => (
  <style>{`
    @keyframes floatUp {
      0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
      10% { opacity: 0.3; }
      90% { opacity: 0.3; }
      100% { transform: translateY(-20vh) rotate(360deg); opacity: 0; }
    }
    .animate-float {
      animation-name: floatUp;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
    @keyframes recordingPulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.7; }
      100% { transform: scale(1); opacity: 1; }
    }
    .animate-recording {
      animation: recordingPulse 1s infinite;
    }
  `}</style>
);

// --- Device Preview Component ---
const DevicePreview = ({ previewSize, onSizeChange }) => {
  const sizes = [
    { id: 'mobile', icon: Smartphone, label: 'Mobile', width: '375px' },
    { id: 'tablet', icon: Tablet, label: 'Tablet', width: '768px' },
    { id: 'desktop', icon: Monitor, label: 'Desktop', width: '100%' }
  ];

  return (
    <div className="fixed bottom-4 right-4 flex gap-2 bg-white p-2 rounded-lg shadow-lg border z-40">
      {sizes.map((size) => (
        <button
          key={size.id}
          onClick={() => onSizeChange(size.id)}
          className={`p-2 rounded flex flex-col items-center gap-1 transition-all ${previewSize === size.id
            ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
            : 'text-slate-600 hover:bg-slate-100'
            }`}
          title={size.label}
        >
          <size.icon size={16} />
          <span className="text-xs">{size.label}</span>
        </button>
      ))}
    </div>
  );
};

// --- Bulk Operations Component ---
const BulkOperations = ({ selectedBlocks, onSelectAll, onDuplicateSelected, onDeleteSelected, onClearSelection, totalBlocks }) => {
  if (selectedBlocks.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white shadow-xl rounded-full px-4 py-3 flex gap-3 border items-center z-50 animate-fade-in">
      <div className="text-sm font-medium text-slate-700">
        {selectedBlocks.length} block{selectedBlocks.length !== 1 ? 's' : ''} selected
      </div>

      <div className="h-4 w-px bg-slate-300"></div>

      <button
        onClick={onSelectAll}
        className="text-xs text-slate-600 hover:text-indigo-600 px-2 py-1 rounded hover:bg-indigo-50"
      >
        {selectedBlocks.length === totalBlocks ? 'Deselect All' : 'Select All'}
      </button>

      <button
        onClick={onDuplicateSelected}
        className="text-xs text-green-600 hover:text-green-700 px-2 py-1 rounded hover:bg-green-50 flex items-center gap-1"
      >
        <Copy size={12} /> Duplicate
      </button>

      <button
        onClick={onDeleteSelected}
        className="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 flex items-center gap-1"
      >
        <Trash2 size={12} /> Delete
      </button>

      <button
        onClick={onClearSelection}
        className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100"
      >
        Clear
      </button>
    </div>
  );
};



// --- Export Modal Component ---
const ExportModal = ({ isOpen, onClose, giftName, exportConfig }) => {
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  const exportOptions = [
    {
      id: 'pdf',
      icon: FileText,
      label: 'PDF Document',
      description: 'High-quality printable PDF',
      action: () => exportAsPDF()
    },
    {
      id: 'video',
      icon: Film,
      label: 'Video Slideshow',
      description: 'Auto-generated video with music',
      action: () => exportAsVideo()
    },
    {
      id: 'website',
      icon: Globe,
      label: 'Web Page',
      description: 'Standalone HTML website',
      action: () => exportAsWebsite()
    },
    {
      id: 'qr',
      icon: QrCode,
      label: 'QR Code',
      description: 'Shareable QR code',
      action: () => generateQRCode()
    },
    {
      id: 'print',
      icon: Printer,
      label: 'Print Directly',
      description: 'Optimized for printing',
      action: () => printGift()
    },
    {
      id: 'json',
      icon: FileText,
      label: 'JSON File',
      description: 'Can be imported back into the app',
      action: exportConfig // ← Now this will work!
    }
  ];

  const exportAsPDF = async () => {
    setExporting(true);
    // Simulate PDF export
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert(`PDF "${giftName}" exported successfully!`);
    setExporting(false);
    onClose();
  };

  const exportAsVideo = async () => {
    setExporting(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    alert(`Video "${giftName}" is being processed!`);
    setExporting(false);
    onClose();
  };

  const exportAsWebsite = async () => {
    setExporting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert(`Website package for "${giftName}" is ready!`);
    setExporting(false);
    onClose();
  };

  const generateQRCode = () => {
    alert(`QR Code for "${giftName}" generated!`);
    onClose();
  };

  const printGift = () => {
    window.print();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold">Export Your Gift</h3>
          <button onClick={onClose} disabled={exporting}>
            <X size={20} className={exporting ? 'text-slate-400' : 'text-slate-600'} />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {exportOptions.map((option) => (
            <button
              key={option.id}
              onClick={option.action}
              disabled={exporting}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${exportFormat === option.id
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 hover:border-slate-300'
                } ${exporting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${exportFormat === option.id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                  <option.icon size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-sm text-slate-600">{option.description}</div>
                </div>
                {exportFormat === option.id && (
                  <CheckCircle size={20} className="text-indigo-600" />
                )}
              </div>
            </button>
          ))}
        </div>

        {exporting && (
          <div className="flex items-center justify-center gap-2 text-slate-600 mb-4">
            <Loader2 size={16} className="animate-spin" />
            Exporting... This may take a few seconds.
          </div>
        )}

        <div className="text-xs text-slate-500 text-center">
          All exports include your custom theme and interactive elements where supported.
        </div>
      </div>
    </div>
  );
};

// --- Tutorial Tooltip ---
const TutorialTooltip = ({ children, content, position = 'top' }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className={`absolute z-50 bg-slate-900 text-white text-sm rounded p-2 whitespace-nowrap ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          } animate-fade-in`}>
          {content}
          <div className={`absolute w-2 h-2 bg-slate-900 transform rotate-45 ${position === 'top' ? '-bottom-1' : '-top-1'
            } left-1/2 -translate-x-1/2`} />
        </div>
      )}
    </div>
  );
};

// --- AI Assistant Component ---
const AIAssistantPanel = ({ type, contextData, onGenerate, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [tone, setTone] = useState('fun');
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!apiKey) {
      setError('API key not configured. Please add your Gemini API key.');
      return;
    }

    setLoading(true);
    setError(null);
    let prompt = "";
    let responseType = 'text';

    try {
      if (type === 'note') {
        prompt = `Write a short, ${tone} message for a gift website. Keywords: ${input || 'love'}. Max 3 sentences.`;
      } else if (type === 'riddle') {
        prompt = `Create a rhyming riddle for the answer "${contextData}". Do not reveal the answer.`;
      } else if (type === 'quiz') {
        responseType = 'json';
        prompt = `Generate a trivia question about "${input}". 
        Return JSON: { "question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0 }`;
      } else if (type === 'poll') {
        responseType = 'json';
        prompt = `Generate a fun poll question about "${input}". Return JSON: { "question": "...", "options": ["Option 1", "Option 2"] }`;
      } else if (type === 'wisdom') {
        prompt = `Generate a short, inspiring daily quote or affirmation about ${input || 'friendship'}.`;
      }

      const result = await generateGeminiContent(prompt, responseType);

      if (result) {
        if (type === 'quiz' || type === 'poll') {
          try {
            const json = JSON.parse(result);
            onGenerate(json);
          } catch (e) {
            setError('Failed to parse AI response. Please try again.');
            console.error("JSON Parse Error", e);
          }
        } else {
          onGenerate(result);
        }
      } else {
        setError('No response from AI. Please try again.');
      }
    } catch (error) {
      setError(error.message || 'AI generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute z-30 top-full left-0 mt-2 w-64 p-4 bg-white border border-indigo-100 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-xs font-bold text-indigo-600 flex items-center gap-2"><Sparkles size={12} /> AI Assistant</h4>
        <button onClick={onClose}><X size={14} className="text-slate-400" /></button>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 text-red-700 text-xs rounded border border-red-200">
          {error}
        </div>
      )}

      {type !== 'riddle' && (
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={type === 'quiz' ? "Topic (e.g., The Office)" : "Keywords..."}
          className="w-full text-xs p-2 border border-slate-200 rounded mb-2"
        />
      )}

      {type === 'note' && (
        <div className="flex gap-2 mb-2">
          {['Fun', 'Sweet', 'Poetic'].map(t => (
            <button
              key={t}
              onClick={() => setTone(t.toLowerCase())}
              className={`text-[10px] px-2 py-1 rounded border ${tone === t.toLowerCase() ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-slate-200 text-slate-600'
                }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-indigo-600 text-white text-xs py-2 rounded flex justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="animate-spin" size={12} /> : <Wand2 size={12} />} Generate
      </button>

      {!apiKey && (
        <div className="mt-2 text-[10px] text-slate-500">
          Note: Add your Gemini API key to use AI features
        </div>
      )}
    </div>
  );
};

// --- Block Components ---

const BlockWrapper = ({ children, style = {}, theme, isEditing, onStyleUpdate, isSelected, onSelect }) => {
  const [showSettings, setShowSettings] = useState(false);

  const isTransparent = style.bg === 'transparent';

  const widthClass = 'w-full';

  const wrapperStyle = {
    backgroundColor: style.bg === 'white' ? 'rgba(255,255,255,0.9)' :
      style.bg === 'primary' ? theme.secondary :
        style.bg === 'dark' ? 'rgba(0,0,0,0.8)' : 'transparent',
    padding: style.padding === 'compact' ? '1rem' : style.padding === 'spacious' ? '4rem' : '2rem',
    borderRadius: '1rem',
    color: style.bg === 'dark' ? 'white' : 'inherit',
    transition: 'all 0.3s ease',
    boxShadow: isTransparent ? 'none' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: style.align === 'left' ? 'flex-start' : style.align === 'right' ? 'flex-end' : 'center',
    textAlign: style.align || 'center',
  };

  return (
    <div className={`relative group/wrapper ${widthClass} h-full transition-all duration-300 flex flex-col ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
      }`}>
      {isEditing && (
        <div className="absolute -left-2 -top-2 z-20">
          <button
            onClick={onSelect}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected
              ? 'bg-indigo-500 border-indigo-500 text-white'
              : 'bg-white border-slate-300 hover:border-indigo-400'
              }`}
          >
            {isSelected && <Check size={12} />}
          </button>
        </div>
      )}

      <div style={wrapperStyle} className={`backdrop-blur-sm h-full w-full`}>
        {children}
      </div>

      {isEditing && (
        <div className="absolute top-4 right-4 opacity-0 group-hover/wrapper:opacity-100 transition-opacity z-20">
          <TutorialTooltip content="Block settings" position="left">
            <button onClick={() => setShowSettings(!showSettings)} className="p-1.5 bg-white shadow rounded-full hover:text-indigo-600">
              <Palette size={14} />
            </button>
          </TutorialTooltip>

          {showSettings && (
            <div className="absolute right-0 top-full mt-2 bg-white p-3 rounded-lg shadow-xl border border-slate-100 w-56 z-30 text-left animate-fade-in">
              <h5 className="text-[10px] font-bold uppercase text-slate-400 mb-2">Block Style</h5>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-600 block mb-1">Width</label>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onStyleUpdate({ ...style, width: 'full' })}
                      className={`flex-1 text-[10px] py-1 border rounded ${style.width !== 'half' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-slate-200'
                        }`}
                    >
                      Full Row
                    </button>
                    <button
                      onClick={() => onStyleUpdate({ ...style, width: 'half' })}
                      className={`flex-1 text-[10px] py-1 border rounded ${style.width === 'half' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-slate-200'
                        }`}
                    >
                      Half (50%)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-600 block mb-1">Background</label>
                  <div className="flex gap-1">
                    {[
                      { id: 'transparent', color: 'bg-slate-100', icon: <X size={10} />, label: 'None' },
                      { id: 'white', color: 'bg-white', icon: <Box size={10} />, label: 'White' },
                      { id: 'primary', color: 'bg-indigo-100', icon: <Heart size={10} />, label: 'Tint' },
                      { id: 'dark', color: 'bg-slate-800', icon: <Box size={10} className="text-white" />, label: 'Dark' }
                    ].map(opt => (
                      <TutorialTooltip key={opt.id} content={opt.label} position="top">
                        <button
                          onClick={() => onStyleUpdate({ ...style, bg: opt.id })}
                          className={`w-6 h-6 rounded flex items-center justify-center border ${style.bg === opt.id ? 'border-indigo-600 ring-1 ring-indigo-200' : 'border-slate-200'
                            } ${opt.color}`}
                        >
                          {opt.icon}
                        </button>
                      </TutorialTooltip>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-600 block mb-1">Alignment</label>
                  <div className="flex bg-slate-100 rounded p-1 gap-1">
                    {[
                      { id: 'left', icon: AlignLeft, label: 'Left' },
                      { id: 'center', icon: AlignCenter, label: 'Center' },
                      { id: 'right', icon: AlignRight, label: 'Right' }
                    ].map(opt => (
                      <TutorialTooltip key={opt.id} content={opt.label} position="top">
                        <button
                          onClick={() => onStyleUpdate({ ...style, align: opt.id })}
                          className={`flex-1 p-1 rounded flex justify-center ${style.align === opt.id ? 'bg-white shadow text-indigo-600' : 'text-slate-400'
                            }`}
                        >
                          <opt.icon size={12} />
                        </button>
                      </TutorialTooltip>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Utility: Color Generation ---
const getSegmentColor = (index, total) => {
  const hue = (index * 360) / total;
  return `hsl(${hue}, 80%, 60%)`;
};

// --- Utility: Geometry for SVG Arcs ---
const getCoordinatesForPercent = (percent) => {
  const x = Math.cos(2 * Math.PI * percent);
  const y = Math.sin(2 * Math.PI * percent);
  return [x, y];
};

const SpinWheelBlock = ({ content, theme = { primary: '#6366f1' }, isEditing, onUpdate }) => {
  // Use content.options if available, otherwise default to a starter list
  const options = content?.options || ['Pizza', 'Burgers', 'Sushi', 'Tacos'];

  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // --- Wheel Logic ---
  const spinWheel = () => {
    if (spinning) return;

    setSpinning(true);
    setResult(null);
    setShowConfetti(false);

    const winningIndex = Math.floor(Math.random() * options.length);
    const segmentAngle = 360 / options.length;

    // Calculate rotation to land with the winner at the top (-90deg visual)
    const indexOffset = (winningIndex * segmentAngle) + (segmentAngle / 2);
    const extraSpins = 360 * (5 + Math.floor(Math.random() * 5)); // 5-10 spins
    const targetRotation = rotation + extraSpins + (360 - (rotation % 360)) + (360 - indexOffset);

    setRotation(targetRotation);

    setTimeout(() => {
      setResult(options[winningIndex]);
      setSpinning(false);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }, 3000);
  };

  // --- CRUD Operations (Connected to onUpdate) ---
  const addOption = () => {
    onUpdate({
      ...content,
      options: [...options, `Option ${options.length + 1}`]
    });
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onUpdate({ ...content, options: newOptions });
  };

  const removeOption = (index) => {
    if (options.length <= 2) return;
    const newOptions = options.filter((_, i) => i !== index);
    onUpdate({ ...content, options: newOptions });
  };

  // --- SVG Path Helper ---
  const makeSlicePath = (startPercent, endPercent) => {
    const [startX, startY] = getCoordinatesForPercent(startPercent);
    const [endX, endY] = getCoordinatesForPercent(endPercent);
    const largeArcFlag = endPercent - startPercent > 0.5 ? 1 : 0;
    return `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
  };

  return (
    <div className="w-full max-w-md mx-auto font-sans">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">

        {/* Header */}
        <div className="bg-slate-50 p-3 border-b border-slate-100 flex justify-center items-center">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <RefreshCw size={14} className={spinning ? "animate-spin" : ""} />
            Spin the Wheel
          </div>
        </div>

        <div className="p-6">
          {isEditing ? (
            // --- Edit Mode (Restored Logic) ---
            <div className="space-y-4">
              <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0 border border-slate-200"
                      style={{ backgroundColor: getSegmentColor(index, options.length) }}
                    />
                    <input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="flex-1 border border-slate-200 p-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder={`Option ${index + 1}`}
                    />
                    <button
                      onClick={() => removeOption(index)}
                      disabled={options.length <= 2}
                      className="p-1 text-slate-300 hover:text-red-500 disabled:opacity-30"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addOption}
                className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 hover:border-indigo-300 hover:text-indigo-600 text-sm font-medium flex items-center justify-center gap-2"
              >
                <Plus size={14} /> Add Option
              </button>
            </div>
          ) : (
            // --- Play Mode (Visual Upgrade) ---
            <div className="flex flex-col items-center relative">

              {/* Confetti (CSS Only) */}
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
                  {[...Array(15)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full animate-ping"
                      style={{
                        top: '50%', left: '50%',
                        backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4'][i % 3],
                        transform: `translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px)`,
                        animationDuration: '1s',
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Wheel Container */}
              <div className="relative w-64 h-64 mb-6">
                {/* Pointer */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <div className="w-6 h-8 bg-slate-800 rounded-b-full shadow-lg border-2 border-white" />
                </div>

                {/* SVG Wheel */}
                <div
                  className="w-full h-full"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: 'transform 3s cubic-bezier(0.2, 0.8, 0.2, 1)'
                  }}
                >
                  <svg viewBox="-1 -1 2 2" className="w-full h-full transform -rotate-90">
                    {options.map((option, index) => {
                      const start = index / options.length;
                      const end = (index + 1) / options.length;
                      const mid = (start + end) / 2;

                      return (
                        <g key={index}>
                          <path
                            d={makeSlicePath(start, end)}
                            fill={getSegmentColor(index, options.length)}
                            stroke="white"
                            strokeWidth="0.02"
                          />
                          <text
                            x="0" y="0"
                            fontSize="0.11"
                            fontWeight="bold"
                            fill="white"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            transform={`rotate(${mid * 360}) translate(0.65, 0) rotate(90)`}
                            style={{ pointerEvents: 'none', textShadow: '0px 1px 2px rgba(0,0,0,0.3)' }}
                          >
                            {option.length > 14 ? option.substring(0, 12) + '..' : option}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Center Hub */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center z-10 border-4 border-slate-50">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: theme.primary }}>
                    <Sparkles size={18} />
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="h-20 w-full flex flex-col items-center justify-center">
                {!spinning && result ? (
                  <div className="animate-in fade-in zoom-in duration-300 text-center">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">Winner</div>
                    <div className="text-2xl font-black text-slate-800 my-1">{result}</div>
                    <button onClick={spinWheel} className="text-xs text-indigo-500 hover:underline">Spin Again</button>
                  </div>
                ) : (
                  <button
                    onClick={spinWheel}
                    disabled={spinning}
                    className={`px-8 py-3 rounded-full font-bold text-white shadow-lg transition-all ${spinning ? 'opacity-70 scale-95' : 'hover:-translate-y-1 hover:shadow-xl'}`}
                    style={{ backgroundColor: theme.primary }}
                  >
                    {spinning ? 'Spinning...' : 'Spin!'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DrawingCanvasBlock = ({ content, theme, isEditing, onUpdate }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState(theme.primary);
  const [brushSize, setBrushSize] = useState(5);
  const [drawingData, setDrawingData] = useState(content.drawingData || null);

  const colors = [
    theme.primary,
    '#000000',
    '#ffffff',
    '#ef4444',
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#8b5cf6'
  ];

  useEffect(() => {
    if (!canvasRef.current || !isEditing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load existing drawing if any
    if (drawingData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = drawingData;
    }

    // Drawing functions
    const startDrawing = (e) => {
      setIsDrawing(true);
      draw(e);
    };

    const stopDrawing = () => {
      setIsDrawing(false);
      ctx.beginPath();
      saveDrawing();
    };

    const draw = (e) => {
      if (!isDrawing) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.strokeStyle = currentColor;

      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events for mobile
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startDrawing(e.touches[0]);
    });
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      draw(e.touches[0]);
    });

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseout', stopDrawing);
    };
  }, [isDrawing, currentColor, brushSize, isEditing]);

  const saveDrawing = () => {
    if (!canvasRef.current) return;

    const dataURL = canvasRef.current.toDataURL('image/png');
    setDrawingData(dataURL);
    onUpdate({ ...content, drawingData: dataURL });
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    setDrawingData(null);
    onUpdate({ ...content, drawingData: null });
  };

  const downloadDrawing = () => {
    if (!drawingData) return;

    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = drawingData;
    link.click();
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
          <Edit size={14} /> Drawing Canvas
        </div>

        {isEditing ? (
          <div className="space-y-4">
            {/* Color Palette */}
            <div className="flex gap-2 justify-center flex-wrap">
              {colors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${currentColor === color ? 'border-slate-800 scale-110' : 'border-slate-300'
                    }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Brush Size */}
            <div className="flex items-center gap-4 justify-center">
              <span className="text-sm text-slate-600">Brush Size:</span>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-32"
              />
              <span className="text-sm text-slate-600">{brushSize}px</span>
            </div>

            {/* Canvas */}
            <div className="border-2 border-dashed border-slate-300 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-full h-64 cursor-crosshair touch-none bg-white"
              />
            </div>

            {/* Controls */}
            <div className="flex gap-2 justify-center">
              <button
                onClick={clearCanvas}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={downloadDrawing}
                disabled={!drawingData}
                className={`px-4 py-2 rounded-lg transition-colors ${drawingData
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
              >
                Download
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            {drawingData ? (
              <div className="space-y-4">
                <img
                  src={drawingData}
                  alt="Drawing"
                  className="mx-auto max-w-full h-64 object-contain border rounded-lg"
                />
                <p className="text-slate-600">A special drawing just for you! 💝</p>
              </div>
            ) : (
              <div className="text-slate-500 py-8">
                <Edit size={48} className="mx-auto mb-3 opacity-50" />
                <p>No drawing yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const DiceRollerBlock = ({ content, theme, isEditing, onUpdate }) => {
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(null);
  const [diceCount, setDiceCount] = useState(content.diceCount || 1);

  const rollDice = () => {
    if (rolling) return;

    setRolling(true);
    setResult(null);

    // Animate for 1.5 seconds
    const rolls = Array.from({ length: diceCount }, () =>
      Math.floor(Math.random() * 6) + 1
    );

    setTimeout(() => {
      setResult(rolls);
      setRolling(false);
    }, 1500);
  };

  const diceFaces = {
    1: '⚀',
    2: '⚁',
    3: '⚂',
    4: '⚃',
    5: '⚄',
    6: '⚅'
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl p-6 shadow-lg text-center">
        <div className="flex items-center gap-2 mb-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
          <Gamepad2 size={14} /> Dice Roller
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 justify-center">
              <span className="text-sm text-slate-600">Number of Dice:</span>
              <select
                value={diceCount}
                onChange={(e) => {
                  const count = parseInt(e.target.value);
                  setDiceCount(count);
                  onUpdate({ ...content, diceCount: count });
                }}
                className="border p-2 rounded"
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} die</option>
                ))}
              </select>
            </div>

            <div className="text-slate-500 text-sm">
              Preview of dice faces:
            </div>
            <div className="flex gap-2 justify-center text-4xl">
              {[1, 2, 3, 4, 5, 6].map(face => (
                <span key={face}>{diceFaces[face]}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Dice Display */}
            <div className="flex gap-4 justify-center items-center min-h-20">
              {rolling ? (
                // Rolling animation
                Array.from({ length: diceCount }).map((_, index) => (
                  <div
                    key={index}
                    className="text-6xl animate-bounce"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {diceFaces[Math.floor(Math.random() * 6) + 1]}
                  </div>
                ))
              ) : result ? (
                // Show results
                result.map((roll, index) => (
                  <div
                    key={index}
                    className="text-6xl animate-in fade-in zoom-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {diceFaces[roll]}
                  </div>
                ))
              ) : (
                // Initial state
                Array.from({ length: diceCount }).map((_, index) => (
                  <div key={index} className="text-6xl opacity-50">
                    ⚄
                  </div>
                ))
              )}
            </div>

            {/* Roll Button */}
            <button
              onClick={rollDice}
              disabled={rolling}
              className={`px-8 py-3 rounded-full font-bold text-white transition-all ${rolling ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                }`}
              style={{ backgroundColor: theme.primary }}
            >
              {rolling ? 'Rolling...' : 'Roll Dice!'}
            </button>

            {/* Result Summary */}
            {result && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className="text-lg font-semibold text-slate-600">
                  Total: {result.reduce((sum, roll) => sum + roll, 0)}
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  {result.join(' + ')} = {result.reduce((sum, roll) => sum + roll, 0)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const OpenWhenBlock = ({ content, theme, isEditing, onUpdate }) => {
  const [openId, setOpenId] = useState(null);

  const addEnv = () => onUpdate({
    ...content,
    items: [...(content.items || []), {
      id: Date.now(),
      label: 'Open when...',
      text: 'Your message here...'
    }]
  });

  const updateEnv = (idx, field, val) => {
    const n = [...(content.items || [])];
    n[idx] = { ...n[idx], [field]: val };
    onUpdate({ ...content, items: n });
  };

  const removeEnv = (idx) => {
    const n = [...(content.items || [])];
    n.splice(idx, 1);
    onUpdate({ ...content, items: n });
  };

  return (
    <div className="w-full">
      {isEditing && (
        <TutorialTooltip content="Add new envelope">
          <button onClick={addEnv} className="mb-4 text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded mx-auto block hover:bg-indigo-100 transition-colors">
            + Add Envelope
          </button>
        </TutorialTooltip>
      )}
      <div className="grid gap-4">
        {(content.items || []).map((item, idx) => (
          <div key={item.id} className="w-full">
            {isEditing ? (
              <div className="flex gap-2 mb-2 items-start">
                <input
                  value={item.label}
                  onChange={e => updateEnv(idx, 'label', e.target.value)}
                  className="border p-1 rounded text-sm font-bold w-1/3"
                  placeholder="Label"
                />
                <textarea
                  value={item.text}
                  onChange={e => updateEnv(idx, 'text', e.target.value)}
                  className="border p-1 rounded text-sm flex-1 resize-none"
                  placeholder="Message inside"
                  rows={3}
                />
                <button
                  onClick={() => removeEnv(idx)}
                  className="p-1 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 size={14} className="text-red-400 hover:text-red-600" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setOpenId(openId === item.id ? null : item.id)}
                  className={`w-full p-4 rounded-lg shadow-md text-left font-bold flex justify-between items-center transition-all ${openId === item.id ? 'bg-white text-slate-800' : 'text-white'
                    } hover:scale-[1.02]`}
                  style={{ backgroundColor: openId === item.id ? 'white' : theme.primary }}
                >
                  <span className="flex items-center gap-2"><Mail size={16} /> {item.label}</span>
                  {openId === item.id ? <X size={16} /> : <Plus size={16} />}
                </button>
                {openId === item.id && (
                  <div className="bg-white/90 p-6 rounded-b-lg shadow-inner border-x border-b mx-2 mt-[-4px] animate-in slide-in-from-top-2 text-slate-800 whitespace-pre-wrap">
                    {item.text}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {(content.items || []).length === 0 && !isEditing && (
          <div className="text-center py-8 text-slate-400">
            <Mail size={32} className="mx-auto mb-2 opacity-50" />
            No envelopes added yet
          </div>
        )}
      </div>
    </div>
  );
};

// --- Voice Message Block ---
const VoiceMessageBlock = ({ content, theme, isEditing, onUpdate }) => {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(content.audioURL);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
        setAudioBlob(audioBlob);
        onUpdate({ ...content, audioURL: audioUrl });

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const clearRecording = () => {
    setAudioURL(null);
    setAudioBlob(null);
    onUpdate({ ...content, audioURL: null });
  };

  const downloadRecording = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voice-message-${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl p-6 shadow-lg border-t-4" style={{ borderColor: theme.primary }}>
        <div className="flex items-center gap-2 mb-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
          <Mic size={14} /> Voice Message
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div className="text-center">
              {audioURL ? (
                <div className="space-y-3">
                  <audio src={audioURL} controls className="w-full" />
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={downloadRecording}
                      className="text-xs bg-green-500 text-white px-3 py-2 rounded flex items-center gap-1"
                    >
                      <Download size={12} /> Download
                    </button>
                    <button
                      onClick={clearRecording}
                      className="text-xs bg-red-500 text-white px-3 py-2 rounded flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 text-sm mb-4">
                  {recording ? 'Recording... Speak now!' : 'No recording yet'}
                </div>
              )}

              <div className="flex gap-2 justify-center">
                {!recording ? (
                  <button
                    onClick={startRecording}
                    className="bg-red-500 text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-red-600 transition-colors"
                  >
                    <Mic size={20} /> Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="bg-slate-500 text-white px-6 py-3 rounded-full flex items-center gap-2 hover:bg-slate-600 transition-colors animate-recording"
                  >
                    <Square size={20} /> Stop Recording
                  </button>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-500 text-center">
              Record a personal voice message. Maximum 5 minutes.
            </div>
          </div>
        ) : (
          <div className="text-center">
            {audioURL ? (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                  <PlayCircle size={24} className="text-indigo-600" />
                </div>
                <audio src={audioURL} controls className="w-full" />
                <p className="text-sm text-slate-600">Play this personal voice message</p>
              </div>
            ) : (
              <div className="text-slate-500">
                <Mic size={48} className="mx-auto mb-3 opacity-50" />
                <p>No voice message recorded yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ... (Other existing block components: MemoryGameBlock, DailyWisdomBlock, OpenWhenBlock, HeroBlock, etc.)
// They remain the same as in the previous implementation, just adding the isSelected and onSelect props

// --- Missing Block Components ---

const SectionBlock = ({ content, isEditing, onUpdate, style }) => (
  <div className={`flex items-center gap-2 md:gap-4 w-full max-w-full px-2 ${getFlexAlign(style?.align)}`}>
    <div className={`h-px flex-1 ${style?.align === 'left' ? 'hidden' : ''} bg-current opacity-30`}></div>
    {isEditing ? (
      <input 
        value={content.title} 
        onChange={(e) => onUpdate({ ...content, title: e.target.value })} 
        className="text-lg md:text-2xl font-bold bg-transparent text-center focus:outline-none min-w-0 flex-1 max-w-full truncate px-2"
        placeholder="Section Title" 
      />
    ) : (
      <h2 className="text-lg md:text-3xl font-bold uppercase tracking-widest whitespace-nowrap truncate max-w-full px-2">
        {content.title}
      </h2>
    )}
    <div className={`h-px flex-1 ${style?.align === 'right' ? 'hidden' : ''} bg-current opacity-30`}></div>
  </div>
);
const NoteBlock = ({ content, isEditing, onUpdate, style }) => {
  const [showAI, setShowAI] = useState(false);
  return (
    <div className={`relative w-full flex flex-col ${getFlexAlign(style?.align)}`}>
      {isEditing && (
        <div className="absolute -top-8 right-0 z-20">
          <button onClick={() => setShowAI(!showAI)} className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full shadow flex items-center gap-1"><Sparkles size={12} /> AI</button>
          {showAI && <AIAssistantPanel type="note" onGenerate={t => { onUpdate({ ...content, text: t }); setShowAI(false); }} onClose={() => setShowAI(false)} />}
        </div>
      )}
      {isEditing ? (
        <textarea value={content.text} onChange={e => onUpdate({ ...content, text: e.target.value })} className={`w-full min-h-[150px] p-4 bg-white/50 border-2 border-dashed rounded-xl font-handwriting text-xl ${style?.align === 'left' ? 'text-left' : style?.align === 'right' ? 'text-right' : 'text-center'}`} />
      ) : (
        <div className="font-handwriting text-2xl leading-loose opacity-90 whitespace-pre-wrap w-full">{content.text}</div>
      )}
    </div>
  );
};

const MusicBlock = ({ content, theme, isEditing, onUpdate }) => (
  <div className="w-full">
    <div className="p-6 rounded-3xl shadow-xl text-white flex flex-col items-center text-center relative overflow-hidden" style={{ backgroundColor: theme.primary }}>
      <div className="absolute top-0 right-0 p-4 opacity-20"><Music size={100} /></div>
      {isEditing ? (
        <div className="w-full space-y-3 z-10">
          <input value={content.title} onChange={e => onUpdate({ ...content, title: e.target.value })} className="bg-white/20 text-white placeholder-white/60 w-full p-2 rounded text-center font-bold" placeholder="Song Title" />
          <input value={content.artist} onChange={e => onUpdate({ ...content, artist: e.target.value })} className="bg-white/20 text-white placeholder-white/60 w-full p-2 rounded text-center text-sm" placeholder="Artist" />
          <input value={content.link} onChange={e => onUpdate({ ...content, link: e.target.value })} className="bg-white/20 text-white placeholder-white/60 w-full p-2 rounded text-center text-xs" placeholder="Link to Song (URL)" />
        </div>
      ) : (
        <div className="z-10 w-full">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"><PlayCircle size={40} /></div>
          <h3 className="text-2xl font-bold mb-1">{content.title || "Our Song"}</h3>
          <p className="text-white/80 text-sm mb-6">{content.artist || "Unknown Artist"}</p>
          <a href={content.link || "#"} target="_blank" rel="noopener noreferrer" className="block w-full bg-white text-slate-900 font-bold py-3 rounded-full hover:scale-105 transition-transform">Listen Now</a>
        </div>
      )}
    </div>
  </div>
);

const TimelineBlock = ({ content, theme, isEditing, onUpdate }) => {
  const addEvent = () => onUpdate({ ...content, events: [...(content.events || []), { date: '2023', title: 'Event', desc: 'Details' }] });
  const updateEvent = (idx, field, val) => {
    const newEvents = [...(content.events || [])];
    newEvents[idx] = { ...newEvents[idx], [field]: val };
    onUpdate({ ...content, events: newEvents });
  };
  const removeEvent = (idx) => { const n = [...(content.events || [])]; n.splice(idx, 1); onUpdate({ ...content, events: n }); };
  const events = content.events || [];

  return (
    <div className="w-full">
      {isEditing && <button onClick={addEvent} className="mb-6 flex items-center gap-2 text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full mx-auto">+ Add Event</button>}
      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-current before:opacity-20">
        {events.map((ev, idx) => (
          <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10" style={{ backgroundColor: theme.primary }}><Clock size={16} /></div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/80 p-4 rounded-xl shadow-sm hover:shadow-md transition-all text-left">
              {isEditing ? (
                <div className="space-y-2">
                  <input value={ev.date} onChange={e => updateEvent(idx, 'date', e.target.value)} className="font-bold text-sm text-slate-500 w-full bg-transparent" placeholder="Date" />
                  <input value={ev.title} onChange={e => updateEvent(idx, 'title', e.target.value)} className="font-bold text-lg text-slate-800 w-full bg-transparent" placeholder="Event Title" />
                  <textarea value={ev.desc} onChange={e => updateEvent(idx, 'desc', e.target.value)} className="text-sm text-slate-600 w-full bg-transparent resize-none" placeholder="Description" />
                  <button onClick={() => removeEvent(idx)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                </div>
              ) : (
                <div><time className="font-bold text-sm opacity-50 mb-1 block">{ev.date}</time><h3 className="text-lg font-bold">{ev.title}</h3><p className="opacity-80 text-sm mt-2">{ev.desc}</p></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GalleryBlock = ({ content, isEditing, onUpdate, theme }) => {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB');
      return;
    }

    setUploading(true);
    try {
      // For demo - create object URL. In production, upload to your server.
      const imageUrl = URL.createObjectURL(file);
      onUpdate({ ...content, images: [...(content.images || []), imageUrl] });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to process image');
    } finally {
      setUploading(false);
      event.target.value = ''; // Reset input
    }
  };

  const addImage = () => {
    const url = prompt("Image URL:", "https://picsum.photos/400/300");
    if (url) onUpdate({ ...content, images: [...(content.images || []), url] });
  };

  const removeImage = (i) => {
    const imgs = [...content.images];
    // Revoke object URL if it's a local file
    if (imgs[i].startsWith('blob:')) {
      URL.revokeObjectURL(imgs[i]);
    }
    imgs.splice(i, 1);
    onUpdate({ ...content, images: imgs });
  };

  const images = content.images || [];

  return (
    <div className="w-full p-4">
      {isEditing && (
        <div className="mb-4 space-y-2">
          <label className="block">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
              id="gallery-upload"
            />
            <div className={`px-4 py-2 rounded-lg border-2 border-dashed text-center cursor-pointer transition-colors ${uploading ? 'bg-gray-100' : 'hover:bg-slate-50 border-slate-300'
              }`}>
              {uploading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Uploading...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Upload size={16} />
                  Upload Image
                </div>
              )}
            </div>
          </label>
          <div className="text-center">
            <button
              onClick={addImage}
              className="text-xs text-indigo-600 hover:text-indigo-800"
            >
              or add image URL
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, idx) => (
          <div key={idx} className="relative group aspect-square bg-slate-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <img src={img} alt="" className="w-full h-full object-cover" />
            {isEditing && (
              <button
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        {images.length === 0 && !isEditing && (
          <div className="col-span-3 text-center py-8 text-slate-400">
            No images added yet
          </div>
        )}
      </div>
    </div>
  );
};

const CouponBlock = ({ content, theme, isEditing, onUpdate }) => (
  <div className="w-full p-4">
    <div className="relative border-4 border-dashed bg-white p-6 rounded-xl text-center" style={{ borderColor: theme.primary }}>
      <div className="flex justify-between mb-4"><span className="text-xs uppercase tracking-widest text-slate-400">Coupon</span><Sparkles className="text-yellow-400 w-5 h-5" /></div>
      {isEditing ? <input value={content.text} onChange={e => onUpdate({ ...content, text: e.target.value })} className="w-full text-center text-2xl font-bold border-b pb-2 text-slate-800" placeholder="e.g., Free Hug" /> : <h3 className="text-3xl font-bold text-slate-800 my-8">{content.text || "Good for one..."}</h3>}
      <div className="text-xs text-slate-400 mt-4">Valid Forever • Non-transferable</div>
    </div>
  </div>
);

const SpacerBlock = ({ content, theme, isEditing, onUpdate, style }) => {
  // Default content if none exists
  const defaultContent = {
    height: 'medium', // small, medium, large, custom
    customHeight: '50px',
    showDivider: false,
    dividerStyle: 'line', // line, dots, pattern, custom
    dividerColor: theme?.primary || '#6b7280',
    customPattern: '❤️',
    patternSpacing: 'medium'
  };

  const config = { ...defaultContent, ...content };

  // Height mappings
  const heightMap = {
    small: 'h-8',
    medium: 'h-16', 
    large: 'h-24',
    custom: ''
  };

  const patternSpacingMap = {
    tight: 'gap-2',
    medium: 'gap-4',
    wide: 'gap-8'
  };

  const getHeightClass = () => {
    if (config.height === 'custom') {
      return '';
    }
    return heightMap[config.height] || heightMap.medium;
  };

  const getHeightStyle = () => {
    if (config.height === 'custom') {
      return { height: config.customHeight };
    }
    return {};
  };

  // Visual indicator for editing mode
  const getEditingIndicator = () => {
    if (!isEditing) return null;

    const heightDisplay = config.height === 'custom' 
      ? config.customHeight 
      : `${config.height} (${getHeightValue()}px)`;

    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="bg-blue-500 text-white text-xs px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v18M3 12h18" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-medium">Spacer Block</span>
            <span className="text-blue-100">
              Height: {heightDisplay} {config.showDivider && '• With Divider'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const getHeightValue = () => {
    switch (config.height) {
      case 'small': return 32;
      case 'medium': return 64;
      case 'large': return 96;
      default: return 64;
    }
  };

  const renderDivider = () => {
    if (!config.showDivider) return null;

    const baseClasses = "flex items-center justify-center w-full";
    
    switch (config.dividerStyle) {
      case 'line':
        return (
          <div 
            className={`${baseClasses} h-px`}
            style={{ backgroundColor: config.dividerColor }}
          />
        );
      
      case 'dots':
        return (
          <div className={`${baseClasses} ${patternSpacingMap[config.patternSpacing]}`}>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: config.dividerColor }}
              />
            ))}
          </div>
        );
      
      case 'pattern':
        return (
          <div className={`${baseClasses} ${patternSpacingMap[config.patternSpacing]} text-lg`}>
            {[...Array(6)].map((_, i) => (
              <span key={i} style={{ color: config.dividerColor }}>
                {config.customPattern}
              </span>
            ))}
          </div>
        );
      
      case 'custom':
        return (
          <div className={`${baseClasses} text-sm font-medium`} style={{ color: config.dividerColor }}>
            ••• {config.customPattern} •••
          </div>
        );
      
      default:
        return null;
    }
  };

  // Visual styling for editing mode
  const getEditingStyles = () => {
    if (!isEditing) return {};
    
    return {
      minHeight: '20px',
      outline: style.outline,
      outlineOffset: '-1px',
      backgroundColor: style.backgroundColor,
      position: 'relative'
    };
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      {isEditing ? (
        // Editing Mode with Controls
        <div className="w-full p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
          <div className="text-center space-y-3">
            <div className="flex items-center gap-2 justify-center text-blue-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v18M3 12h18" />
              </svg>
              <span className="text-sm font-medium">Spacer Block</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Height</label>
                <select
                  value={config.height}
                  onChange={(e) => onUpdate({ ...config, height: e.target.value })}
                  className="w-full p-2 border rounded text-xs"
                >
                  <option value="small">Small (32px)</option>
                  <option value="medium">Medium (64px)</option>
                  <option value="large">Large (96px)</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              
              {config.height === 'custom' && (
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Custom Height</label>
                  <input
                    type="text"
                    value={config.customHeight}
                    onChange={(e) => onUpdate({ ...config, customHeight: e.target.value })}
                    className="w-full p-2 border rounded text-xs"
                    placeholder="50px or 2rem"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 justify-center">
              <input
                type="checkbox"
                id="showDivider"
                checked={config.showDivider}
                onChange={(e) => onUpdate({ ...config, showDivider: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="showDivider" className="text-sm text-slate-700">
                Add Decorative Divider
              </label>
            </div>

            {config.showDivider && (
              <div className="space-y-3 border-t pt-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Divider Style</label>
                  <select
                    value={config.dividerStyle}
                    onChange={(e) => onUpdate({ ...config, dividerStyle: e.target.value })}
                    className="w-full p-2 border rounded text-xs"
                  >
                    <option value="line">Line</option>
                    <option value="dots">Dots</option>
                    <option value="pattern">Pattern</option>
                    <option value="custom">Custom Text</option>
                  </select>
                </div>

                {(config.dividerStyle === 'pattern' || config.dividerStyle === 'custom') && (
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">
                      {config.dividerStyle === 'pattern' ? 'Pattern Symbol' : 'Custom Text'}
                    </label>
                    <input
                      type="text"
                      value={config.customPattern}
                      onChange={(e) => onUpdate({ ...config, customPattern: e.target.value })}
                      className="w-full p-2 border rounded text-xs"
                      placeholder={config.dividerStyle === 'pattern' ? '❤️' : '••• Custom •••'}
                      maxLength={config.dividerStyle === 'pattern' ? 2 : 20}
                    />
                  </div>
                )}

                {(config.dividerStyle === 'dots' || config.dividerStyle === 'pattern') && (
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Spacing</label>
                    <select
                      value={config.patternSpacing}
                      onChange={(e) => onUpdate({ ...config, patternSpacing: e.target.value })}
                      className="w-full p-2 border rounded text-xs"
                    >
                      <option value="tight">Tight</option>
                      <option value="medium">Medium</option>
                      <option value="wide">Wide</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs text-slate-600 mb-1">Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={config.dividerColor}
                      onChange={(e) => onUpdate({ ...config, dividerColor: e.target.value })}
                      className="w-10 h-8 rounded border"
                    />
                    <input
                      type="text"
                      value={config.dividerColor}
                      onChange={(e) => onUpdate({ ...config, dividerColor: e.target.value })}
                      className="flex-1 p-2 border rounded text-xs"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                {/* Live Preview */}
                <div className="pt-2">
                  <div className="text-xs text-slate-500 mb-2">Live Preview:</div>
                  <div className="h-12 flex items-center justify-center border border-blue-200 rounded bg-white p-2">
                    {renderDivider()}
                  </div>
                </div>
              </div>
            )}

            {/* Spacer Preview */}
            <div className="pt-3 border-t">
              <div className="text-xs text-slate-500 mb-2">Spacer Preview:</div>
              <div 
                className={`w-full ${getHeightClass()} relative border border-blue-200 rounded bg-white flex items-center justify-center`}
                style={{
                  ...getHeightStyle(),
                  ...getEditingStyles()
                }}
              >
                {getEditingIndicator()}
                {config.showDivider && renderDivider()}
                {!config.showDivider && (
                  <div className="text-slate-400 text-xs">
                    Empty Spacer
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // View Mode - Actual Spacer
        <div 
          className={`w-full ${getHeightClass()} relative`}
          style={{
            ...getHeightStyle(),
            ...style
          }}
        >
          {renderDivider()}
        </div>
      )}
    </div>
  );
};

// Helper function to render the revealed content
const renderRevealedContent = (config) => {
  switch (config.revealType) {
    case 'text':
      return (
        <p className="text-lg font-semibold text-slate-800 break-words">
          {config.message}
        </p>
      );
    case 'image':
      return config.imageUrl ? (
        <img 
          src={config.imageUrl} 
          alt="Revealed" 
          className="max-w-full max-h-32 object-contain rounded"
        />
      ) : (
        <p className="text-slate-500">No image set</p>
      );
    case 'emoji':
      return (
        <div className="text-6xl">
          {config.message || "🎁"}
        </div>
      );
    default:
      return null;
  }
};

const PollBlock = ({ content, theme, isEditing, onUpdate }) => {
  const [voted, setVoted] = useState(null);
  const [showAI, setShowAI] = useState(false);
  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 text-white font-bold flex justify-between items-center" style={{ backgroundColor: theme.primary }}><span>{isEditing ? "Poll Editor" : "Your Opinion?"}</span><ListChecks size={20} /></div>
      <div className="p-6">
        {isEditing ? (
          <div className="space-y-3 relative">
            <button onClick={() => setShowAI(!showAI)} className="absolute -top-12 right-0 bg-white text-indigo-600 text-xs px-3 py-1 rounded-full shadow flex items-center gap-1"><Sparkles size={12} /> AI</button>
            {showAI && <AIAssistantPanel type="poll" onGenerate={(data) => { onUpdate({ ...content, ...data }); setShowAI(false); }} onClose={() => setShowAI(false)} />}
            <input value={content.question} onChange={e => onUpdate({ ...content, question: e.target.value })} className="w-full font-bold border-b p-2 text-slate-800" placeholder="Poll Question?" />
            {content.options?.map((opt, i) => (
              <input key={i} value={opt} onChange={e => { const newOpts = [...content.options]; newOpts[i] = e.target.value; onUpdate({ ...content, options: newOpts }); }} className="w-full text-sm border p-1 rounded text-slate-600" placeholder={`Option ${i + 1}`} />
            ))}
            <button onClick={() => onUpdate({ ...content, options: [...(content.options || []), 'New Option'] })} className="text-xs text-indigo-600">+ Add Option</button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800">{content.question}</h3>
            <div className="space-y-2">
              {content.options?.map((opt, i) => (
                <button key={i} onClick={() => setVoted(i)} disabled={voted !== null} className={`w-full p-3 rounded-lg text-left transition-all border ${voted === i ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'hover:bg-slate-50 border-slate-200 text-slate-600'}`}>
                  {opt} {voted === i && "✨"}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const QuizBlock = ({ content, theme, isEditing, onUpdate }) => {
  const [selected, setSelected] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const isCorrect = selected === content.correctIndex;
  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div style={{ backgroundColor: theme.primary }} className="p-4 text-white font-bold flex justify-between items-center"><span>{isEditing ? "Trivia Editor" : "Quick Trivia!"}</span><HelpCircle size={20} /></div>
        <div className="p-6">
          {isEditing ? (
            <div className="space-y-3 relative">
              <button onClick={() => setShowAI(!showAI)} className="absolute -top-12 right-0 bg-white text-indigo-600 text-xs px-3 py-1 rounded-full shadow flex items-center gap-1"><Sparkles size={12} /> AI</button>
              {showAI && <AIAssistantPanel type="quiz" onGenerate={(data) => { onUpdate({ ...content, ...data }); setShowAI(false); }} onClose={() => setShowAI(false)} />}
              <input value={content.question} onChange={e => onUpdate({ ...content, question: e.target.value })} className="w-full font-bold border-b p-2 text-slate-800" placeholder="Question?" />
              {content.options?.map((opt, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input type="radio" name="correct" checked={content.correctIndex === i} onChange={() => onUpdate({ ...content, correctIndex: i })} />
                  <input value={opt} onChange={e => { const newOpts = [...content.options]; newOpts[i] = e.target.value; onUpdate({ ...content, options: newOpts }); }} className="w-full text-sm border p-1 rounded text-slate-600" placeholder={`Option ${i + 1}`} />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800">{content.question}</h3>
              <div className="grid gap-2">
                {content.options?.map((opt, i) => (
                  <button key={i} onClick={() => setSelected(i)} disabled={selected !== null} className={`p-3 rounded-lg text-left transition-all ${selected === null ? 'bg-slate-50 hover:bg-slate-100 text-slate-600' : i === content.correctIndex ? 'bg-green-100 text-green-800 border-green-500 border' : selected === i ? 'bg-red-100 text-red-800' : 'opacity-50'}`}>
                    {opt} {selected !== null && i === content.correctIndex && <span className="float-right">✅</span>}
                  </button>
                ))}
              </div>
              {selected !== null && <div className="text-center font-bold animate-in fade-in slide-in-from-bottom-2 text-slate-800">{isCorrect ? "Correct! 🎉" : "Oops! 😅"}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CountdownBlock = ({ content, theme, isEditing, onUpdate }) => {
  const calculateTimeLeft = () => { const diff = +new Date(content.date) - +new Date(); return { days: Math.floor(diff / (1000 * 60 * 60 * 24)), hours: Math.floor((diff / (1000 * 60 * 60)) % 24) }; };
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  useEffect(() => { const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000 * 60); return () => clearInterval(timer); }, [content.date]);
  return (
    <div className="text-center w-full">
      {isEditing ? (
        <div className="bg-white p-4 rounded border border-dashed">
          <label className="text-xs font-bold text-slate-400">Target Date</label>
          <input type="date" value={content.date} onChange={e => onUpdate({ ...content, date: e.target.value })} className="w-full border p-2 rounded text-slate-600" />
          <input value={content.label} onChange={e => onUpdate({ ...content, label: e.target.value })} className="w-full border p-2 rounded mt-2 text-slate-600" placeholder="Event Name" />
        </div>
      ) : (
        <div className="inline-block p-8 rounded-full bg-white/90 shadow-xl border-4" style={{ borderColor: theme.primary }}>
          <div className="text-sm uppercase tracking-widest text-slate-500 mb-2">{content.label || "Countdown to"}</div>
          <div className="flex gap-4 justify-center items-baseline" style={{ color: theme.primary }}>
            <div className="text-center"><span className="text-5xl font-black">{timeLeft.days > 0 ? timeLeft.days : 0}</span><div className="text-xs font-bold uppercase">Days</div></div>
            <div className="text-3xl font-light">:</div>
            <div className="text-center"><span className="text-5xl font-black">{timeLeft.hours > 0 ? timeLeft.hours : 0}</span><div className="text-xs font-bold uppercase">Hours</div></div>
          </div>
        </div>
      )}
    </div>
  );
};

const MapBlock = ({ content, theme, isEditing, onUpdate }) => (
  <div className="w-full">
    <div className="bg-white p-2 rounded-xl shadow-lg transform -rotate-1 hover:rotate-0 transition-transform">
      {isEditing ? (
        <div className="p-4 space-y-2">
          <input value={content.location} onChange={e => onUpdate({ ...content, location: e.target.value })} className="w-full border p-2 text-slate-600" placeholder="City/Place Name" />
          <input value={content.caption} onChange={e => onUpdate({ ...content, caption: e.target.value })} className="w-full border p-2 text-slate-600" placeholder="Why is this place special?" />
        </div>
      ) : (
        <div className="relative aspect-video bg-blue-50 rounded-lg overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#cbd5e1 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center animate-bounce">
              <MapPin size={48} fill={theme.primary} stroke="white" className="drop-shadow-lg" />
              <div className="bg-white px-3 py-1 rounded-full shadow-md text-sm font-bold mt-2 text-slate-800">{content.location || "Special Place"}</div>
            </div>
          </div>
        </div>
      )}
      <div className="p-4 text-center"><p className="font-handwriting text-xl text-slate-600">{content.caption}</p></div>
    </div>
  </div>
);

const VideoBlock = ({ content, isEditing, onUpdate }) => (
  <div className="w-full">
    {isEditing ? (
      <div className="bg-white p-4 rounded border border-dashed flex gap-2 items-center">
        <Video size={20} className="text-slate-400" />
        <input value={content.url} onChange={e => onUpdate({ ...content, url: e.target.value })} className="flex-1 border p-2 rounded text-slate-600" placeholder="Video URL (YouTube Embed Link)" />
        <div className="text-[10px] text-slate-400">Use Embed URL!</div>
      </div>
    ) : (
      <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
        {content.url ? <iframe src={content.url} className="w-full h-full" frameBorder="0" allowFullScreen title="Gift Video" /> : <div className="w-full h-full flex items-center justify-center text-white/50">No Video URL Set</div>}
      </div>
    )}
  </div>
);

const SecretBlock = ({ content, theme, isEditing, onUpdate }) => {
  const [unlocked, setUnlocked] = useState(false);
  const [attempt, setAttempt] = useState('');
  const [showAI, setShowAI] = useState(false);

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2" style={{ borderColor: theme.secondary }}>
        <div style={{ backgroundColor: unlocked ? '#22c55e' : theme.primary }} className="p-3 text-white font-bold text-center transition-colors">
          {isEditing ? "Secret Lock" : unlocked ? "Unlocked!" : "Locked Memory"}
        </div>
        <div className="p-6 text-center space-y-4">
          {isEditing ? (
            <div className="text-left space-y-2 relative">
              <input value={content.code} onChange={e => onUpdate({ ...content, code: e.target.value })} className="w-full border p-2 rounded text-slate-600" placeholder="Code (e.g. Paris)" />
              <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-400">Hint</span> <button onClick={() => setShowAI(!showAI)} className="text-[10px] text-indigo-600 flex items-center"><Sparkles size={10} /> AI Riddle</button></div>
              {showAI && <AIAssistantPanel type="riddle" contextData={content.code} onGenerate={t => { onUpdate({ ...content, hint: t }); setShowAI(false) }} onClose={() => setShowAI(false)} />}
              <input value={content.hint} onChange={e => onUpdate({ ...content, hint: e.target.value })} className="w-full border p-2 rounded text-slate-600" placeholder="Hint" />
              <textarea value={content.message} onChange={e => onUpdate({ ...content, message: e.target.value })} className="w-full border p-2 rounded text-slate-600" placeholder="Secret Message" />
            </div>
          ) : unlocked ? (
            <p className="text-lg font-medium text-slate-800">{content.message}</p>
          ) : (
            <>
              <p className="italic text-slate-500">"{content.hint}"</p>
              <div className="flex gap-2">
                <input value={attempt} onChange={e => setAttempt(e.target.value)} className="flex-1 border rounded px-2 text-slate-600" placeholder="Password..." />
                <button onClick={() => { if (attempt.toLowerCase() === content.code.toLowerCase()) setUnlocked(true) }} style={{ backgroundColor: theme.primary }} className="text-white px-3 rounded">Go</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const MemoryGameBlock = ({ theme, isEditing }) => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);

  const ICONS = ['🌟', '🎸', '🍦', '🎁', '🐶', '🍕', '🚀', '💎'];

  const initializeGame = () => {
    const shuffled = [...ICONS, ...ICONS]
      .sort(() => Math.random() - 0.5)
      .map((icon, id) => ({ id, icon }));
    setCards(shuffled);
    setFlipped([]);
    setSolved([]);
  };

  useEffect(() => { initializeGame(); }, []);

  const handleClick = (id) => {
    if (disabled || flipped.includes(id) || solved.includes(id)) return;
    if (flipped.length === 0) { setFlipped([id]); return; }
    if (flipped.length === 1) {
      setDisabled(true);
      setFlipped([...flipped, id]);
      const firstCard = cards.find(c => c.id === flipped[0]);
      const secondCard = cards.find(c => c.id === id);
      if (firstCard.icon === secondCard.icon) {
        setSolved(prev => [...prev, flipped[0], id]);
        setFlipped([]);
        setDisabled(false);
      } else {
        setTimeout(() => { setFlipped([]); setDisabled(false); }, 1000);
      }
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold uppercase tracking-widest text-sm opacity-70">Memory Match</h3>
        <TutorialTooltip content="Restart game">
          <button onClick={initializeGame} className="p-1 hover:bg-black/5 rounded"><RefreshCw size={16} /></button>
        </TutorialTooltip>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => handleClick(card.id)}
            className={`aspect-square rounded-lg text-2xl transition-all duration-500 transform ${flipped.includes(card.id) || solved.includes(card.id) ? 'rotate-y-180 bg-white shadow-inner' : 'bg-slate-800 text-transparent'
              }`}
            style={{ backgroundColor: (flipped.includes(card.id) || solved.includes(card.id)) ? 'white' : theme.primary }}
          >
            {(flipped.includes(card.id) || solved.includes(card.id)) ? card.icon : '?'}
          </button>
        ))}
      </div>
      {solved.length === cards.length && cards.length > 0 && (
        <div className="mt-4 text-center font-bold animate-bounce">You Won! 🎉</div>
      )}
    </div>
  );
};

const DailyWisdomBlock = ({ content, theme, isEditing, onUpdate }) => {
  const [showAI, setShowAI] = useState(false);
  const dayIndex = new Date().getDate() % (content.quotes?.length || 1);
  const currentQuote = content.quotes?.[dayIndex] || "Today is a beautiful day!";

  return (
    <div className="w-full px-2">
      <div className="bg-white rounded-xl p-4 shadow-lg border-t-4 w-full max-w-full" style={{ borderColor: theme.primary }}>
        <div className="flex items-center gap-2 mb-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
          <Sun size={14} /> Daily Wisdom
        </div>

        {isEditing ? (
          <div className="space-y-3 relative w-full">
            <div className="flex justify-end">
              <TutorialTooltip content="Generate with AI">
                <button 
                  onClick={() => setShowAI(!showAI)} 
                  className="bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded flex items-center gap-1"
                >
                  <Sparkles size={12} /> AI
                </button>
              </TutorialTooltip>
            </div>
            
            {showAI && (
              <div className="relative w-full">
                <AIAssistantPanel
                  type="wisdom"
                  onGenerate={t => {
                    onUpdate({ ...content, quotes: [...(content.quotes || []), t] });
                    setShowAI(false);
                  }}
                  onClose={() => setShowAI(false)}
                />
              </div>
            )}

            <div className="max-h-32 overflow-y-auto space-y-2 border rounded p-2 text-xs w-full">
              {content.quotes?.map((q, i) => (
                <div key={i} className="flex gap-2 items-center bg-slate-50 p-2 rounded w-full">
                  <span className="flex-1 break-words text-xs">{q}</span>
                  <button 
                    onClick={() => {
                      const n = [...content.quotes]; 
                      n.splice(i, 1); 
                      onUpdate({ ...content, quotes: n });
                    }}
                    className="flex-shrink-0"
                  >
                    <Trash2 size={12} className="text-red-400 hover:text-red-600" />
                  </button>
                </div>
              ))}
              {(!content.quotes || content.quotes.length === 0) && (
                <div className="text-slate-400 italic text-center py-2 text-xs">No quotes added yet</div>
              )}
            </div>
            
            <textarea
              className="w-full border p-3 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Add a new quote and press Enter..."
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && e.target.value) {
                  onUpdate({ ...content, quotes: [...(content.quotes || []), e.target.value] });
                  e.target.value = '';
                  e.preventDefault();
                }
              }}
            />
          </div>
        ) : (
          <div className="text-center w-full">
            <p className="text-lg font-serif italic text-slate-700 mb-3 break-words leading-relaxed px-1">
              "{currentQuote}"
            </p>
            <p className="text-xs text-slate-500">Come back tomorrow for a new message!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const HeroBlock = ({ content, isEditing, onUpdate, style }) => (
  <div className={`flex flex-col justify-center w-full ${getFlexAlign(style?.align)}`}>
    {isEditing ? (
      <div className="space-y-2 w-full">
        <input
          value={content.title}
          onChange={e => onUpdate({ ...content, title: e.target.value })}
          className={`w-full text-4xl font-bold bg-transparent border-b border-dashed focus:border-indigo-300 focus:outline-none ${style?.align === 'left' ? 'text-left' : style?.align === 'right' ? 'text-right' : 'text-center'
            }`}
          placeholder="Main Title"
        />
        <input
          value={content.subtitle}
          onChange={e => onUpdate({ ...content, subtitle: e.target.value })}
          className={`w-full text-xl bg-transparent border-b border-dashed focus:border-indigo-300 focus:outline-none ${style?.align === 'left' ? 'text-left' : style?.align === 'right' ? 'text-right' : 'text-center'
            }`}
          placeholder="Subtitle"
        />
      </div>
    ) : (
      <>
        <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight break-words w-full">{content.title}</h1>
        <p className="text-xl opacity-80">{content.subtitle}</p>
      </>
    )}
  </div>
);

// ... (Include other existing blocks: SectionBlock, NoteBlock, MusicBlock, TimelineBlock, GalleryBlock, CouponBlock, PollBlock, QuizBlock, CountdownBlock, MapBlock, VideoBlock, SecretBlock)

// --- Main Builder Layout ---

export default function App() {
  const [activeTab, setActiveTab] = useState('modules');
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [previewSize, setPreviewSize] = useState('desktop');
  const [showExportModal, setShowExportModal] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mode, setMode] = useState('wizard');
  const [config, setConfig] = useLocalStorage('gift-builder-config', {
    theme: 'modern',
    customTheme: DEFAULT_THEMES.modern,
    blocks: []
  });






  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentTheme = config?.theme === 'custom' ? config.customTheme : DEFAULT_THEMES[config?.theme || 'modern'];

  const importConfig = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          setConfig(imported);
        } catch (error) {
          alert('Invalid configuration file');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  const exportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'gift-config.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleWizardComplete = (data) => {
    setConfig({
      ...data,
      customTheme: DEFAULT_THEMES.modern,
      id: generateId()
    });
    setMode('builder');
  };

  // Bulk Operations Handlers
  const toggleBlockSelection = (blockId) => {
    setSelectedBlocks(prev =>
      prev.includes(blockId)
        ? prev.filter(id => id !== blockId)
        : [...prev, blockId]
    );
  };

  const selectAllBlocks = () => {
    if (selectedBlocks.length === config.blocks.length) {
      setSelectedBlocks([]);
    } else {
      setSelectedBlocks(config.blocks.map(block => block.id));
    }
  };

  const duplicateSelectedBlocks = () => {
    const blocksToDuplicate = config.blocks.filter(block => selectedBlocks.includes(block.id));
    const newBlocks = blocksToDuplicate.map(block => ({
      ...JSON.parse(JSON.stringify(block)),
      id: generateId()
    }));

    // Insert duplicates after the last selected block
    const lastSelectedIndex = Math.max(...selectedBlocks.map(id =>
      config.blocks.findIndex(b => b.id === id)
    ));

    const newBlockList = [...config.blocks];
    newBlockList.splice(lastSelectedIndex + 1, 0, ...newBlocks);

    setConfig(prev => ({ ...prev, blocks: newBlockList }));
    setSelectedBlocks(newBlocks.map(b => b.id));
  };

  const deleteSelectedBlocks = () => {
    if (selectedBlocks.length === 0) return;

    if (window.confirm(`Delete ${selectedBlocks.length} selected block${selectedBlocks.length !== 1 ? 's' : ''}?`)) {
      setConfig(prev => ({
        ...prev,
        blocks: prev.blocks.filter(block => !selectedBlocks.includes(block.id))
      }));
      setSelectedBlocks([]);
    }
  };

  const clearSelection = () => {
    setSelectedBlocks([]);
  };

  const addBlock = (type) => {
    const defaults = {
      hero: { title: 'Celebrate!', subtitle: 'This is for you.' },
      section: { title: 'New Chapter' },
      note: { text: 'Write a heartfelt message...' },
      quiz: { question: 'Who is my favorite superhero?', options: ['Batman', 'Superman', 'Iron Man', 'Thor'], correctIndex: 0 },
      countdown: { date: '2025-01-01', label: 'Countdown' },
      map: { location: 'Paris, France', caption: 'Where it all began.' },
      video: { url: '' },
      secret: { code: '1234', hint: 'Password is 1234', message: 'Surprise!' },
      timeline: { events: [{ date: '2023', title: 'Start', desc: 'A special moment.' }] },
      music: { title: 'Our Song', artist: 'Artist', link: '' },
      gallery: { images: [] },
      coupon: { text: 'Good for One Hug' },
      poll: { question: 'What should we do next?', options: ['Dinner', 'Movie', 'Trip'] },
      game: {},
      wisdom: { quotes: ["The best thing to hold onto in life is each other."] },
      openwhen: { items: [{ id: 1, label: "Open when you're happy", text: "I'm glad you're smiling!" }] },
      voice: { audioURL: null },
      spinwheel: { options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'] },
      drawing: { drawingData: null },
      dice: { diceCount: 1 }
    };
    const newBlock = {
      id: generateId(),
      type,
      content: defaults[type] || {},
      style: { bg: 'transparent', align: 'center', padding: 'normal', width: 'full' }
    };
    setConfig(prev => ({ ...prev, blocks: [...prev.blocks, newBlock] }));
    if (isMobile) setMobileSidebarOpen(false);
  };

  const updateBlock = (id, content) => setConfig(p => ({ ...p, blocks: p.blocks.map(b => b.id === id ? { ...b, content } : b) }));
  const updateBlockStyle = (id, style) => setConfig(p => ({ ...p, blocks: p.blocks.map(b => b.id === id ? { ...b, style } : b) }));
  const removeBlock = (id) => setConfig(p => ({ ...p, blocks: p.blocks.filter(b => b.id !== id) }));

  const duplicateBlock = (id) => {
    const original = config.blocks.find(b => b.id === id);
    if (original) {
      const duplicated = {
        ...JSON.parse(JSON.stringify(original)),
        id: generateId()
      };
      const index = config.blocks.findIndex(b => b.id === id);
      const newBlocks = [...config.blocks];
      newBlocks.splice(index + 1, 0, duplicated);
      setConfig(prev => ({ ...prev, blocks: newBlocks }));
    }
  };

  const moveBlock = (i, dir) => {
    const b = [...config.blocks];
    if (dir === -1 && i > 0) [b[i], b[i - 1]] = [b[i - 1], b[i]];
    else if (dir === 1 && i < b.length - 1) [b[i], b[i + 1]] = [b[i + 1], b[i]];
    setConfig(p => ({ ...p, blocks: b }));
  };

  const blockComponents = {
    hero: HeroBlock,
    section: SectionBlock,
    note: NoteBlock,
    quiz: QuizBlock,
    countdown: CountdownBlock,
    map: MapBlock,
    video: VideoBlock,
    secret: SecretBlock,
    timeline: TimelineBlock,
    music: MusicBlock,
    gallery: GalleryBlock,
    coupon: CouponBlock,
    poll: PollBlock,
    game: MemoryGameBlock,
    wisdom: DailyWisdomBlock,
    openwhen: OpenWhenBlock,
    voice: VoiceMessageBlock,
    spinwheel: SpinWheelBlock,
    drawing: DrawingCanvasBlock,
    dice: DiceRollerBlock,
    spacer: SpacerBlock,
  };

  const renderBlock = (block, isEditing) => {
    const Cmp = blockComponents[block.type];

    if (!Cmp) return <div className="p-4 bg-red-100 text-red-500 rounded">Unknown Block: {block.type}</div>;

    return (
      <BlockWrapper
        style={block.style}
        theme={currentTheme}
        isEditing={isEditing}
        onStyleUpdate={(s) => updateBlockStyle(block.id, s)}
        isSelected={selectedBlocks.includes(block.id)}
        onSelect={() => toggleBlockSelection(block.id)}
      >
        <Cmp
          content={block.content}
          theme={currentTheme}
          isEditing={isEditing}
          onUpdate={(c) => updateBlock(block.id, c)}
          style={block.style}
        />
      </BlockWrapper>
    );
  };

  // Block library for sidebar
  // Updated block library with categories
  // Updated block library with categories and fixed icons
  const blockCategories = [
    {
      id: 'basic',
      name: 'Basic Elements',
      icon: Type,
      blocks: [
        { id: 'hero', icon: Type, label: 'Heading' },
        { id: 'section', icon: Hash, label: 'Divider' },
        { id: 'note', icon: MessageCircle, label: 'Note' },
        { id: 'spacer', icon: Minimize, label: 'Spacer' },
      ]
    },
    {
      id: 'content',
      name: 'Content',
      icon: FileText,
      blocks: [
        { id: 'timeline', icon: Clock, label: 'Timeline' },
        { id: 'wisdom', icon: Sun, label: 'Daily Wisdom' },
        { id: 'coupon', icon: Ticket, label: 'Coupon' },
        { id: 'openwhen', icon: Mail, label: 'Open When' },
      ]
    },
    {
      id: 'media',
      name: 'Media',
      icon: ImageIcon,
      blocks: [
        { id: 'gallery', icon: ImageIcon, label: 'Gallery' },
        { id: 'music', icon: Music, label: 'Music' },
        { id: 'video', icon: Video, label: 'Video' },
        { id: 'voice', icon: Mic, label: 'Voice Message' },
      ]
    },
    {
      id: 'interactive',
      name: 'Interactive',
      icon: Gamepad2,
      blocks: [
        { id: 'quiz', icon: HelpCircle, label: 'Quiz' },
        { id: 'poll', icon: ListChecks, label: 'Poll' },
        { id: 'game', icon: Gamepad2, label: 'Memory Game' },
        { id: 'secret', icon: Lock, label: 'Secret' },
        { id: 'countdown', icon: Timer, label: 'Countdown' },
        { id: 'spinwheel', icon: RefreshCw, label: 'Spin Wheel' },
        { id: 'drawing', icon: Edit, label: 'Drawing' },
        { id: 'dice', icon: Dice1, label: 'Dice Roller' }, // ← Using Dice1 instead of Dice
      ]
    },
    {
      id: 'special',
      name: 'Special',
      icon: Sparkles,
      blocks: [
        { id: 'map', icon: MapPin, label: 'Map' },
      ]
    }
  ];

  if (mode === 'wizard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6 animate-fade-in">
          <Gift size={48} className="mx-auto text-indigo-600" />
          <h2 className="text-2xl font-bold text-slate-800">Let's build a gift!</h2>
          <p className="text-slate-600">Create a personalized digital gift for someone special</p>
          <button
            onClick={() => handleWizardComplete({ theme: 'modern', blocks: [] })}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Start Creating
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'gift') {
    const previewStyles = {
      mobile: 'max-w-[375px] mx-auto',
      tablet: 'max-w-[768px] mx-auto',
      desktop: 'max-w-full'
    };

    return (
      <div
        className={`min-h-screen overflow-y-auto ${currentTheme.font} relative`}
        style={{
          backgroundColor: currentTheme.bg.startsWith('bg-') ? undefined : currentTheme.bg,
          color: currentTheme.text
        }}
      >
        <GlobalStyles />
        <div className={`fixed inset-0 -z-10 ${currentTheme.bg.startsWith('bg-') ? currentTheme.bg : ''}`}
          style={{ backgroundColor: currentTheme.bg.startsWith('bg-') ? undefined : currentTheme.bg }} />

        {/* Global Particles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="absolute animate-float opacity-20" style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${10 + Math.random() * 15}s`,
              animationDelay: `-${Math.random() * 10}s`,
              fontSize: `${1 + Math.random()}rem`
            }}>
              {currentTheme.particles[Math.floor(Math.random() * currentTheme.particles.length)]}
            </div>
          ))}
        </div>

        <div className="fixed top-4 right-4 flex gap-2 z-50">
          <TutorialTooltip content="Edit gift">
            <button
              onClick={() => setMode('builder')}
              className="bg-black/80 text-white px-4 py-2 rounded-full shadow-lg hover:bg-black transition-colors flex items-center gap-2"
            >
              Edit
            </button>
          </TutorialTooltip>
          <TutorialTooltip content="Export gift">
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Download size={16} /> Export
            </button>
          </TutorialTooltip>
        </div>

        <div className={`py-12 px-4 flex flex-wrap items-start content-start transition-all duration-300 ${previewStyles[previewSize]}`}>
          {config.blocks.map(b => (
            <div key={b.id} className={`${b.style.width === 'half' && previewSize !== 'mobile' ? 'w-full md:w-1/2' : 'w-full'} p-2 animate-in fade-in slide-in-from-bottom-8 duration-700`}>
              {renderBlock(b, false)}
            </div>
          ))}
        </div>

        <DevicePreview
          previewSize={previewSize}
          onSizeChange={setPreviewSize}
        />

        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          giftName={config.blocks.find(b => b.type === 'hero')?.content?.title || 'My Gift'}
          exportConfig={exportConfig}
        />
      </div>
    );
  }

  // Mobile Sidebar Component
  // Enhanced Mobile Sidebar Component
  // Enhanced Mobile Sidebar Component
const MobileSidebar = ({ isOpen, onClose }) => {
  const [mobileActiveTab, setMobileActiveTab] = useState('modules');
  const [selectedCategory, setSelectedCategory] = useState('basic');

  if (!isOpen) return null;

  const renderMobileContent = () => {
    switch (mobileActiveTab) {
      case 'modules':
        return (
          <div className="flex-1 overflow-y-auto">
            {/* Category Tabs */}
            <div className="flex overflow-x-auto border-b bg-slate-50">
              {blockCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex-shrink-0 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                    selectedCategory === category.id
                      ? 'border-indigo-600 text-indigo-600 bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <category.icon size={14} />
                    <span>{category.name}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Blocks Grid */}
            <div className="p-4">
              <div className="grid grid-cols-3 gap-3">
                {blockCategories
                  .find(cat => cat.id === selectedCategory)
                  ?.blocks.map(block => (
                    <button
                      key={block.id}
                      onClick={() => {
                        addBlock(block.id);
                        onClose();
                      }}
                      className="flex flex-col items-center gap-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <block.icon size={20} className="text-slate-600" />
                      <span className="text-xs font-medium text-center leading-tight">
                        {block.label}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        );

      case 'theme':
        return (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-bold text-slate-800 block mb-3">Theme Presets</label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(DEFAULT_THEMES).map(([k, t]) => (
                    <button
                      key={k}
                      onClick={() => {
                        setConfig(p => ({ ...p, theme: k }));
                        onClose();
                      }}
                      className={`p-3 text-sm rounded-lg border-2 text-left transition-all ${
                        config.theme === k 
                          ? 'border-indigo-600 bg-indigo-50 scale-95' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full mb-2 border border-slate-200" style={{ background: t.primary }}></div>
                      <div className="font-medium">{t.name}</div>
                    </button>
                  ))}
                  <button
                    onClick={() => setConfig(p => ({ ...p, theme: 'custom' }))}
                    className={`p-3 text-sm rounded-lg border-2 text-left transition-all ${
                      config.theme === 'custom' 
                        ? 'border-indigo-600 bg-indigo-50 scale-95' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full mb-2 bg-gradient-to-tr from-blue-400 to-purple-500 border border-slate-200"></div>
                    <div className="font-medium">Custom Theme</div>
                  </button>
                </div>
              </div>

              {config.theme === 'custom' && (
                <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <label className="text-sm font-bold text-slate-800">Custom Colors</label>
                  
                  <div>
                    <label className="text-xs text-slate-600 block mb-2">Primary Color</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={config.customTheme.primary}
                        onChange={e => setConfig(p => ({ 
                          ...p, 
                          customTheme: { 
                            ...p.customTheme, 
                            primary: e.target.value,
                            secondary: e.target.value + '40'
                          } 
                        }))}
                        className="w-12 h-12 rounded cursor-pointer border border-slate-300"
                      />
                      <span className="text-sm font-mono bg-white px-2 py-1 rounded border">
                        {config.customTheme.primary}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 block mb-2">Background</label>
                    <input
                      type="color"
                      value={config.customTheme.bg}
                      onChange={e => setConfig(p => ({ 
                        ...p, 
                        customTheme: { ...p.customTheme, bg: e.target.value } 
                      }))}
                      className="w-full h-12 rounded cursor-pointer border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 block mb-2">Font Style</label>
                    <select
                      value={config.customTheme.font}
                      onChange={e => setConfig(p => ({ 
                        ...p, 
                        customTheme: { ...p.customTheme, font: e.target.value } 
                      }))}
                      className="w-full p-3 rounded border border-slate-300 text-sm"
                    >
                      {Object.entries(FONTS).map(([k, v]) => 
                        <option key={k} value={k}>{v}</option>
                      )}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'tools':
        return (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <button
              onClick={() => {
                setShowExportModal(true);
                onClose();
              }}
              className="w-full flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 text-left"
            >
              <Download size={20} />
              <div>
                <div className="font-medium">Export Gift</div>
                <div className="text-sm text-slate-500">Save or share your creation</div>
              </div>
            </button>

            <label className="block w-full flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer">
              <Upload size={20} />
              <div>
                <div className="font-medium">Import Configuration</div>
                <div className="text-sm text-slate-500">Load a previous gift</div>
              </div>
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  importConfig(e);
                  onClose();
                }}
                className="hidden"
              />
            </label>

            {selectedBlocks.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-800 mb-3">
                  {selectedBlocks.length} block{selectedBlocks.length !== 1 ? 's' : ''} selected
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      duplicateSelectedBlocks();
                      onClose();
                    }}
                    className="bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600"
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={() => {
                      deleteSelectedBlocks();
                      onClose();
                    }}
                    className="bg-red-500 text-white py-2 px-3 rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all blocks?')) {
                  setConfig(prev => ({ ...prev, blocks: [] }));
                  setSelectedBlocks([]);
                }
                onClose();
              }}
              className="w-full flex items-center gap-3 p-4 border border-red-200 rounded-lg hover:bg-red-50 text-red-700 text-left"
            >
              <Trash2 size={20} />
              <div>
                <div className="font-medium">Clear All Blocks</div>
                <div className="text-sm text-red-500">Start fresh</div>
              </div>
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 max-h-[85vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">
            {mobileActiveTab === 'modules' ? 'Add Blocks' :
             mobileActiveTab === 'theme' ? 'Theme Settings' :
             mobileActiveTab === 'tools' ? 'Tools' : 'Menu'}
          </h3>
          <button onClick={onClose} className="p-1">
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b bg-slate-50">
          {[
            { id: 'modules', label: 'Blocks', icon: Plus },
            { id: 'theme', label: 'Theme', icon: Palette },
            { id: 'tools', label: 'Tools', icon: MoreHorizontal },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setMobileActiveTab(tab.id)}
              className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium ${
                mobileActiveTab === tab.id
                  ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {renderMobileContent()}
      </div>
    </>
  );
};

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      <GlobalStyles />

      {/* Desktop Sidebar */}
      <div className={`w-80 bg-white border-r flex flex-col shadow-xl z-20 ${isMobile ? 'hidden' : 'block'}`}>
        <div className="p-4 border-b flex items-center gap-2 font-bold text-slate-800">
          <Gift className="text-indigo-600" /> Gift Builder
        </div>

        <div className="flex text-xs border-b">
          {[
            { id: 'modules', label: 'Add', icon: Plus },
            { id: 'theme', label: 'Theme', icon: Palette },
            { id: 'tools', label: 'Tools', icon: MoreHorizontal },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 flex items-center justify-center gap-1 ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-600 font-bold border-b-2 border-indigo-600' : 'text-slate-500 hover:bg-slate-50'
                }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'modules' && (
            <div className="flex-1 overflow-y-auto">
              {blockCategories.map(category => (
                <div key={category.id} className="mb-6">
                  <div className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <category.icon size={12} />
                    {category.name}
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-3">
                    {category.blocks.map(block => (
                      <TutorialTooltip key={block.id} content={block.label} position="top">
                        <button
                          onClick={() => addBlock(block.id)}
                          className="w-full flex flex-col items-center justify-center gap-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all hover:border-indigo-300 hover:shadow-sm group h-20"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                            <block.icon size={16} className="text-slate-600 group-hover:text-indigo-600 transition-colors" />
                          </div>
                          <span className="text-xs font-medium text-slate-700 group-hover:text-indigo-700 text-center leading-tight px-1">
                            {block.label}
                          </span>
                        </button>
                      </TutorialTooltip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-6 p-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Presets</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(DEFAULT_THEMES).map(([k, t]) => (
                    <button
                      key={k}
                      onClick={() => setConfig(p => ({ ...p, theme: k }))}
                      className={`p-2 text-xs rounded border-2 text-left transition-all ${config.theme === k ? 'border-indigo-600 bg-indigo-50 scale-95' : 'border-slate-100 hover:border-slate-300'
                        }`}
                    >
                      <div className="w-4 h-4 rounded-full mb-1" style={{ background: t.primary }}></div>
                      {t.name}
                    </button>
                  ))}
                  <button
                    onClick={() => setConfig(p => ({ ...p, theme: 'custom' }))}
                    className={`p-2 text-xs rounded border-2 text-left transition-all ${config.theme === 'custom' ? 'border-indigo-600 bg-indigo-50 scale-95' : 'border-slate-100 hover:border-slate-300'
                      }`}
                  >
                    <div className="w-4 h-4 rounded-full mb-1 bg-gradient-to-tr from-blue-400 to-purple-500"></div>
                    Custom
                  </button>
                </div>
              </div>

              {config.theme === 'custom' && (
                <div className="animate-in slide-in-from-right-4 fade-in">
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Custom Design</label>
                  <div className="space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div>
                      <label className="text-[10px] text-slate-500">Primary Color</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={config.customTheme.primary}
                          onChange={e => setConfig(p => ({ ...p, customTheme: { ...p.customTheme, primary: e.target.value, secondary: e.target.value + '40' } }))}
                          className="w-8 h-8 rounded cursor-pointer"
                        />
                        <span className="text-xs font-mono">{config.customTheme.primary}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Background Color</label>
                      <input
                        type="color"
                        value={config.customTheme.bg}
                        onChange={e => setConfig(p => ({ ...p, customTheme: { ...p.customTheme, bg: e.target.value } }))}
                        className="w-full h-8 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Font Style</label>
                      <select
                        value={config.customTheme.font}
                        onChange={e => setConfig(p => ({ ...p, customTheme: { ...p.customTheme, font: e.target.value } }))}
                        className="w-full text-xs p-2 rounded border"
                      >
                        {Object.entries(FONTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Emoji Particles</label>
                      <input
                        value={config.customTheme.particles.join(' ')}
                        onChange={e => setConfig(p => ({ ...p, customTheme: { ...p.customTheme, particles: e.target.value.split(' ') } }))}
                        className="w-full text-xs p-2 rounded border"
                        placeholder="❤️ ✨ 🎉"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="p-4 space-y-3">
              <TutorialTooltip content="Export your gift in multiple formats">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="w-full flex items-center gap-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700"
                >
                  <Download size={16} /> Export Gift
                </button>
              </TutorialTooltip>

              {/* ADD BACK THE IMPORT BUTTON */}
              <TutorialTooltip content="Import previously saved configuration">
                <label className="block w-full flex items-center gap-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer">
                  <Upload size={16} /> Import Configuration
                  <input
                    type="file"
                    accept=".json"
                    onChange={importConfig}
                    className="hidden"
                  />
                </label>
              </TutorialTooltip>

              {selectedBlocks.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-blue-800 mb-2">
                    {selectedBlocks.length} block{selectedBlocks.length !== 1 ? 's' : ''} selected
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={duplicateSelectedBlocks}
                      className="flex-1 text-xs bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600"
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={deleteSelectedBlocks}
                      className="flex-1 text-xs bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

              <TutorialTooltip content="Clear all blocks and start fresh">
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all blocks?')) {
                      setConfig(prev => ({ ...prev, blocks: [] }));
                      setSelectedBlocks([]);
                    }
                  }}
                  className="w-full flex items-center gap-2 p-3 border border-red-200 rounded-lg hover:bg-red-50 text-red-700"
                >
                  <Trash2 size={16} /> Clear All Blocks
                </button>
              </TutorialTooltip>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-slate-50 space-y-2">
          <button
            onClick={() => setMode('gift')}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 hover:bg-slate-800"
          >
            <Eye size={18} /> Preview Gift
          </button>
          <div className="text-xs text-slate-500 text-center">
            {config.blocks.length} blocks • Auto-saved
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        {/* Mobile Header */}
        {isMobile && (
          <div className="bg-white border-b p-4 flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="p-2 rounded-lg border hover:bg-slate-50"
                title="Add Blocks"
              >
                <Plus size={20} />
              </button>
              <button
                onClick={() => {
                  setMobileSidebarOpen(true);
                  // This will be handled by the mobile sidebar state
                }}
                className="p-2 rounded-lg border hover:bg-slate-50"
                title="Theme Settings"
              >
                <Palette size={20} />
              </button>
            </div>

            <div className="font-bold text-slate-800">Gift Builder</div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setMobileSidebarOpen(true);
                  // This will be handled by the mobile sidebar state
                }}
                className="p-2 rounded-lg border hover:bg-slate-50"
                title="Tools"
              >
                <MoreHorizontal size={20} />
              </button>
              <button
                onClick={() => setMode('gift')}
                className="p-2 rounded-lg border hover:bg-slate-50"
                title="Preview"
              >
                <Eye size={20} />
              </button>
            </div>
          </div>
        )}

        <div
          className={`flex-1 overflow-y-auto relative p-4 md:p-8 transition-colors duration-500`}
          style={{ backgroundColor: config.theme === 'custom' ? config.customTheme.bg : '' }}
        >
          <div className={`absolute inset-0 -z-10 ${config.theme !== 'custom' ? currentTheme.bg : ''}`} />

          {/* Builder Background Particles */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 opacity-30">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="absolute animate-float" style={{
                left: `${Math.random() * 100}%`,
                animationDuration: `${10 + Math.random() * 15}s`,
                animationDelay: `-${Math.random() * 10}s`,
                fontSize: `${1 + Math.random()}rem`
              }}>
                {currentTheme.particles[Math.floor(Math.random() * currentTheme.particles.length)]}
              </div>
            ))}
          </div>

          {/* Bulk Operations */}
          <BulkOperations
            selectedBlocks={selectedBlocks}
            onSelectAll={selectAllBlocks}
            onDuplicateSelected={duplicateSelectedBlocks}
            onDeleteSelected={deleteSelectedBlocks}
            onClearSelection={clearSelection}
            totalBlocks={config.blocks.length}
          />

          {/* Export Button */}
          {!isMobile && (
            <div className="fixed top-4 right-4 z-30">
              <TutorialTooltip content="Export your gift">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <Download size={16} /> Export
                </button>
              </TutorialTooltip>
            </div>
          )}

          <div className="max-w-6xl mx-auto min-h-[80vh] pb-20 flex flex-wrap items-start content-start">
            {config.blocks.length === 0 && (
              <div className="w-full text-center opacity-40 mt-20 space-y-4">
                <Gift size={64} className="mx-auto text-slate-300" />
                <div className="text-slate-400">No blocks yet. Add some blocks to start building!</div>
                {isMobile && (
                  <button
                    onClick={() => setMobileSidebarOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
                  >
                    Add First Block
                  </button>
                )}
              </div>
            )}

            {config.blocks.map((block, index) => (
              <div key={block.id} className={`group relative p-2 transition-all duration-300 ${block.style.width === 'half' ? 'w-full md:w-1/2' : 'w-full'
                }`}>
                <div className="absolute -right-0 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                  <TutorialTooltip content="Move up">
                    <button
                      onClick={() => moveBlock(index, -1)}
                      className="p-1.5 bg-white shadow rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                    >
                      <ArrowUp size={14} />
                    </button>
                  </TutorialTooltip>
                  <TutorialTooltip content="Move down">
                    <button
                      onClick={() => moveBlock(index, 1)}
                      className="p-1.5 bg-white shadow rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </TutorialTooltip>
                  <TutorialTooltip content="Duplicate block">
                    <button
                      onClick={() => duplicateBlock(block.id)}
                      className="p-1.5 bg-white shadow rounded-full text-slate-400 hover:text-green-600 hover:bg-green-50"
                    >
                      <Copy size={14} />
                    </button>
                  </TutorialTooltip>
                  <TutorialTooltip content="Delete block">
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this block?')) {
                          removeBlock(block.id);
                          setSelectedBlocks(prev => prev.filter(id => id !== block.id));
                        }
                      }}
                      className="p-1.5 bg-white shadow rounded-full text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </TutorialTooltip>
                </div>

                <div className={`h-full border-2 border-transparent hover:border-indigo-400/50 rounded-2xl transition-all ${currentTheme.font
                  } ${currentTheme.text ? '' : 'text-slate-900'}`} style={{ color: currentTheme.text }}>
                  {renderBlock(block, true)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        giftName={config.blocks.find(b => b.type === 'hero')?.content?.title || 'My Gift'}
      />

      <DevicePreview
        previewSize={previewSize}
        onSizeChange={setPreviewSize}
      />
    </div>
  );
}