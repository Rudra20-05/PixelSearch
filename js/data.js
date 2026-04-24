/* ============================================
   PIXELSEARCH — MOCK DATA LAYER
   ============================================ */

const UNSPLASH = 'https://images.unsplash.com';

const PhotoData = {
  // Sample photo library
  photos: [
    { id: 1,  src: `${UNSPLASH}/photo-1507525428034-b723cf961d3e?w=600&h=600&fit=crop`, title: 'Goa Beach Sunset', tags: ['beach', 'sunset', 'goa', 'travel'], date: 'Dec 15, 2023', location: 'Goa, India', people: 2, emotions: ['happy', 'relaxed'] },
    { id: 2,  src: `${UNSPLASH}/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop`, title: 'Mountain Vista', tags: ['mountain', 'landscape', 'nature'], date: 'Nov 3, 2023', location: 'Himachal Pradesh', people: 0, emotions: ['awe'] },
    { id: 3,  src: `${UNSPLASH}/photo-1529156069898-49953e39b3ac?w=600&h=600&fit=crop`, title: 'Friends Group Photo', tags: ['friends', 'group', 'smiling', 'college'], date: 'Oct 20, 2023', location: 'Mumbai', people: 5, emotions: ['happy', 'excited'] },
    { id: 4,  src: `${UNSPLASH}/photo-1605810230434-7631ac76ec81?w=600&h=600&fit=crop`, title: 'Diwali Lights', tags: ['diwali', 'festival', 'lights', 'celebration'], date: 'Nov 12, 2023', location: 'Mumbai', people: 3, emotions: ['joyful'] },
    { id: 5,  src: `${UNSPLASH}/photo-1476514525535-07fb3b4ae5f1?w=600&h=600&fit=crop`, title: 'Waterfall Adventure', tags: ['waterfall', 'nature', 'adventure', 'trekking'], date: 'Aug 8, 2023', location: 'Alibaug', people: 2, emotions: ['excited', 'happy'] },
    { id: 6,  src: `${UNSPLASH}/photo-1504674900247-0877df9cc836?w=600&h=600&fit=crop`, title: 'Street Food', tags: ['food', 'street', 'mumbai'], date: 'Sep 4, 2023', location: 'Mumbai', people: 0, emotions: [] },
    { id: 7,  src: `${UNSPLASH}/photo-1501594907352-04cda38ebc29?w=600&h=600&fit=crop`, title: 'Road Trip', tags: ['road', 'travel', 'car', 'highway'], date: 'Dec 10, 2023', location: 'Maharashtra', people: 2, emotions: ['adventurous'] },
    { id: 8,  src: `${UNSPLASH}/photo-1519046904884-53103b34b206?w=600&h=600&fit=crop`, title: 'Palm Beach', tags: ['beach', 'palm', 'tropical', 'sand'], date: 'Dec 16, 2023', location: 'Goa, India', people: 0, emotions: ['peaceful'] },
    { id: 9,  src: `${UNSPLASH}/photo-1511765224389-37f0e77cf0eb?w=600&h=600&fit=crop`, title: 'Birthday Party', tags: ['birthday', 'cake', 'party', 'celebration'], date: 'Jan 15, 2024', location: 'Mumbai', people: 8, emotions: ['happy', 'excited'] },
    { id: 10, src: `${UNSPLASH}/photo-1469474968028-56623f02e42e?w=600&h=600&fit=crop`, title: 'Golden Hour Sunset', tags: ['sunset', 'golden', 'sky', 'landscape'], date: 'Oct 5, 2023', location: 'Alibaug', people: 0, emotions: ['calm'] },
    { id: 11, src: `${UNSPLASH}/photo-1522202176988-66273c2fd55f?w=600&h=600&fit=crop`, title: 'College Study Group', tags: ['college', 'study', 'friends', 'library'], date: 'Sep 22, 2023', location: 'Mumbai', people: 4, emotions: ['focused'] },
    { id: 12, src: `${UNSPLASH}/photo-1530521954074-e64f6810b32d?w=600&h=600&fit=crop`, title: 'Coastal Drive', tags: ['coast', 'sea', 'road', 'drive'], date: 'Dec 12, 2023', location: 'Goa', people: 1, emotions: ['free'] },
    { id: 13, src: `${UNSPLASH}/photo-1566438480900-0609be27a4be?w=600&h=600&fit=crop`, title: 'Temple Visit', tags: ['temple', 'architecture', 'culture', 'spiritual'], date: 'Nov 14, 2023', location: 'Mumbai', people: 3, emotions: ['peaceful'] },
    { id: 14, src: `${UNSPLASH}/photo-1464822759023-fed622ff2c3b?w=600&h=600&fit=crop`, title: 'Mountain Peak', tags: ['mountain', 'peak', 'hiking', 'clouds'], date: 'Jul 20, 2023', location: 'Himachal Pradesh', people: 1, emotions: ['accomplished'] },
    { id: 15, src: `${UNSPLASH}/photo-1517457373958-b7bdd4587205?w=600&h=600&fit=crop`, title: 'Farewell Party', tags: ['college', 'farewell', 'friends', 'celebration'], date: 'Mar 28, 2024', location: 'Mumbai', people: 12, emotions: ['emotional', 'happy'] },
    { id: 16, src: `${UNSPLASH}/photo-1493246507139-91e8fad9978e?w=600&h=600&fit=crop`, title: 'Lake Reflection', tags: ['lake', 'reflection', 'nature', 'calm'], date: 'Aug 15, 2023', location: 'Lonavala', people: 0, emotions: ['serene'] },
    { id: 17, src: `${UNSPLASH}/photo-1516483638261-f4dbaf036963?w=600&h=600&fit=crop`, title: 'Heritage Building', tags: ['architecture', 'heritage', 'building'], date: 'Sep 10, 2023', location: 'Mumbai', people: 0, emotions: [] },
    { id: 18, src: `${UNSPLASH}/photo-1535910794222-0ad10e0e5bf7?w=600&h=600&fit=crop`, title: 'Sunset Sailing', tags: ['sunset', 'boat', 'sailing', 'sea'], date: 'Dec 17, 2023', location: 'Goa', people: 3, emotions: ['happy'] },
    { id: 19, src: `${UNSPLASH}/photo-1539635278303-d4002c07eae3?w=600&h=600&fit=crop`, title: 'Festival Dance', tags: ['festival', 'dance', 'colors', 'holi'], date: 'Mar 25, 2023', location: 'Mumbai', people: 6, emotions: ['joyful', 'energetic'] },
    { id: 20, src: `${UNSPLASH}/photo-1470071459604-3b5ec3a7fe05?w=600&h=600&fit=crop`, title: 'Forest Trail', tags: ['forest', 'trail', 'green', 'nature'], date: 'Jul 5, 2023', location: 'Alibaug', people: 2, emotions: ['peaceful'] },
  ],

  // Search result mock (for "Waterfall with two people smiling")
  waterfallSearch: {
    query: 'Waterfall with two people smiling',
    totalResults: 7,
    processingTime: '1.42s',
    explain: [
      { label: 'Waterfall detected', icon: '💧', confidence: 95 },
      { label: '2 people found', icon: '👥', confidence: 88 },
      { label: 'Smiling (emotion)', icon: '😊', confidence: 82 },
      { label: 'Outdoor scene', icon: '🌿', confidence: 97 },
      { label: 'Natural lighting', icon: '☀️', confidence: 90 },
    ],
    results: [4, 0, 19, 7, 2, 17, 16] // indices into photos array
  },

  // Beach search mock
  beachSearch: {
    query: 'Beach photos from Goa',
    totalResults: 5,
    processingTime: '0.89s',
    explain: [
      { label: 'Beach detected', icon: '🏖️', confidence: 98 },
      { label: 'Location: Goa', icon: '📍', confidence: 94 },
      { label: 'Sand texture', icon: '🏝️', confidence: 91 },
      { label: 'Water body', icon: '🌊', confidence: 96 },
    ],
    results: [0, 7, 11, 17, 4]
  }
};

