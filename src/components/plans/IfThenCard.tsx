import { useState } from 'react'
import { Trash2, Pencil, Check, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { updateIfThenPlan, deleteIfThenPlan } from '../../services/ifThenService'
import type { IfThenPlan } from '../../types'
import clsx from 'clsx'

interface IfThenCardProps {
  plan: IfThenPlan
  onRefetch: () => void
}

export function IfThenCard({ plan, onRefetch }: IfThenCardProps) {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [trigger, setTrigger] = useState(plan.trigger_condition)
  const [action, setAction] = useState(plan.action_plan)
  const [saving, setSaving] = useState(false)

  async function handleToggleActive() {
    await updateIfThenPlan(plan.id, { active: !plan.active })
    onRefetch()
  }

  async function handleDelete() {
    if (!confirm(t('plans.confirmDelete'))) return
    await deleteIfThenPlan(plan.id)
    onRefetch()
  }

  async function handleSaveEdit() {
    if (!trigger.trim() || !action.trim()) return
    setSaving(true)
    try {
      await updateIfThenPlan(plan.id, { trigger_condition: trigger, action_plan: action })
      setEditing(false)
      onRefetch()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={clsx(
      'bg-surface border rounded-xl p-4 transition-all duration-200',
      plan.active ? 'border-border' : 'border-border/40 opacity-50'
    )}>
      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="text-accent text-xs font-bold uppercase tracking-widest block mb-1">{t('common.ifEllipsis')}</label>
            <input
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-foreground text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="text-success text-xs font-bold uppercase tracking-widest block mb-1">{t('common.thenIWill')}</label>
            <input
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full bg-background border border-border rounded px-3 py-2 text-foreground text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSaveEdit} disabled={saving} className="flex items-center gap-1 text-success text-xs font-bold uppercase tracking-widest hover:opacity-80">
              <Check size={12} /> {saving ? t('common.saving') : t('common.save')}
            </button>
            <button onClick={() => { setEditing(false); setTrigger(plan.trigger_condition); setAction(plan.action_plan) }} className="flex items-center gap-1 text-muted text-xs uppercase tracking-widest hover:text-foreground">
              <X size={12} /> {t('common.cancel')}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-1.5">
              <p className="text-foreground text-sm">
                <span className="text-accent font-bold text-xs uppercase tracking-widest me-2">{t('common.if')}</span>
                {plan.trigger_condition}
              </p>
              <p className="text-foreground text-sm">
                <span className="text-success font-bold text-xs uppercase tracking-widest me-2">{t('common.then')}</span>
                {plan.action_plan}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button onClick={() => setEditing(true)} className="text-muted hover:text-foreground transition-colors p-1">
                <Pencil size={13} />
              </button>
              <button onClick={handleDelete} className="text-muted hover:text-danger transition-colors p-1">
                <Trash2 size={13} />
              </button>
              <button
                onClick={handleToggleActive}
                className={clsx(
                  'text-xs font-bold uppercase tracking-widest px-2 py-1 rounded transition-colors',
                  plan.active
                    ? 'text-success bg-success/10 hover:bg-muted/10 hover:text-muted'
                    : 'text-muted bg-border/30 hover:bg-success/10 hover:text-success'
                )}
              >
                {plan.active ? t('plans.active') : t('plans.off')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
