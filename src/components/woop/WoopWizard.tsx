import { useState } from 'react'
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../shared/Button'
import { createGoal } from '../../services/goalService'
import { createObstacle } from '../../services/obstacleService'
import { createIfThenPlan } from '../../services/ifThenService'
import { createMicroStep } from '../../services/microStepService'
import { useAuth } from '../../contexts/AuthContext'
import type { Goal } from '../../types'

const COLORS = [
  '#48CAE4', '#52B788', '#95D5B2', '#F4A261', '#E76F51',
  '#A8DADC', '#457B9D', '#E9C46A', '#D96250', '#B5838D',
]

const CATEGORY_KEYS = ['Health', 'Career', 'Relationships', 'Learning', 'Finance', 'Creativity', 'Spirituality', 'Other']

interface WoopWizardProps {
  open: boolean
  onClose: () => void
  onComplete: () => void
  initial?: Goal
}

interface FormState {
  title: string
  category: string
  color: string
  description: string
  why: string
  best_outcome: string
  obstacles: string[]
  ifThen: { trigger: string; action: string }[]
  microStep: string
}

const TOTAL_STEPS = 7

export function WoopWizard({ open, onClose, onComplete, initial }: WoopWizardProps) {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'he'
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<FormState>({
    title: initial?.title ?? '',
    category: initial?.category ?? 'Health',
    color: initial?.color ?? COLORS[0],
    description: initial?.description ?? '',
    why: initial?.why ?? '',
    best_outcome: initial?.best_outcome ?? '',
    obstacles: ['', '', ''],
    ifThen: [
      { trigger: '', action: '' },
      { trigger: '', action: '' },
      { trigger: '', action: '' },
    ],
    microStep: '',
  })

  function updateForm(patch: Partial<FormState>) {
    setForm((f) => ({ ...f, ...patch }))
  }

  function canAdvance(): boolean {
    if (step === 1) return form.title.trim().length > 0
    if (step === 2) return form.why.trim().length > 0
    if (step === 3) return form.best_outcome.trim().length > 0
    if (step === 4) return form.obstacles.some((o) => o.trim().length > 0)
    if (step === 5) return true
    if (step === 6) return form.microStep.trim().length > 0
    return true
  }

  function goToStep5() {
    const filledObstacles = form.obstacles.filter((o) => o.trim())
    const updated = filledObstacles.map((obs, i) => ({
      trigger: form.ifThen[i]?.trigger || obs,
      action: form.ifThen[i]?.action || '',
    }))
    while (updated.length < 3) updated.push({ trigger: '', action: '' })
    setForm((f) => ({ ...f, ifThen: updated }))
    setStep(5)
  }

  function next() {
    if (step === 4) { goToStep5(); return }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }
  function back() { setStep((s) => Math.max(s - 1, 1)) }

  function generateCharter(): string {
    return `I want to ${form.title.toLowerCase()}${form.why ? ` because ${form.why.toLowerCase().replace(/^i /, '')}` : ''}. Achieving this will feel like: ${form.best_outcome}`
  }

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setError('')
    try {
      const charter = generateCharter()
      const goal = await createGoal(user.id, {
        title: form.title,
        description: form.description,
        category: form.category,
        color: form.color,
        priority: 3,
        why: form.why,
        best_outcome: form.best_outcome,
        motivation_charter: charter,
      })

      const filledObstacles = form.obstacles
        .map((desc, i) => ({ desc, ifThen: form.ifThen[i] }))
        .filter(({ desc }) => desc.trim())

      for (let i = 0; i < filledObstacles.length; i++) {
        const { desc, ifThen } = filledObstacles[i]
        const obstacle = await createObstacle(user.id, goal.id, desc, i)
        if (ifThen?.action?.trim()) {
          await createIfThenPlan(user.id, {
            obstacle_id: obstacle.id,
            goal_id: goal.id,
            trigger_condition: ifThen.trigger || desc,
            action_plan: ifThen.action,
          })
        }
      }

      if (form.microStep.trim()) {
        await createMicroStep(user.id, {
          goal_id: goal.id,
          title: form.microStep,
          description: '',
        })
      }

      onComplete()
      handleClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.somethingWentWrong'))
    } finally {
      setSaving(false)
    }
  }

  function handleClose() {
    setStep(1)
    setForm({
      title: '', category: 'Health', color: COLORS[0], description: '',
      why: '', best_outcome: '',
      obstacles: ['', '', ''],
      ifThen: [{ trigger: '', action: '' }, { trigger: '', action: '' }, { trigger: '', action: '' }],
      microStep: '',
    })
    setError('')
    onClose()
  }

  const filledObstacleCount = form.obstacles.filter((o) => o.trim()).length

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
                {/* Progress bar */}
                <div className="h-1 bg-border">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
                  />
                </div>

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-muted text-xs uppercase tracking-widest">
                      {t('common.stepOf', { step, total: TOTAL_STEPS })}
                    </span>
                    <button onClick={handleClose} className="text-muted hover:text-foreground transition-colors">
                      <X size={20} />
                    </button>
                  </div>

                  {/* Step content */}
                  <div className="min-h-[280px]">
                    {step === 1 && <StepWish form={form} updateForm={updateForm} />}
                    {step === 2 && <StepWhy form={form} updateForm={updateForm} />}
                    {step === 3 && <StepOutcome form={form} updateForm={updateForm} />}
                    {step === 4 && <StepObstacles form={form} updateForm={updateForm} />}
                    {step === 5 && <StepIfThen form={form} updateForm={updateForm} filledCount={filledObstacleCount} />}
                    {step === 6 && <StepMicroStep form={form} updateForm={updateForm} />}
                    {step === 7 && <StepCharter form={form} charter={generateCharter()} />}
                  </div>

                  {error && (
                    <p className="text-danger text-sm mb-4">{error}</p>
                  )}

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-6">
                    <button
                      onClick={back}
                      disabled={step === 1}
                      className="flex items-center gap-1 text-muted hover:text-foreground text-sm disabled:opacity-0 transition-colors"
                    >
                      {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                      {t('common.back')}
                    </button>

                    {step < TOTAL_STEPS ? (
                      <Button onClick={next} disabled={!canAdvance()} size="sm">
                        {t('common.continue')}
                        {isRTL ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                      </Button>
                    ) : (
                      <Button onClick={handleSave} disabled={saving} size="sm">
                        {saving ? t('common.saving') : <><Sparkles size={14} /> {t('woop.saveGoal')}</>}
                      </Button>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

function StepWish({ form, updateForm }: { form: FormState; updateForm: (p: Partial<FormState>) => void }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-foreground font-black text-xl uppercase tracking-widest mb-1">{t('woop.wishTitle')}</h2>
        <p className="text-muted text-sm">{t('woop.wishDesc')}</p>
      </div>
      <input
        autoFocus
        value={form.title}
        onChange={(e) => updateForm({ title: e.target.value })}
        placeholder={t('woop.wishPlaceholder')}
        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:border-accent transition-colors"
      />
      <div>
        <label className="text-muted text-xs uppercase tracking-widest block mb-2">{t('woop.category')}</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_KEYS.map((cat) => (
            <button
              key={cat}
              onClick={() => updateForm({ category: cat })}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                form.category === cat
                  ? 'border-accent text-accent bg-accent/10'
                  : 'border-border text-muted hover:border-muted'
              }`}
            >
              {t(`woop.categories.${cat}`)}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-muted text-xs uppercase tracking-widest block mb-2">{t('woop.color')}</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => updateForm({ color: c })}
              style={{ backgroundColor: c }}
              className={`w-7 h-7 rounded-full transition-transform ${form.color === c ? 'scale-125 ring-2 ring-white/50' : 'hover:scale-110'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function StepWhy({ form, updateForm }: { form: FormState; updateForm: (p: Partial<FormState>) => void }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-foreground font-black text-xl uppercase tracking-widest mb-1">{t('woop.whyTitle')}</h2>
        <p className="text-muted text-sm">{t('woop.whyDesc', { title: form.title })}</p>
      </div>
      <textarea
        autoFocus
        value={form.why}
        onChange={(e) => updateForm({ why: e.target.value })}
        placeholder={t('woop.whyPlaceholder')}
        rows={5}
        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none"
      />
      <p className="text-muted text-xs italic">{t('woop.whyFootnote')}</p>
    </div>
  )
}

function StepOutcome({ form, updateForm }: { form: FormState; updateForm: (p: Partial<FormState>) => void }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-foreground font-black text-xl uppercase tracking-widest mb-1">{t('woop.outcomeTitle')}</h2>
        <p className="text-muted text-sm">{t('woop.outcomeDesc')}</p>
      </div>
      <textarea
        autoFocus
        value={form.best_outcome}
        onChange={(e) => updateForm({ best_outcome: e.target.value })}
        placeholder={t('woop.outcomePlaceholder')}
        rows={5}
        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:border-accent transition-colors resize-none"
      />
      <p className="text-muted text-xs italic">{t('woop.outcomeFootnote')}</p>
    </div>
  )
}

function StepObstacles({ form, updateForm }: { form: FormState; updateForm: (p: Partial<FormState>) => void }) {
  const { t } = useTranslation()
  function setObstacle(i: number, val: string) {
    const updated = [...form.obstacles]
    updated[i] = val
    updateForm({ obstacles: updated })
  }
  const placeholders = [
    t('woop.obstacle1Placeholder'),
    t('woop.obstacle2Placeholder'),
    t('woop.obstacle3Placeholder'),
  ]
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-foreground font-black text-xl uppercase tracking-widest mb-1">{t('woop.obstaclesTitle')}</h2>
        <p className="text-muted text-sm">{t('woop.obstaclesDesc')}</p>
      </div>
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-muted text-xs font-bold w-4">{i + 1}.</span>
            <input
              value={form.obstacles[i]}
              onChange={(e) => setObstacle(i, e.target.value)}
              placeholder={placeholders[i]}
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-foreground placeholder-muted text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function StepIfThen({ form, updateForm, filledCount }: { form: FormState; updateForm: (p: Partial<FormState>) => void; filledCount: number }) {
  const { t } = useTranslation()
  function setIfThen(i: number, field: 'trigger' | 'action', val: string) {
    const updated = form.ifThen.map((it, idx) => idx === i ? { ...it, [field]: val } : it)
    updateForm({ ifThen: updated })
  }
  const pairs = form.obstacles
    .map((obs, i) => ({ obs, ifThen: form.ifThen[i] }))
    .filter(({ obs }) => obs.trim())

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-foreground font-black text-xl uppercase tracking-widest mb-1">{t('woop.plansTitle')}</h2>
        <p className="text-muted text-sm">{t('woop.plansDesc')}</p>
      </div>
      <div className="space-y-4">
        {pairs.map(({ obs, ifThen }, i) => (
          <div key={i} className="bg-background border border-border rounded-lg p-4 space-y-3">
            <p className="text-muted text-xs uppercase tracking-widest">
              {t('woop.obstacleLabel')}: <span className="text-foreground normal-case">{obs}</span>
            </p>
            <div className="space-y-2">
              <div>
                <label className="text-accent text-xs font-bold uppercase tracking-widest">{t('common.ifEllipsis')}</label>
                <input
                  value={ifThen?.trigger ?? ''}
                  onChange={(e) => setIfThen(i, 'trigger', e.target.value)}
                  placeholder={obs}
                  className="w-full mt-1 bg-surface border border-border rounded px-3 py-2 text-foreground text-sm placeholder-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="text-success text-xs font-bold uppercase tracking-widest">{t('common.thenIWill')}</label>
                <input
                  value={ifThen?.action ?? ''}
                  onChange={(e) => setIfThen(i, 'action', e.target.value)}
                  placeholder={t('woop.thenPlaceholder')}
                  className="w-full mt-1 bg-surface border border-border rounded px-3 py-2 text-foreground text-sm placeholder-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {filledCount === 0 && <p className="text-muted text-sm">{t('woop.noObstacles')}</p>}
    </div>
  )
}

function StepMicroStep({ form, updateForm }: { form: FormState; updateForm: (p: Partial<FormState>) => void }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-foreground font-black text-xl uppercase tracking-widest mb-1">{t('woop.microStepTitle')}</h2>
        <p className="text-muted text-sm">
          {t('woop.microStepDesc', { title: form.title })}
        </p>
      </div>
      <input
        autoFocus
        value={form.microStep}
        onChange={(e) => updateForm({ microStep: e.target.value })}
        placeholder={t('woop.microStepPlaceholder')}
        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:border-accent transition-colors"
      />
      <p className="text-muted text-xs italic">{t('woop.microStepFootnote')}</p>
    </div>
  )
}

function StepCharter({ form, charter }: { form: FormState; charter: string }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-foreground font-black text-xl uppercase tracking-widest mb-1">{t('woop.charterTitle')}</h2>
        <p className="text-muted text-sm">{t('woop.charterDesc')}</p>
      </div>
      <div
        className="rounded-xl p-5 border-s-4 space-y-3"
        style={{ borderColor: form.color, backgroundColor: `${form.color}15` }}
      >
        <p className="text-foreground font-bold text-base">{form.title}</p>
        <p className="text-foreground/80 text-sm leading-relaxed">{charter}</p>
        {form.microStep && (
          <p className="text-muted text-xs mt-3">
            {t('woop.dailyMicroStep')} <span className="text-foreground">{form.microStep}</span>
          </p>
        )}
      </div>
      <p className="text-muted text-xs">{t('woop.charterFootnote')}</p>
    </div>
  )
}