const TimelineData = {
  events: [
    {
      id: 1,
      title: 'Goa Trip 2023',
      date: 'December 10–18, 2023',
      description: 'A memorable week-long trip to Goa with college friends. Beach hopping, sunset views, and endless memories.',
      icon: '🏖️',
      photos: [0, 7, 11, 17, 6], // indices into PhotoData.photos
      photoCount: 142,
      color: '#3B82F6'
    },
    {
      id: 2,
      title: 'Diwali Celebration 2023',
      date: 'November 12–14, 2023',
      description: 'Festival of lights with family and friends. Rangoli, fireworks, and delicious food.',
      icon: '🪔',
      photos: [3, 12, 5],
      photoCount: 67,
      color: '#F59E0B'
    },
    {
      id: 3,
      title: 'College Farewell',
      date: 'March 28, 2024',
      description: 'Emotional farewell party for the graduating batch. Speeches, performances, and lots of tears.',
      icon: '🎓',
      photos: [14, 2, 10],
      photoCount: 89,
      color: '#7C3AED'
    },
    {
      id: 4,
      title: 'Birthday Bash',
      date: 'January 15, 2024',
      description: 'Surprise birthday party organized by the squad. Best birthday ever!',
      icon: '🎂',
      photos: [8, 2, 18],
      photoCount: 54,
      color: '#EF4444'
    },
    {
      id: 5,
      title: 'Monsoon Trek - Alibaug',
      date: 'August 5–8, 2023',
      description: 'Adventure-packed weekend trek through waterfalls and lush green trails.',
      icon: '⛰️',
      photos: [4, 19, 15, 9],
      photoCount: 98,
      color: '#10B981'
    },
    {
      id: 6,
      title: 'Holi Festival 2023',
      date: 'March 25, 2023',
      description: 'Colors, music, and joy. The most vibrant celebration of the year with the entire gang.',
      icon: '🎨',
      photos: [18, 2, 8],
      photoCount: 73,
      color: '#EC4899'
    }
  ]
};

