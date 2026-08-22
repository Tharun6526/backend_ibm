import { CheckCircle2, Clock, AlertTriangle, Plus, Target } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, Badge, Button, Progress } from '../components/ui'
import { mockGoals, type Goal } from '../data/mock'

const statusConfig: Record<Goal['status'], { variant: 'primary' | 'success' | 'warning'; icon: React.ReactNode }> = {
  'On Track':  { variant: 'primary',  icon: <Clock size={13} /> },
  'At Risk':   { variant: 'warning',  icon: <AlertTriangle size={13} /> },
  'Completed': { variant: 'success',  icon: <CheckCircle2 size={13} /> },
}

export function CareerGoalsPage() {
  const completed = mockGoals.filter((g) => g.status === 'Completed').length

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-surface-900">Career Goals</h2>
          <p className="text-sm text-surface-500 mt-0.5">
            {completed}/{mockGoals.length} goals completed
          </p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus size={15} />} className="sm:ml-auto">
          New Goal
        </Button>
      </div>

      {/* Goals */}
      <div className="space-y-4">
        {mockGoals.map((goal) => {
          const cfg = statusConfig[goal.status]

          return (
            <Card key={goal.id} padding="lg">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>{goal.title}</CardTitle>
                    <CardDescription className="mt-1">{goal.description}</CardDescription>
                  </div>
                  <Badge variant={cfg.variant} dot>
                    {goal.status}
                  </Badge>
                </div>
              </CardHeader>

              <div className="mt-4">
                <Progress
                  value={goal.progress}
                  label="Progress"
                  showLabel
                  color={
                    goal.status === 'Completed' ? 'success'
                    : goal.status === 'At Risk'  ? 'warning'
                    : 'brand'
                  }
                  size="md"
                />
              </div>

              {/* Milestones */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {goal.milestones.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm py-1"
                  >
                    <CheckCircle2
                      size={15}
                      className={m.done ? 'text-success-500' : 'text-surface-200'}
                    />
                    <span className={m.done ? 'text-surface-400 line-through' : 'text-surface-700'}>
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>

              <CardFooter>
                <span className="text-xs text-surface-400 flex items-center gap-1">
                  <Target size={11} />
                  Due {goal.dueDate}
                </span>
                <div className="ml-auto flex gap-2">
                  <Button variant="ghost" size="xs">Edit</Button>
                  {goal.status !== 'Completed' && (
                    <Button variant="outline" size="xs">Mark Done</Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
