import { Download, Eye, Wand2, CheckCircle2, Plus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, Badge, Button, Progress } from '../components/ui'

const resumeSections = [
  { label: 'Contact Info',      complete: true,  score: 100 },
  { label: 'Work Experience',   complete: true,  score: 95  },
  { label: 'Education',         complete: true,  score: 100 },
  { label: 'Skills',            complete: true,  score: 90  },
  { label: 'Projects',          complete: false, score: 60  },
  { label: 'Certifications',    complete: false, score: 0   },
]

const suggestions = [
  { text: 'Add quantifiable metrics to work experience bullet points', severity: 'high' as const },
  { text: 'Include 2 more technical projects to showcase skills',       severity: 'medium' as const },
  { text: 'Add relevant certifications (AWS, GCP, etc.)',               severity: 'medium' as const },
  { text: 'Optimize keywords for ATS scanning',                         severity: 'low' as const },
]

const severityStyles = {
  high:   'bg-danger-50 text-danger-700 border-danger-100',
  medium: 'bg-warning-50 text-warning-700 border-warning-100',
  low:    'bg-info-50 text-info-700 border-info-100',
}

export function ResumeBuilderPage() {
  const overallScore = Math.round(
    resumeSections.reduce((sum, s) => sum + s.score, 0) / resumeSections.length
  )

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-surface-900">Resume Builder</h2>
          <p className="text-sm text-surface-500 mt-0.5">Build and optimise your resume for ATS</p>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <Button variant="secondary" size="sm" leftIcon={<Eye size={14} />}>Preview</Button>
          <Button variant="primary"   size="sm" leftIcon={<Download size={14} />}>Export PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: resume sections */}
        <div className="lg:col-span-2 space-y-4">
          {resumeSections.map((section) => (
            <Card key={section.label} padding="md" hoverable>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {section.complete
                    ? <CheckCircle2 size={16} className="text-success-500 flex-shrink-0" />
                    : <Plus size={16} className="text-surface-300 flex-shrink-0" />
                  }
                  <span className="text-sm font-medium text-surface-800">{section.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-surface-500">{section.score}/100</span>
                  {section.complete
                    ? <Badge variant="success" size="sm">Complete</Badge>
                    : <Badge variant="default" size="sm">Missing</Badge>
                  }
                  <Button variant="ghost" size="xs">Edit</Button>
                </div>
              </div>
              {section.complete && (
                <Progress
                  value={section.score}
                  size="xs"
                  color={section.score >= 90 ? 'success' : section.score >= 70 ? 'brand' : 'warning'}
                  className="mt-3"
                />
              )}
            </Card>
          ))}
        </div>

        {/* Right: score + suggestions */}
        <div className="space-y-4">
          <Card className="text-center" padding="lg">
            <div className="w-16 h-16 rounded-full bg-brand-50 border-4 border-brand-200 flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-brand-600">{overallScore}</span>
            </div>
            <p className="text-sm font-semibold text-surface-800 mt-3">Resume Score</p>
            <p className="text-xs text-surface-500 mt-1">Top 15% of applicants</p>
            <Progress
              value={overallScore}
              size="md"
              color="brand"
              className="mt-4"
            />
            <Button
              variant="primary"
              size="sm"
              fullWidth
              leftIcon={<Wand2 size={14} />}
              className="mt-4"
            >
              AI Improve
            </Button>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Suggestions</CardTitle>
              <CardDescription className="mt-0.5">Improvements to boost your score</CardDescription>
            </CardHeader>
            <div className="mt-4 space-y-2">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className={`text-xs px-3 py-2 rounded-lg border ${severityStyles[s.severity]}`}
                >
                  {s.text}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