const AssistantData = {
  conversations: [
    {
      messages: [
        { role: 'ai', text: 'Hi! I\'m your PixelSearch assistant. Describe any photo or memory, and I\'ll find it for you. 🔍✨' },
        { role: 'user', text: 'Show beach photos from last year' },
        { role: 'ai', text: 'Found <strong>38 beach photos</strong> from 2023! Here are the top matches:', hasPhotos: true, photoIndices: [0, 7, 11, 17] },
        { role: 'user', text: 'Only where I look happy' },
        { role: 'ai', text: 'Filtered down to <strong>12 photos</strong> where happy emotions were detected. Here\'s a preview:', hasPhotos: true, photoIndices: [0, 17] },
        { role: 'user', text: 'Great! Now show family Diwali photos' },
        { role: 'ai', text: 'Found <strong>24 Diwali photos</strong> with family members identified. Here are the highlights:', hasPhotos: true, photoIndices: [3, 12] },
      ]
    }
  ]
};

const GraphData = {
  people: [
    { id: 'you', name: 'You', x: 0.5, y: 0.5, radius: 28, photos: 500, color: '#7C3AED' },
    { id: 'rahul', name: 'Rahul', x: 0.3, y: 0.25, radius: 20, photos: 156, color: '#3B82F6' },
    { id: 'priya', name: 'Priya', x: 0.7, y: 0.3, radius: 18, photos: 134, color: '#EC4899' },
    { id: 'amit', name: 'Amit', x: 0.25, y: 0.6, radius: 16, photos: 98, color: '#10B981' },
    { id: 'sneha', name: 'Sneha', x: 0.75, y: 0.65, radius: 17, photos: 112, color: '#F59E0B' },
    { id: 'mom', name: 'Mom', x: 0.5, y: 0.15, radius: 19, photos: 145, color: '#EF4444' },
    { id: 'dad', name: 'Dad', x: 0.6, y: 0.12, radius: 17, photos: 120, color: '#6366F1' },
    { id: 'vikram', name: 'Vikram', x: 0.15, y: 0.4, radius: 14, photos: 67, color: '#06B6D4' },
    { id: 'neha', name: 'Neha', x: 0.85, y: 0.45, radius: 15, photos: 78, color: '#8B5CF6' },
    { id: 'arjun', name: 'Arjun', x: 0.35, y: 0.8, radius: 13, photos: 54, color: '#14B8A6' },
  ],
  connections: [
    { from: 'you', to: 'rahul', strength: 0.9 },
    { from: 'you', to: 'priya', strength: 0.85 },
    { from: 'you', to: 'amit', strength: 0.7 },
    { from: 'you', to: 'sneha', strength: 0.75 },
    { from: 'you', to: 'mom', strength: 0.95 },
    { from: 'you', to: 'dad', strength: 0.9 },
    { from: 'you', to: 'vikram', strength: 0.5 },
    { from: 'you', to: 'neha', strength: 0.55 },
    { from: 'you', to: 'arjun', strength: 0.4 },
    { from: 'rahul', to: 'priya', strength: 0.6 },
    { from: 'rahul', to: 'amit', strength: 0.5 },
    { from: 'priya', to: 'sneha', strength: 0.7 },
    { from: 'mom', to: 'dad', strength: 0.95 },
    { from: 'vikram', to: 'arjun', strength: 0.3 },
    { from: 'amit', to: 'arjun', strength: 0.45 },
  ],
  insights: [
    { name: 'Rahul', stat: '156 photos together · Best friend', icon: '👋' },
    { name: 'Mom', stat: '145 photos together · Family', icon: '❤️' },
    { name: 'Priya', stat: '134 photos together · Close friend', icon: '🤝' },
    { name: 'Dad', stat: '120 photos together · Family', icon: '💙' },
    { name: 'Sneha', stat: '112 photos together · College friend', icon: '🎓' },
    { name: 'Amit', stat: '98 photos together · Friend', icon: '😎' },
  ]
};

