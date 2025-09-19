import { Metadata } from 'next';
import {
  AcademicCapIcon,
  UserGroupIcon,
  TrophyIcon,
  HeartIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Về chúng tôi - Khởi Trí Số',
  description: 'Tìm hiểu về sứ mệnh, tầm nhìn và đội ngũ của Khởi Trí Số - nền tảng giáo dục trực tuyến hàng đầu Việt Nam',
};

const stats = [
  { id: 1, name: 'Học viên', value: '50,000+', icon: UserGroupIcon },
  { id: 2, name: 'Khóa học', value: '500+', icon: AcademicCapIcon },
  { id: 3, name: 'Giảng viên', value: '100+', icon: UserGroupIcon },
  { id: 4, name: 'Chứng chỉ đã cấp', value: '25,000+', icon: TrophyIcon },
];

const values = [
  {
    name: 'Chất lượng',
    description: 'Cam kết cung cấp nội dung giáo dục chất lượng cao từ các chuyên gia hàng đầu',
    icon: TrophyIcon,
  },
  {
    name: 'Đổi mới',
    description: 'Không ngừng cải tiến công nghệ và phương pháp giảng dạy để mang lại trải nghiệm tốt nhất',
    icon: LightBulbIcon,
  },
  {
    name: 'Tận tâm',
    description: 'Đặt học viên làm trung tâm, hỗ trợ tận tình trong suốt hành trình học tập',
    icon: HeartIcon,
  },
  {
    name: 'Tin cậy',
    description: 'Xây dựng niềm tin thông qua sự minh bạch và uy tín trong mọi hoạt động',
    icon: ShieldCheckIcon,
  },
];

const team = [
  {
    name: 'Nguyễn Văn An',
    role: 'Giám đốc điều hành',
    bio: 'Hơn 15 năm kinh nghiệm trong lĩnh vực giáo dục và công nghệ. Tốt nghiệp Thạc sĩ Khoa học Máy tính tại Đại học Stanford.',
    avatar: '/images/team/ceo.jpg',
  },
  {
    name: 'Trần Thị Bình',
    role: 'Giám đốc Học thuật',
    bio: 'Tiến sĩ Giáo dục học với 20 năm kinh nghiệm giảng dạy và nghiên cứu phương pháp học tập hiệu quả.',
    avatar: '/images/team/cdo.jpg',
  },
  {
    name: 'Lê Văn Cường',
    role: 'Giám đốc Công nghệ',
    bio: 'Chuyên gia công nghệ với kinh nghiệm phát triển các hệ thống giáo dục quy mô lớn tại các công ty công nghệ hàng đầu.',
    avatar: '/images/team/cto.jpg',
  },
  {
    name: 'Phạm Thị Dung',
    role: 'Giám đốc Marketing',
    bio: 'Hơn 12 năm kinh nghiệm trong marketing giáo dục và xây dựng thương hiệu tại các tập đoàn giáo dục lớn.',
    avatar: '/images/team/cmo.jpg',
  },
];

const milestones = [
  {
    year: '2020',
    title: 'Thành lập Khởi Trí Số',
    description: 'Ra mắt với sứ mệnh democratize education - đưa giáo dục chất lượng cao đến với mọi người.',
  },
  {
    year: '2021',
    title: 'Mở rộng nội dung',
    description: 'Phát triển hơn 100 khóa học đầu tiên với sự tham gia của các giảng viên uy tín.',
  },
  {
    year: '2022',
    title: 'Đạt 10,000 học viên',
    description: 'Cột mốc quan trọng với 10,000 học viên đầu tiên và ra mắt ứng dụng di động.',
  },
  {
    year: '2023',
    title: 'Mở rộng quốc tế',
    description: 'Bắt đầu cung cấp dịch vụ tại các nước Đông Nam Á và đạt 25,000 học viên.',
  },
  {
    year: '2024',
    title: 'Đổi mới công nghệ',
    description: 'Tích hợp AI và VR/AR vào trải nghiệm học tập, đạt 50,000 học viên.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-green-500 py-24 sm:py-32">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Về Khởi Trí Số
            </h1>
            <p className="mt-6 text-xl leading-8 text-gray-100 max-w-3xl mx-auto">
              Chúng tôi tin rằng giáo dục chất lượng cao phải được tiếp cận bởi tất cả mọi người, 
              bất kể họ ở đâu hay hoàn cảnh ra sao.
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <LightBulbIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <h2 className="ml-4 text-3xl font-bold text-gray-900">Sứ mệnh</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Khởi Trí Số được thành lập với sứ mệnh democratize education - 
                mang giáo dục chất lượng cao đến với mọi người, mọi lúc, mọi nơi. 
                Chúng tôi tin rằng việc học tập không nên bị giới hạn bởi địa lý, 
                thời gian hay điều kiện kinh tế.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  'Cung cấp nội dung giáo dục chất lượng cao',
                  'Hỗ trợ học viên trong suốt hành trình học tập',
                  'Kết nối học viên với các chuyên gia hàng đầu',
                  'Ứng dụng công nghệ tiên tiến vào giáo dục'
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <GlobeAltIcon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <h2 className="ml-4 text-3xl font-bold text-gray-900">Tầm nhìn</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Trở thành nền tảng giáo dục trực tuyến hàng đầu khu vực Đông Nam Á, 
                góp phần nâng cao chất lượng nguồn nhân lực và thúc đẩy sự phát triển 
                bền vững của xã hội thông qua giáo dục.
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="text-2xl font-bold text-blue-600 mb-2">2025</div>
                  <p className="text-sm text-gray-700">Mở rộng ra 5 quốc gia ASEAN</p>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="text-2xl font-bold text-green-600 mb-2">100K+</div>
                  <p className="text-sm text-gray-700">Học viên trên toàn khu vực</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="text-2xl font-bold text-purple-600 mb-2">1000+</div>
                  <p className="text-sm text-gray-700">Khóa học đa dạng</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-6">
                  <div className="text-2xl font-bold text-yellow-600 mb-2">AI-Powered</div>
                  <p className="text-sm text-gray-700">Trải nghiệm học tập cá nhân hóa</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Khởi Trí Số trong con số
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Những thành tựu chúng tôi đã đạt được cùng cộng đồng học tập
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-lg text-gray-600">{stat.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Giá trị cốt lõi
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Những giá trị này định hướng mọi hoạt động của chúng tôi và tạo nên văn hóa doanh nghiệp độc đáo
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.name} className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-6">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.name}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Hành trình phát triển
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Những cột mốc quan trọng trong quá trình xây dựng và phát triển Khởi Trí Số
            </p>
          </div>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gray-200"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className={`relative flex items-center ${
                  index % 2 === 0 ? 'justify-start' : 'justify-end'
                }`}>
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg z-10"></div>
                  
                  {/* Content */}
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{milestone.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Đội ngũ lãnh đạo
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Những con người tài năng và tận tâm đang xây dựng tương lai của giáo dục
            </p>
          </div>
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((person) => (
              <div key={person.name} className="text-center">
                <div className="mx-auto h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6">
                  <UserGroupIcon className="h-16 w-16 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{person.name}</h3>
                <p className="text-blue-600 font-medium mb-4">{person.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{person.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Sẵn sàng bắt đầu hành trình học tập?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn học viên đang khám phá kiến thức mới mỗi ngày tại Khởi Trí Số
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              Đăng ký miễn phí
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Khám phá khóa học
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}