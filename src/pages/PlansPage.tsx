import { useState } from 'react'
import { Plus, Lightbulb } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { createIfThenPlan } from '../services/ifThenService'
import { createObstacle } from '../services/obstacleService'
import { IfThenCard } from '../components/plans/IfThenCard'
import { EmptyState } from '../components/shared/EmptyState'
import { Button } from '../components/shared/Button'
import { Modal } from '../components/shared/Modal'
import { Spinner } from '../components/shared/Spinner'

export function PlansPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { goals, obstacles, ifThenPlans, loading, refetch } = useData()
  const [addModal, setAddModal] = useState(false)
  const [newGoalId, setNewGoalId] = useState('')
  const [newObstacle, setNewObstacle] = useState('')
  const [newTrigger, setNewTrigger] = useState('')
  const [newAction, setNewAction] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  function openAdd() {
    setNewGoalId(goals[0]?.id ?? '')
    setNewObstacle('')
    setNewTrigger('')
    setNewAction('')
    setSaveError('')
    setAddModal(true)
  }

  async function handleAddPlan() {
    if (!user || !newGoalId || !newAction.trim()) return
    setSaving(true)
    setSaveError('')
    try {
      const obs = await createObstacle(user.id, newGoalId, newObstacle || newTrigger || 'New obstacle', obstacles.filter((o) => o.goal_id === newGoalId).length)
      await createIfThenPlan(user.id, {
        obstacle_id: obs.id,
        goal_id: newGoalId,
        trigger_condition: newTrigger.trim() || newObstacle.trim() || 'When this happens',
        action_plan: newAction.trim(),
      })
      setAddModal(false)
      await refetch()
    } catch {
      setSaveError(t('plans.failedToSave'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>

  // Group plans by goal
  const plansByGoal = goals.map((goal) => ({
    goal,
    plans: ifThenPlans.filter((p) => p.goal_id === goal.id),
  })).filter(({ plans }) => plans.length > 0)

  const hasPlans = ifThenPlans.length > 0

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-foreground font-black text-xl uppercase tracking-widest">{t('plans.title')}</h1>
        {goals.length > 0 && (
          <Button size="sm" onClick={openAdd}>
            <Plus size={14} /> {t('plans.addPlan')}
          </Button>
        )}
      </div>

      {!hasPlans ? (
        <EmptyState
          icon={<Lightbulb size={48} />}
          title={t('plans.empty')}
          description={t('plans.emptyDesc')}
          action={goals.length > 0 ? <Button size="sm" onClick={openAdd}><Plus size={14} /> {t('plans.addPlan')}</Button> : undefined}
        />
      ) : (
        <div className="space-y-6">
          {plansByGoal.map(({ goal, plans }) => (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: goal.color }} />
                <p className="text-muted text-xs uppercase tracking-widest">{goal.title}</p>
              </div>
              {plans.map((plan) => (
                <IfThenCard key={plan.id} plan={plan} onRefetch={refetch} />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Add Plan Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title={t('plans.newPlan')}>
        <div className="space-y-4">
          <div>
            <label className="text-muted text-xs uppercase tracking-widest block mb-1.5">{t('plans.goal')}</label>
            <select
              value={newGoalId}
              onChange={(e) => setNewGoalId(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-foreground text-sm focus:outline-none focus:border-accent"
            >
              {goals.map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-muted text-xs uppercase tracking-widest block mb-1.5">{t('plans.obstacleOptional')}</label>
            <input
              value={newObstacle}
              onChange={(e) => { setNewObstacle(e.target.value); if (!newTrigger) setNewTrigger(e.target.value) }}
              placeholder={t('plans.obstaclePlaceholder')}
              maxLength={200}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-foreground text-sm placeholder-muted focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-accent text-xs font-bold uppercase tracking-widest block mb-1.5">{t('common.ifEllipsis')}</label>
            <input
              value={newTrigger}
              onChange={(e) => setNewTrigger(e.target.value)}
              placeholder={t('plans.ifPlaceholder')}
              maxLength={500}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-foreground text-sm placeholder-muted focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-success text-xs font-bold uppercase tracking-widest block mb-1.5">{t('common.thenIWill')}</label>
            <input
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              placeholder={t('plans.thenPlaceholder')}
              maxLength={500}
              className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-foreground text-sm placeholder-muted focus:outline-none focus:border-accent"
            />
          </div>
          {saveError && <p className="text-danger text-sm">{saveError}</p>}
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setAddModal(false)}>{t('common.cancel')}</Button>
            <Button size="sm" onClick={handleAddPlan} disabled={saving || !newAction.trim()}>
              {saving ? t('common.saving') : t('plans.addPlan')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
