CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT,
  avatar TEXT,
  location TEXT,
  bio TEXT,
  phone TEXT,
  city TEXT,
  preferences TEXT, -- JSON string
  aadhar_number TEXT,
  dob TEXT,
  languages TEXT,
  specializations TEXT,
  hourly_rate INTEGER
);

CREATE TABLE IF NOT EXISTS guides (
  id TEXT PRIMARY KEY,
  name TEXT,
  avatar TEXT,
  location TEXT,
  languages TEXT,
  rating REAL,
  review_count INTEGER,
  hourly_rate INTEGER,
  specialties TEXT,
  bio TEXT,
  verified INTEGER, -- 0 or 1
  response_time TEXT,
  experience TEXT,
  completed_tours INTEGER,
  joined_date TEXT,
  availability TEXT,
  itinerary TEXT,
  hidden_gems TEXT
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  guide_id TEXT,
  user_id TEXT,
  date TEXT,
  time TEXT,
  status TEXT, -- 'pending', 'confirmed', 'completed', 'cancelled'
  total_price INTEGER,
  guests INTEGER,
  tour_type TEXT,
  FOREIGN KEY(guide_id) REFERENCES guides(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  guide_id TEXT,
  user_id TEXT,
  user_name TEXT,
  user_avatar TEXT,
  rating INTEGER,
  comment TEXT,
  date TEXT,
  tour_type TEXT,
  FOREIGN KEY(guide_id) REFERENCES guides(id)
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  sender_id TEXT,
  receiver_id TEXT,
  text TEXT,
  translated_text TEXT,
  timestamp TEXT,
  is_read INTEGER
);

CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  guide_id TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(guide_id) REFERENCES guides(id)
);

CREATE TABLE IF NOT EXISTS saved_itineraries (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  city TEXT,
  title TEXT,
  content TEXT, -- JSON string
  created_at TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS guide_availability_slots (
  id TEXT PRIMARY KEY,
  guide_id TEXT,
  date TEXT,
  status TEXT, -- 'available', 'busy', 'off'
  FOREIGN KEY(guide_id) REFERENCES guides(id)
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  user_avatar TEXT,
  content TEXT,
  image TEXT,
  city TEXT,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  comments TEXT, -- JSON string
  created_at TEXT
);
