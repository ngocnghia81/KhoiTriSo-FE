# Schema NoSQL cho Forum - Khởi Trí Số

## 🎯 Lý do sử dụng NoSQL cho Forum

Forum hoạt động như một **mạng xã hội học tập**, với các đặc điểm:
- **Tương tác cao**: Comments, replies, votes, reactions
- **Dữ liệu phi cấu trúc**: Rich text, media, nested comments
- **Scalability**: Cần mở rộng nhanh với lượng user lớn
- **Real-time**: Live notifications, online status
- **Flexible schema**: Thêm features mới không cần migration

## 🏗️ Database Design - MongoDB Collections

### 1. **ForumPosts Collection**
```javascript
{
  _id: ObjectId,
  title: String,
  content: String, // Rich text content
  contentType: String, // "text", "markdown", "html"
  
  // Author info
  author: {
    userId: ObjectId,
    username: String,
    displayName: String,
    avatar: String,
    reputation: Number,
    badges: [String], // ["teacher", "expert", "top_contributor"]
    isOnline: Boolean
  },
  
  // Classification
  category: {
    id: String,
    name: String,
    slug: String
  },
  
  tags: [String], // ["toán-12", "đạo-hàm", "khó"]
  
  // Engagement metrics
  stats: {
    views: Number,
    upvotes: Number,
    downvotes: Number,
    totalVotes: Number, // upvotes - downvotes
    replies: Number,
    bookmarks: Number,
    shares: Number
  },
  
  // Status
  status: String, // "active", "closed", "pinned", "deleted"
  isSolved: Boolean,
  acceptedReplyId: ObjectId,
  
  // Moderation
  moderation: {
    isReported: Boolean,
    reportCount: Number,
    isHidden: Boolean,
    moderatedBy: ObjectId,
    moderatedAt: Date,
    moderationReason: String
  },
  
  // SEO & Search
  slug: String,
  searchKeywords: [String],
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  lastActivityAt: Date,
  
  // Attachments
  attachments: [{
    type: String, // "image", "file", "video"
    url: String,
    filename: String,
    size: Number,
    mimeType: String
  }],
  
  // Advanced features
  poll: {
    question: String,
    options: [{
      text: String,
      votes: Number,
      voters: [ObjectId]
    }],
    allowMultiple: Boolean,
    expiresAt: Date
  }
}
```

### 2. **ForumReplies Collection**
```javascript
{
  _id: ObjectId,
  postId: ObjectId,
  parentReplyId: ObjectId, // null for top-level replies
  
  content: String,
  contentType: String,
  
  // Author
  author: {
    userId: ObjectId,
    username: String,
    displayName: String,
    avatar: String,
    reputation: Number,
    badges: [String],
    isOnline: Boolean
  },
  
  // Nested replies support
  depth: Number, // 0 = top level, 1 = reply to post, 2 = reply to reply
  thread: [ObjectId], // Array of parent IDs for threading
  
  // Engagement
  stats: {
    upvotes: Number,
    downvotes: Number,
    totalVotes: Number,
    replies: Number // replies to this reply
  },
  
  // Status
  isAccepted: Boolean, // Best answer
  isHidden: Boolean,
  isEdited: Boolean,
  editHistory: [{
    content: String,
    editedAt: Date,
    editedBy: ObjectId,
    reason: String
  }],
  
  // Moderation
  moderation: {
    isReported: Boolean,
    reportCount: Number,
    isHidden: Boolean,
    moderatedBy: ObjectId,
    moderatedAt: Date
  },
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  
  // Attachments
  attachments: [{
    type: String,
    url: String,
    filename: String,
    size: Number
  }],
  
  // Mentions
  mentions: [{
    userId: ObjectId,
    username: String,
    position: Number // character position in content
  }]
}
```

