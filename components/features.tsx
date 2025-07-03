import { CheckCircle, Clock, Users, BarChart3, Bell, Shield } from "lucide-react"

const features = [
  {
    icon: CheckCircle,
    title: "Task Management",
    description: "Create, organize, and track tasks with ease. Set priorities and due dates.",
  },
  {
    icon: Users,
    title: "Project Organization",
    description: "Group tasks into projects and collaborate with your team effectively.",
  },
  {
    icon: Clock,
    title: "Deadline Tracking",
    description: "Never miss a deadline with smart notifications and calendar integration.",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description: "Track your productivity with detailed analytics and progress reports.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Get notified about important tasks and upcoming deadlines.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is encrypted and secure. We respect your privacy.",
  },
]

export function Features() {
  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to stay productive</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to help you manage tasks, projects, and deadlines efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
              <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
