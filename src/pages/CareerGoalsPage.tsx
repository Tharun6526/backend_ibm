import { useState } from 'react'
import { CheckCircle2, Clock, AlertTriangle, Plus, Target, Trash2, X, Sparkles, Check } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, Badge, Button, Progress, Input } from '../components/ui'
import { mockGoals, type Goal } from '../data/mock'

const statusConfig: Record<Goal['status'], { variant: 'primary' | 'success' | 'warning'; icon: React.ReactNode }> = {
  'On Track':  { variant: 'primary',  icon: <Clock size={13} /> },
  'At Risk':   { variant: 'warning',  icon: <AlertTriangle size={13} /> },
  'Completed': { variant: 'success',  icon: <CheckCircle2 size={13} /> },
}

export function CareerGoalsPage() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState<Goal['status']>('On Track')
  const [milestoneInputs, setMilestoneInputs] = useState<string[]>(['', ''])

  const completedCount = goals.filter((g) => g.status === 'Completed').length

  const openNewGoalModal = () => {
    setEditingGoalId(null)
    setTitle('')
    setDescription('')
    setDueDate('December 2024')
    setStatus('On Track')
    setMilestoneInputs(['Complete core requirement', 'Submit applications'])
    setIsModalOpen(true)
  }

  const openEditGoalModal = (goal: Goal) => {
    setEditingGoalId(goal.id)
    setTitle(goal.title)
    setDescription(goal.description)
    setDueDate(goal.dueDate)
    setStatus(goal.status)
    setMilestoneInputs(goal.milestones.map((m) => m.label))
    setIsModalOpen(true)
  }

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const validMilestones = milestoneInputs
      .filter((m) => m.trim().length > 0)
      .map((m) => ({ label: m.trim(), done: false }))

    if (editingGoalId) {
      setGoals((prev) =>
        prev.map((g) => {
          if (g.id === editingGoalId) {
            // preserve done states if labels match
            const updatedMilestones = validMilestones.map((vm) => {
              const existing = g.milestones.find((em) => em.label === vm.label)
              return existing ? existing : vm
            })
            const doneCount = updatedMilestones.filter((m) => m.done).length
            const newProgress = updatedMilestones.length > 0 ? Math.round((doneCount / updatedMilestones.length) * 100) : g.progress
            return {
              ...g,
              title,
              description,
              dueDate,
              status,
              milestones: updatedMilestones,
              progress: newProgress,
            }
          }
          return g
        })
      )
    } else {
      const newGoal: Goal = {
        id: `goal-${Date.now()}`,
        title,
        description,
        status,
        progress: 0,
        dueDate: dueDate || 'December 2024',
        milestones: validMilestones.length > 0 ? validMilestones : [{ label: 'Initial planning step', done: false }],
      }
      setGoals((prev) => [newGoal, ...prev])
    }

    setIsModalOpen(false)
  }

  const toggleMilestone = (goalId: string, milestoneIndex: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const updated = g.milestones.map((m, idx) =>
            idx === milestoneIndex ? { ...m, done: !m.done } : m
          )
          const doneCount = updated.filter((m) => m.done).length
          const newProgress = Math.round((doneCount / updated.length) * 100)
          const newStatus: Goal['status'] =
            newProgress === 100 ? 'Completed' : g.status === 'Completed' ? 'On Track' : g.status

          return {
            ...g,
            milestones: updated,
            progress: newProgress,
            status: newStatus,
          }
        }
        return g
      })
    )
  }

  const markGoalCompleted = (goalId: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          return {
            ...g,
            status: 'Completed',
            progress: 100,
            milestones: g.milestones.map((m) => ({ ...m, done: true })),
          }
        }
        return g
      })
    )
  }

  const deleteGoal = (goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId))
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-surface-900">Career Goals</h2>
          <p className="text-sm text-surface-500 mt-0.5">
            {completedCount}/{goals.length} goals completed
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus size={15} />}
          className="sm:ml-auto"
          onClick={openNewGoalModal}
        >
          New Goal
        </Button>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal) => {
          const cfg = statusConfig[goal.status]

          return (
            <Card key={goal.id} padding="lg">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>{goal.title}</CardTitle>
                    <CardDescription className="mt-1">{goal.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={cfg.variant} dot>
                      {goal.status}
                    </Badge>
                  </div>
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

              {/* Interactive Milestones */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {goal.milestones.map((m, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleMilestone(goal.id, i)}
                    className="flex items-center gap-2 text-sm py-1.5 px-2 rounded-lg hover:bg-surface-50 transition-colors text-left group cursor-pointer"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        m.done
                          ? 'bg-success-500 border-success-500 text-white'
                          : 'border-surface-300 group-hover:border-brand-400'
                      }`}
                    >
                      {m.done && <Check size={12} />}
                    </div>
                    <span className={m.done ? 'text-surface-400 line-through' : 'text-surface-700 font-medium'}>
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>

              <CardFooter>
                <span className="text-xs text-surface-400 flex items-center gap-1">
                  <Target size={11} />
                  Due {goal.dueDate}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <Button variant="ghost" size="xs" onClick={() => openEditGoalModal(goal)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-danger-600 hover:bg-danger-50"
                    onClick={() => deleteGoal(goal.id)}
                  >
                    <Trash2 size={13} />
                  </Button>
                  {goal.status !== 'Completed' && (
                    <Button variant="outline" size="xs" onClick={() => markGoalCompleted(goal.id)}>
                      Mark Done
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          )
        })}

        {goals.length === 0 && (
          <Card padding="lg" className="text-center py-12">
            <Sparkles size={32} className="text-brand-400 mx-auto mb-3" />
            <p className="text-surface-800 font-semibold">No career goals set yet</p>
            <p className="text-sm text-surface-500 mt-1 max-w-sm mx-auto">
              Set clear target milestones to track your progress towards landing your dream role!
            </p>
            <Button variant="primary" size="sm" className="mt-4" onClick={openNewGoalModal}>
              Create First Goal
            </Button>
          </Card>
        )}
      </div>

      {/* Add / Edit Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-surface-200 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-surface-900">
                {editingGoalId ? 'Edit Career Goal' : 'Create New Career Goal'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                  Goal Title
                </label>
                <Input
                  fullWidth
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Land a Senior Frontend Engineer Role"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                  Description & Details
                </label>
                <Input
                  fullWidth
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Target top tech companies, $140k+ salary target"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                    Target Due Date
                  </label>
                  <Input
                    fullWidth
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    placeholder="e.g. December 2024"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Goal['status'])}
                    className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-white text-sm text-surface-700 focus:ring-2 focus:ring-brand-400 focus:outline-none"
                  >
                    <option value="On Track">On Track</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-1">
                  Milestones
                </label>
                <div className="space-y-2">
                  {milestoneInputs.map((val, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input
                        fullWidth
                        value={val}
                        onChange={(e) => {
                          const updated = [...milestoneInputs]
                          updated[idx] = e.target.value
                          setMilestoneInputs(updated)
                        }}
                        placeholder={`Milestone #${idx + 1}`}
                      />
                      {milestoneInputs.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          className="text-danger-500"
                          onClick={() => {
                            setMilestoneInputs(milestoneInputs.filter((_, i) => i !== idx))
                          }}
                        >
                          <X size={14} />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    leftIcon={<Plus size={12} />}
                    onClick={() => setMilestoneInputs([...milestoneInputs, ''])}
                  >
                    Add Milestone
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-surface-100 flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  {editingGoalId ? 'Save Changes' : 'Create Goal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
