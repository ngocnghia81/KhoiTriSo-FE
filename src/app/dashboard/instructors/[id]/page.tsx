'use client';

import { useParams } from 'next/navigation';
import { useInstructorDetail } from '@/hooks/useInstructors';
import Link from 'next/link';
import {
  AcademicCapIcon,
  BookOpenIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  StarIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ChartBarIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

export default function InstructorDetailPage() {
  const params = useParams();
  const id = params?.id ? parseInt(params.id as string) : 0;
  const { data, loading, error } = useInstructorDetail(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-center">
          <p className="text-xl font-semibold">Error loading instructor</p>
          <p className="text-sm mt-2">{error || 'Instructor not found'}</p>
          <Link
            href="/dashboard/instructors"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href="/dashboard/instructors"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Instructors
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {data.Avatar ? (
                <img
                  src={data.Avatar}
                  alt={data.FullName || data.Username}
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-blue-100">
                  <span className="text-white font-bold text-4xl">
                    {(data.FullName || data.Username).charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {data.FullName || data.Username}
                  </h1>
                  <p className="text-gray-600 mt-1">Instructor</p>
                  <div className="flex items-center mt-2">
                    <StarIcon className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                    <span className="ml-2 text-2xl font-bold text-gray-900">
                      {data.AverageRating.toFixed(1)}
                    </span>
                    <span className="ml-2 text-gray-500">Average Rating</span>
                  </div>
                </div>
                <Link
                  href={`/dashboard/instructors/${id}/analytics`}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  View Analytics
                </Link>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-gray-700">
                  <EnvelopeIcon className="h-5 w-5 mr-3 text-gray-400" />
                  <span>{data.Email}</span>
                </div>
                {data.Phone && (
                  <div className="flex items-center text-gray-700">
                    <PhoneIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <span>{data.Phone}</span>
                  </div>
                )}
                {data.Address && (
                  <div className="flex items-center text-gray-700">
                    <MapPinIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <span>{data.Address}</span>
                  </div>
                )}
              </div>

              {/* Status Badges */}
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  data.IsActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {data.IsActive ? 'Active' : 'Inactive'}
                </span>
                {data.EmailVerified && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Email Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900">{data.TotalCourses}</p>
              </div>
              <AcademicCapIcon className="h-12 w-12 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Books</p>
                <p className="text-3xl font-bold text-gray-900">{data.TotalBooks}</p>
              </div>
              <BookOpenIcon className="h-12 w-12 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{data.TotalStudents}</p>
              </div>
              <UserGroupIcon className="h-12 w-12 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">${data.TotalEarnings.toLocaleString()}</p>
              </div>
              <CurrencyDollarIcon className="h-12 w-12 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500">Learning Paths</p>
              <p className="text-2xl font-bold text-gray-900">{data.TotalLearningPaths}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{data.Stats.TotalReviews}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Lessons</p>
              <p className="text-2xl font-bold text-gray-900">{data.Stats.TotalLessons}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{data.Stats.CompletionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Courses */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Courses ({data.Courses.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.Courses.map((course) => (
              <div key={course.Id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                {course.Thumbnail && (
                  <img
                    src={course.Thumbnail}
                    alt={course.Title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <h3 className="font-semibold text-gray-900 mb-2">{course.Title}</h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{course.Enrollments} students</span>
                  <span className="font-semibold text-green-600">${course.Price}</span>
                </div>
                <div className="flex items-center mt-2">
                  <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="ml-1 text-sm text-gray-700">{course.Rating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Books */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Books ({data.Books.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.Books.map((book) => (
              <div key={book.Id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                {book.CoverImage && (
                  <img
                    src={book.CoverImage}
                    alt={book.Title}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                )}
                <h3 className="font-semibold text-gray-900 mb-2">{book.Title}</h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{book.Sales} sales</span>
                  <span className="font-semibold text-green-600">${book.Price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Paths */}
        {data.LearningPaths.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Learning Paths ({data.LearningPaths.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.LearningPaths.map((path) => (
                <div key={path.Id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {path.Thumbnail && (
                    <img
                      src={path.Thumbnail}
                      alt={path.Title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-semibold text-gray-900 mb-2">{path.Title}</h3>
                  <div className="text-sm text-gray-500">{path.Enrollments} enrollments</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
