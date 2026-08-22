import { clsx } from 'clsx'
import { CheckCircle2, AlertTriangle, TrendingUp, BookOpen, Target } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Progress } from '../components/ui'
import { mockSkills } from '../data/mock'

const categoryColors: Record<string, string> = {
  Frontend:     'bg-brand-50 text-brand-700 border-brand-100',
  Backend:      'bg-violet-50 text-violet-700 border-violet-100',
  Architecture: 'bg-orange-50 text-orange-700 border-orange-100',
  Quality:      'bg-teal-50 text-teal-700 border-teal-100',
  DevOps:       'bg-sky-50 text-sky-700 border-sky-100',
}

export function SkillGapPage() {
  const categories = [...new Set(mockSkills.map((s) => s.category))]
  const overallGapScore = Math.round(
    mockSkills.reduce((sum, s) => sum + Math.min(s.current / s.required, 1), 0) /
      mockSkills.length * 100
  )

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-surface-900">Skill Gap Analysis</h2>
          <p className="text-sm text-surface-500 mt-0.5">
            See how your skills compare to your target roles
          </p>
        </div>
        <Badge variant="primary" size="lg" dot className="sm:ml-auto">
          {overallGapScore}% overall readiness
        </Badge>
      </div>

      {/* Overview card */}
      <Card className="bg-gradient-to-r from-brand-500 to-accent-600 border-0 text-white">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1">
            <p className="text-brand-100 text-sm font-medium">Readiness Score</p>
            <p className="text-5xl font-bold mt-1">{overallGapScore}%</p>
            <p className="text-brand-200 text-sm mt-2">
              You're close! Focus on TypeScript and System Design to boost your score.
            </p>
          </div>
          <div className="flex-1 w-full">
            <Progress
              value={overallGapScore}
              size="xl"
              color="info"
              className="[&_.text-xs]:text-brand-200"
            />
            <div className="flex justify-between text-xs text-brand-200 mt-2">
              <span>0% — Beginner</span>
              <span>100% — Ready to apply</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Category breakdown */}
      {categories.map((cat) => {
        const catSkills = mockSkills.filter((s) => s.category === cat)
        return (
          <Card key={cat}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium border', categoryColors[cat] ?? 'bg-surface-100 text-surface-700 border-surface-200')}>
                  {cat}
                </span>
                <CardTitle className="text-sm">{catSkills.length} skills</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-4 space-y-5">
                {catSkills.map((skill) => {
                  const gap = skill.required - skill.current
                  const readiness = Math.min(skill.current / skill.required, 1)
                  const isGood = readiness >= 1
                  const isWarning = readiness >= 0.8 && readiness < 1

                  return (
                    <div key={skill.name}>
                      <div className="flex items-center justify-between mb-1.5 gap-4">
                        <div className="flex items-center gap-2 min-w-0">
                          {isGood
                            ? <CheckCircle2 size={14} className="text-success-500 flex-shrink-0" />
                            : isWarning
                            ? <AlertTriangle size={14} className="text-warning-500 flex-shrink-0" />
                            : <TrendingUp size={14} className="text-brand-500 flex-shrink-0" />
                          }
                          <span className="text-sm font-medium text-surface-800 truncate">{skill.name}</span>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 text-xs">
                          {!isGood && (
                            <span className="text-warning-600 font-medium">{gap}pt gap</span>
                          )}
                          <span className="text-surface-500">{skill.current}/{skill.required}</span>
                          {isGood && <Badge variant="success" size="sm">✓ Met</Badge>}
                        </div>
                      </div>

                      <div className="relative h-2.5 rounded-full bg-surface-100 overflow-visible">
                        {/* Required level marker */}
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-surface-400 z-10 rounded-full"
                          style={{ left: `${skill.required}%` }}
                          title={`Required: ${skill.required}`}
                        />
                        <div
                          className={clsx(
                            'h-full rounded-full transition-all duration-700',
                            isGood    ? 'bg-success-500' :
                            isWarning ? 'bg-warning-500' :
                                        'bg-brand-500'
                          )}
                          style={{ width: `${skill.current}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* CTA */}
      <Card variant="flat" className="text-center py-6">
        <BookOpen size={32} className="mx-auto text-brand-400 mb-3" />
        <h3 className="font-semibold text-surface-800">Ready to close the gaps?</h3>
        <p className="text-sm text-surface-500 mt-1 mb-4">
          Our AI can build you a personalised learning plan based on your skill profile.
        </p>
        <Button variant="primary" leftIcon={<Target size={15} />}>
          Generate Learning Plan
        </Button>
      </Card>
    </div>
  )
}
