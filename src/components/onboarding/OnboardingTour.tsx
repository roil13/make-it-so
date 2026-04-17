import { useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Zap, Target, Lightbulb, BookOpen, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../shared/Button'

const slideIcons = [Zap, Target, Lightbulb, BookOpen, Sparkles]

interface Props {
  open: boolean
  onClose: () => void
  onStartGoal: () => void
}

export function OnboardingTour({ open, onClose, onStartGoal }: Props) {
  const { t } = useTranslation()
  const [step, setStep] = useState(0)

  const total = slideIcons.length
  const Icon = slideIcons[step]
  const isLast = step === total - 1

  function handleClose() {
    setStep(0)
    onClose()
  }

  function handleStartGoal() {
    setStep(0)
    onStartGoal()
  }

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={handleClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-muted text-xs uppercase tracking-widest">
                  {t('common.stepOf', { step: step + 1, total })}
                </span>
                <button
                  onClick={handleClose}
                  className="text-muted hover:text-foreground transition-colors text-xs uppercase tracking-widest"
                >
                  {t('common.skip')}
                </button>
              </div>

              {/* Progress bar */}
              <div className="flex gap-1.5 mb-8">
                {slideIcons.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      i <= step ? 'bg-accent' : 'bg-border'
                    }`}
                  />
                ))}
              </div>

              {/* Slide content */}
              <div className="min-h-[220px] flex flex-col items-center text-center space-y-4 mb-8">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center">
                  <Icon className="text-accent" size={32} />
                </div>
                <h2 className="text-foreground font-black text-lg uppercase tracking-widest">
                  {t(`onboarding.slides.${step}.title`)}
                </h2>
                <p className="text-muted text-sm leading-relaxed max-w-sm">
                  {t(`onboarding.slides.${step}.body`)}
                </p>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep((s) => s - 1)}
                  disabled={step === 0}
                >
                  {t('common.back')}
                </Button>
                <div className="flex-1" />
                {isLast ? (
                  <Button size="sm" onClick={handleStartGoal}>
                    {t('onboarding.setupGoal')}
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setStep((s) => s + 1)}>
                    {t('common.next')}
                  </Button>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