### 3. **ForumVotes Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  targetType: String, // "post" or "reply"
  targetId: ObjectId,
  voteType: String, // "upvote", "downvote"
  createdAt: Date,
  
  // User context
  userInfo: {
    username: String,
    reputation: Number
  }
}
```

### 4. **ForumCategories Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  slug: String,
  description: String,
  icon: String,
  color: String,
  
  // Hierarchy
  parentId: ObjectId,
  level: Number,
  path: [ObjectId], // All parent IDs
  
  // Stats
  stats: {
    totalPosts: Number,
    totalReplies: Number,
    totalUsers: Number,
    lastActivity: Date
  },
  
  // Permissions
  permissions: {
    canPost: [String], // ["student", "teacher", "admin"]
    canReply: [String],
    canModerate: [String]
  },
  
  // Display
  isActive: Boolean,
  sortOrder: Number,
  
  createdAt: Date,
  updatedAt: Date
}
```

### 5. **ForumNotifications Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: String, // "reply", "mention", "vote", "accepted", "badge"
  
  // Content
  title: String,
  message: String,
  actionUrl: String,
  
  // Source
  sourceType: String, // "post", "reply", "user"
  sourceId: ObjectId,
  triggeredBy: {
    userId: ObjectId,
    username: String,
    avatar: String
  },
  
  // Status
  isRead: Boolean,
  readAt: Date,
  
  // Metadata
  metadata: {}, // Flexible data for different notification types
  
  createdAt: Date,
  expiresAt: Date
}
```

### 6. **ForumUserProfiles Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to main Users table
  
  // Forum-specific profile
  forumStats: {
    totalPosts: Number,
    totalReplies: Number,
    totalVotes: Number,
    reputation: Number,
    acceptedAnswers: Number,
    bestAnswerRate: Number
  },
  
  // Achievements
  badges: [{
    name: String,
    icon: String,
    description: String,
    earnedAt: Date,
    level: Number // Bronze, Silver, Gold
  }],
  
  // Preferences
  preferences: {
    emailNotifications: Boolean,
    pushNotifications: Boolean,
    showOnlineStatus: Boolean,
    autoSubscribeToReplies: Boolean,
    preferredCategories: [String]
  },
  
  // Social features
  following: [ObjectId], // Users they follow
  followers: [ObjectId], // Users following them
  blockedUsers: [ObjectId],
  
  // Activity tracking
  lastActivity: Date,
  joinedAt: Date,
  
  // Moderation history
  warnings: [{
    reason: String,
    issuedBy: ObjectId,
    issuedAt: Date
  }],
  
  // Reputation history
  reputationHistory: [{
    change: Number, // +10, -5
    reason: String, // "upvote_received", "answer_accepted"
    sourceId: ObjectId,
    createdAt: Date
  }]
}
```

### 7. **ForumReports Collection**
```javascript
{
  _id: ObjectId,
  reportedBy: ObjectId,
  targetType: String, // "post", "reply", "user"
  targetId: ObjectId,
  
  reason: String, // "spam", "inappropriate", "harassment", "off_topic"
  description: String,
  
  // Evidence
  screenshots: [String],
  additionalInfo: {},
  
  // Status
  status: String, // "pending", "reviewing", "resolved", "dismissed"
  
  // Moderation
  assignedTo: ObjectId,
  moderatorNotes: String,
  resolution: String,
  resolvedAt: Date,
  
  createdAt: Date
}
```

### 8. **ForumSessions Collection** (Real-time)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  username: String,
  
  // Session info
  sessionId: String,
  socketId: String,
  isOnline: Boolean,
  
  // Current activity
  currentPage: String,
  currentPostId: ObjectId,
  isTyping: Boolean,
  typingIn: ObjectId, // postId or replyId
  
  // Device info
  userAgent: String,
  ipAddress: String,
  device: String,
  
  // Timestamps
  connectedAt: Date,
  lastActivity: Date,
  disconnectedAt: Date
}
```

## 🔍 Indexes for Performance

```javascript
// ForumPosts
db.forumPosts.createIndex({ "category.slug": 1, "createdAt": -1 })
db.forumPosts.createIndex({ "author.userId": 1, "createdAt": -1 })
db.forumPosts.createIndex({ "tags": 1, "stats.totalVotes": -1 })
db.forumPosts.createIndex({ "title": "text", "content": "text", "tags": "text" })
db.forumPosts.createIndex({ "slug": 1 })
db.forumPosts.createIndex({ "status": 1, "lastActivityAt": -1 })
db.forumPosts.createIndex({ "isSolved": 1, "stats.views": -1 })