const MapData = {
  locations: [
    { name: 'Goa', lat: 15.2993, lng: 74.1240, photos: 142, image: `${UNSPLASH}/photo-1507525428034-b723cf961d3e?w=300&h=200&fit=crop` },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, photos: 234, image: `${UNSPLASH}/photo-1566438480900-0609be27a4be?w=300&h=200&fit=crop` },
    { name: 'Alibaug', lat: 18.6414, lng: 72.8722, photos: 98, image: `${UNSPLASH}/photo-1470071459604-3b5ec3a7fe05?w=300&h=200&fit=crop` },
    { name: 'Lonavala', lat: 18.7546, lng: 73.4062, photos: 76, image: `${UNSPLASH}/photo-1493246507139-91e8fad9978e?w=300&h=200&fit=crop` },
    { name: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734, photos: 54, image: `${UNSPLASH}/photo-1464822759023-fed622ff2c3b?w=300&h=200&fit=crop` },
  ]
};

const ReelsData = {
  reels: [
    { id: 1, title: 'Goa Memories', subtitle: 'Dec 2023 · 142 photos', cover: `${UNSPLASH}/photo-1507525428034-b723cf961d3e?w=500&h=700&fit=crop`, category: 'Trips' },
    { id: 2, title: 'Diwali Highlights', subtitle: 'Nov 2023 · 67 photos', cover: `${UNSPLASH}/photo-1605810230434-7631ac76ec81?w=500&h=700&fit=crop`, category: 'Festivals' },
    { id: 3, title: 'Best of Friends', subtitle: '2023 · 312 photos', cover: `${UNSPLASH}/photo-1529156069898-49953e39b3ac?w=500&h=700&fit=crop`, category: 'People' },
    { id: 4, title: 'Sunset Collection', subtitle: '2023 · 89 photos', cover: `${UNSPLASH}/photo-1469474968028-56623f02e42e?w=500&h=700&fit=crop`, category: 'Nature' },
    { id: 5, title: 'Monsoon Trek', subtitle: 'Aug 2023 · 98 photos', cover: `${UNSPLASH}/photo-1470071459604-3b5ec3a7fe05?w=500&h=700&fit=crop`, category: 'Adventures' },
    { id: 6, title: 'College Days', subtitle: '2023-24 · 256 photos', cover: `${UNSPLASH}/photo-1522202176988-66273c2fd55f?w=500&h=700&fit=crop`, category: 'Life' },
  ]
};

const StatsData = {
  stats: [
    { value: '<2s', label: 'Query Latency', icon: '⚡' },
    { value: '75%+', label: 'Search Precision', icon: '🎯' },
    { value: '500+', label: 'Photos/min Indexing', icon: '📸' },
    { value: '8', label: 'AI Modules', icon: '🧠' },
  ]
};

const SmartPrompts = [
  { label: '🏖️ Beach trips', query: 'Beach photos from trips' },
  { label: '😊 Happy moments', query: 'Photos where everyone is happy' },
  { label: '👨‍👩‍👧 Family photos', query: 'Family group photos' },
  { label: '🌅 Sunset pictures', query: 'Beautiful sunset photos' },
  { label: '🎉 Celebrations', query: 'Party and celebration photos' },
  { label: '🏔️ Mountains', query: 'Mountain and hiking photos' },
  { label: '🍜 Food pics', query: 'Delicious food photographs' },
  { label: '🏛️ Architecture', query: 'Buildings and architecture shots' },
];

const RecentSearches = [
  'Goa beach sunset',
  'Friends from college',
  'Diwali 2023',
  'Mountain trek photos',
];
