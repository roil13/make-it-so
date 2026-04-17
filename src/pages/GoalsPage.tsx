import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Target } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { createMicroStep } from '../services/microStepService'
import { GoalCard } from '../components/goals/GoalCard'
import { WoopWizard } from '../components/woop/WoopWizard'
import { EmptyState } from '../components/shared/EmptyState'
import { Button } from '../components/shared/Button'
import { Modal } from '../components/shared/Modal'
import { Spinner } from '../components/shared/Spinner'
import type { Goal } from '../types'

export function GoalsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { goals, obstacles, ifThenPlans, microSteps, todayLogs, loading, refetch } = useData()
  const [searchParams, setSearchParams] = useSearchParams()
  const [wizardOpen, setWizardOpen] = useState(false)

  // Auto-open the wizard when redirected from onboarding tour (?wizard=1)
  useEffect(() => {
    if (!loading && searchParams.get('wizard') === '1' && goals.length === 0) {
      setWizardOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [loading, goals.length, searchParams, setSearchParams])
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [addStepGoalId, setAddStepGoalId] = useState<string | null>(null)
  const [newStepTitle, setNewStepTitle] = useState('')
  const [stepSaving, setStepSaving] = useState(false)

  const doneIds = new Set(todayLogs.map((l) => l.micro_step_id))

  async function handleAddMicroStep() {
    if (!user || !addStepGoalId || !newStepTitle.trim()) return
    setStepSaving(true)
    try {
      await createMicroStep(user.id, { goal_id: addStepGoalId, title: newStepTitle.trim(), description: '' })
      setAddStepGoalId(null)
      setNewStepTitle('')
      await refetch()
    } finally {
      setStepSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground font-black text-xl uppercase tracking-widest">{t('goals.title')}</h1>
        <Button size="sm" onClick={() => { setEditingGoal(null); setWizardOpen(true) }}>
          <Plus size={14} /> {t('goals.newGoal')}
        </Button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon={<Target size={48} />}
          title={t('goals.empty')}
          description={t('goals.emptyDesc')}
          action={<Button size="sm" onClick={() => setWizardOpen(true)}><Plus size={14} /> {t('goals.createFirst')}</Button>}
        />
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              obstacles={obstacles.filter((o) => o.goal_id === goal.id)}
              ifThenPlans={ifThenPlans.filter((p) => p.goal_id === goal.id)}
              microSteps={microSteps.filter((s) => s.goal_id === goal.id)}
              todayLogIds={doneIds}
              onEdit={(g) => { setEditingGoal(g); setWizardOpen(true) }}
              onAddMicroStep={(goalId) => { setAddStepGoalId(goalId); setNewStepTitle('') }}
              onRefetch={refetch}
            />
          ))}
        </div>
      )}

      {/* WOOP Wizard */}
      <WoopWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onComplete={refetch}
        initial={editingGoal ?? undefined}
      />

      {/* Add Micro-Step modal */}
      <Modal
        open={addStepGoalId !== null}
        onClose={() => setAddStepGoalId(null)}
        title={t('goals.addMicroStep')}
      >
        <div className="space-y-4">
          <p className="text-muted text-sm">{t('goals.microStepPrompt')}</p>
          <input
            autoFocus
            value={newStepTitle}
            onChange={(e) => setNewStepTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddMicroStep()}
            placeholder={t('goals.microStepPlaceholder')}
            maxLength={200}
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:border-accent"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setAddStepGoalId(null)}>{t('common.cancel')}</Button>
            <Button size="sm" onClick={handleAddMicroStep} disabled={stepSaving || !newStepTitle.trim()}>
              {stepSaving ? t('common.saving') : t('goals.addStep')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
