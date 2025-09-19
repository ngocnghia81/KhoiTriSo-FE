# Khởi Trí Số - Frontend

Nền tảng giáo dục trực tuyến **Khởi Trí Số** được xây dựng với Next.js 15, TypeScript và Tailwind CSS.

## 🚀 Tính năng chính

- **Khóa học trực tuyến**: Video bài giảng, bài tập tương tác
- **Sách điện tử**: Kích hoạt mã ID, video giải bài tập
- **Diễn đàn học tập**: Hỏi đáp, thảo luận cộng đồng
- **Hệ thống bài tập**: Trắc nghiệm, tự động chấm điểm
- **Hồ sơ giảng viên**: Static pages với JSON data
- **Responsive Design**: Tối ưu cho mọi thiết bị

## 🛠️ Công nghệ sử dụng

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI
- **Icons**: Heroicons
- **Forms**: React Hook Form
- **Animations**: Framer Motion

## 📦 Cài đặt

```bash
# Clone repository
git clone <repository-url>
cd khoitriso-fe

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## 📁 Cấu trúc project

```
khoitriso-fe/
├── src/
│   ├── app/                    # App Router (Next.js 13+)
│   │   ├── courses/           # Trang khóa học
│   │   ├── books/             # Sách điện tử
│   │   ├── forum/             # Diễn đàn
│   │   ├── assignments/       # Bài tập
│   │   └── teachers/          # Giảng viên
│   ├── components/            # React components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ...
│   ├── data/                  # Static data (JSON)
│   │   └── teachers.json
│   └── lib/                   # Utilities, helpers
├── public/                    # Static assets
│   ├── images/
│   └── icons/
├── package.json
└── README.md
```

## 🎨 Thiết kế

### Color Scheme
- **Primary**: Blue (#3B82F6)
- **Secondary**: Purple (#8B5CF6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Font weights 600-800
- **Body**: Font weight 400-500

## 🔧 Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Linting
npm run lint
```

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🌟 Tính năng đặc biệt

### Static Pages cho SEO
- Khóa học miễn phí sử dụng static generation
- Hồ sơ giảng viên với structured data
- Diễn đàn với static pages cho câu hỏi

### Performance Optimization
- Image optimization với Next.js Image
- Code splitting tự động
- Lazy loading components
- CSS optimization với Tailwind

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support

## 🔗 API Integration

Project được thiết kế để tích hợp với backend API:

```typescript
// Example API endpoints
/api/courses          # Danh sách khóa học
/api/courses/:id      # Chi tiết khóa học
/api/books/activate   # Kích hoạt sách
/api/forum/questions  # Câu hỏi diễn đàn
/api/assignments      # Bài tập
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📈 Performance Metrics

- **Lighthouse Score**: 95+
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.0s

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

Copyright © 2024 Khởi Trí Số. All rights reserved.

## 📞 Contact

- **Team**: Khởi Trí Số Development Team
- **Email**: dev@khoitriso.edu.vn
- **Website**: https://khoitriso.edu.vn