// ForumReplies
db.forumReplies.createIndex({ "postId": 1, "createdAt": 1 })
db.forumReplies.createIndex({ "author.userId": 1, "createdAt": -1 })
db.forumReplies.createIndex({ "parentReplyId": 1, "createdAt": 1 })
db.forumReplies.createIndex({ "isAccepted": 1, "stats.totalVotes": -1 })

// ForumVotes
db.forumVotes.createIndex({ "userId": 1, "targetType": 1, "targetId": 1 })
db.forumVotes.createIndex({ "targetType": 1, "targetId": 1, "voteType": 1 })

// ForumNotifications
db.forumNotifications.createIndex({ "userId": 1, "isRead": 1, "createdAt": -1 })
db.forumNotifications.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 })

// ForumUserProfiles
db.forumUserProfiles.createIndex({ "userId": 1 })
db.forumUserProfiles.createIndex({ "forumStats.reputation": -1 })

// ForumSessions
db.forumSessions.createIndex({ "userId": 1, "isOnline": 1 })
db.forumSessions.createIndex({ "lastActivity": 1 }, { expireAfterSeconds: 3600 })
```

## 🚀 Advanced Features Support

### 1. **Real-time Features**
- Online user tracking
- Live typing indicators
- Real-time vote updates
- Instant notifications

### 2. **Social Features**
- User following system
- Reputation & badges
- Leaderboards
- User profiles

### 3. **Content Management**
- Rich text editor support
- File/image attachments
- Content moderation
- Spam detection

### 4. **Search & Discovery**
- Full-text search
- Tag-based filtering
- Category browsing
- Trending posts

### 5. **Gamification**
- Points & reputation
- Achievement badges
- Leaderboards
- Progress tracking

## 📊 Analytics Queries

### Popular Posts
```javascript
db.forumPosts.find({
  status: "active",
  createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) }
}).sort({ "stats.totalVotes": -1, "stats.views": -1 }).limit(10)
```

### Top Contributors
```javascript
db.forumUserProfiles.find({}).sort({ 
  "forumStats.reputation": -1,
  "forumStats.acceptedAnswers": -1 
}).limit(10)
```

### Trending Tags
```javascript
db.forumPosts.aggregate([
  { $match: { createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } } },
  { $unwind: "$tags" },
  { $group: { _id: "$tags", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 20 }
])
```

## 🔐 Security Considerations

### 1. **Data Validation**
- Input sanitization
- XSS prevention
- Content filtering
- Rate limiting

### 2. **Privacy**
- User data anonymization
- GDPR compliance
- Data retention policies
- Privacy settings

### 3. **Moderation**
- Automated spam detection
- Content reporting system
- Moderator tools
- Appeal process

## 🎯 Integration với SQL Database

Forum sử dụng **Hybrid Architecture**:
- **MongoDB**: Forum data (posts, replies, votes)
- **PostgreSQL**: User accounts, courses, books
- **Redis**: Caching, sessions, real-time data

### Data Sync Strategy
```javascript
// Sync user data from PostgreSQL to MongoDB
const syncUserToForum = async (userId, userData) => {
  await db.forumUserProfiles.updateOne(
    { userId: ObjectId(userId) },
    { 
      $set: {
        "author.username": userData.username,
        "author.displayName": userData.fullName,
        "author.avatar": userData.avatar,
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );
};
```

Thiết kế này cho phép Forum hoạt động như một **mạng xã hội học tập** hoàn chỉnh với khả năng mở rộng cao và hiệu suất tối ưu! 🎉
